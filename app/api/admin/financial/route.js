import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Unified Admin Financial Data (MCP-Ready)
export async function GET(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Acesso negado.' }
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const view = searchParams.get('view') || 'escrows'; // 'escrows' | 'credits'

        // --- VIEW: ESCROWS ---
        if (view === 'escrows') {
            const status = searchParams.get('status');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 50;
            const skip = (page - 1) * limit;

            const where = status && status !== 'all' ? { status } : {};

            const [total, escrows, statsRaw] = await Promise.all([
                prisma.escrow.count({ where }),
                prisma.escrow.findMany({
                    where,
                    include: {
                        client: { select: { id: true, name: true, email: true, verified: true } },
                        provider: { select: { id: true, name: true, email: true, verified: true } },
                        listing: { select: { id: true, title: true, city: true, state: true } },
                        // Keeping logs out of the main list to save bandwidth, can be fetched specifically via ID later
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.escrow.groupBy({
                    by: ['status'],
                    _count: { id: true },
                    _sum: { amount: true }
                })
            ]);

            const summary = statsRaw.reduce((acc, stat) => {
                acc[stat.status] = { count: stat._count.id, value: parseFloat(stat._sum.amount || 0) };
                return acc;
            }, {});

            return NextResponse.json({
                success: true,
                data: { escrows, summary },
                metadata: {
                    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
                    timestamp: new Date().toISOString()
                }
            });
        }

        // --- VIEW: USER CREDITS ---
        if (view === 'credits') {
            const userId = searchParams.get('userId');
            if (!userId) {
                return NextResponse.json({
                    success: false,
                    error: { code: 'BAD_REQUEST', message: 'User ID é obrigatório para visualização de créditos.' }
                }, { status: 400 });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { creditBalance: true, creditTransaction: { orderBy: { createdAt: 'desc' }, take: 20 } }
            });

            if (!user) {
                return NextResponse.json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Usuário não encontrado.' }
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: {
                    email: user.email,
                    balance: user.creditBalance?.balance || 0,
                    recentTransactions: user.credittransaction
                },
                metadata: { timestamp: new Date().toISOString() }
            });
        }

        // Invalid View
        return NextResponse.json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Visualização inválida. Use view=escrows ou view=credits.' }
        }, { status: 400 });

    } catch (error) {
        console.error('[API] Admin Financial GET Error:', error);
        return NextResponse.json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro interno ao processar dados financeiros.' }
        }, { status: 500 });
    }
}

// POST - Unified Admin Financial Actions (MCP-Ready)
export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Acesso negado.' }
            }, { status: 401 });
        }

        const body = await request.json();
        const { action, type } = body;

        if (!action || !type) {
            return NextResponse.json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'Action e Type (escrow/credit) são obrigatórios.' }
            }, { status: 400 });
        }

        // --- ESCROW ACTIONS ---
        if (type === 'escrow') {
            const { escrowIds, reason } = body;
            if (!Array.isArray(escrowIds)) throw new Error('escrowIds deve ser array');

            const results = [];
            const errors = [];

            // Refactored logic to be more compact but still secure
            for (const escrowId of escrowIds) {
                try {
                    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });
                    if (!escrow) { errors.push({ id: escrowId, message: 'Não encontrado' }); continue; }

                    let newStatus = escrow.status;
                    let updateData = {};

                    if (action === 'force_complete' || action === 'resolve_dispute') {
                        if (action === 'force_complete' && !['funded', 'in_progress', 'disputed'].includes(escrow.status)) throw new Error('Não pode completar neste status');
                        if (action === 'resolve_dispute' && escrow.status !== 'disputed') throw new Error('Não está em disputa');

                        newStatus = 'completed';
                        updateData = { completedAt: new Date(), releasedAt: new Date(), resolvedAt: new Date(), resolvedBy: session.user.id };

                        // Process payment to provider
                        await prisma.$transaction([
                            prisma.creditbalance.upsert({
                                where: { userId: escrow.providerId },
                                update: { balance: { increment: escrow.amount } },
                                create: { userId: escrow.providerId, balance: escrow.amount, id: `cb_${Date.now()}` }
                            }),
                            prisma.credittransaction.create({
                                data: {
                                    id: `ct_admin_esc_${Date.now()}`,
                                    userId: escrow.providerId, type: 'escrow_received', amount: escrow.amount,
                                    description: `Admin ${action}: ${escrow.description || 'Liberação Forçada'}`, relatedId: escrowId
                                }
                            })
                        ]);
                    }
                    else if (action === 'force_refund') {
                        if (!['funded', 'in_progress', 'disputed', 'cancelled'].includes(escrow.status)) throw new Error('Não pode reembolsar neste status');

                        newStatus = 'refunded';
                        updateData = { refundedAt: new Date(), resolvedAt: new Date(), resolvedBy: session.user.id };

                        // Refund to client
                        await prisma.$transaction([
                            prisma.creditbalance.upsert({
                                where: { userId: escrow.clientId },
                                update: { balance: { increment: escrow.amount } },
                                create: { userId: escrow.clientId, balance: escrow.amount, id: `cb_${Date.now()}` }
                            }),
                            prisma.credittransaction.create({
                                data: {
                                    id: `ct_admin_ref_${Date.now()}`,
                                    userId: escrow.clientId, type: 'escrow_refund', amount: escrow.amount,
                                    description: `Admin Refund: ${escrow.description || 'Reembolso Forçado'}`, relatedId: escrowId
                                }
                            })
                        ]);
                    }

                    // Apply DB Update
                    await prisma.escrow.update({ where: { id: escrowId }, data: { status: newStatus, ...updateData } });
                    await prisma.escrowlog.create({
                        data: { escrowId, userId: session.user.id, action: `admin_${action}`, details: reason || 'Ação Admin', previousStatus: escrow.status, newStatus }
                    });

                    results.push({ id: escrowId, status: newStatus });
                } catch (e) {
                    errors.push({ id: escrowId, message: e.message });
                }
            }

            return NextResponse.json({
                success: true,
                data: { results, errors },
                metadata: { timestamp: new Date().toISOString() }
            });
        }

        // --- DIRECT CREDIT INJECTION (adjust-credits) ---
        if (type === 'adjust_credits') {
            const { userId, amount, reason } = body;
            if (!userId || !amount) throw new Error('userId e amount requeridos');

            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: amount } }
                }),
                prisma.creditbalance.upsert({
                    where: { userId },
                    update: { balance: { increment: amount } },
                    create: { userId, balance: amount, id: `cb_${Date.now()}` }
                }),
                prisma.credittransaction.create({
                    data: {
                        id: `ct_admin_adj_${Date.now()}`,
                        userId, type: amount > 0 ? 'admin_bonus' : 'admin_penalty', amount,
                        description: reason || 'Ajuste Manual do Administrador'
                    }
                })
            ]);

            return NextResponse.json({
                success: true,
                data: { message: 'Créditos ajustados com sucesso', amountApplied: amount }
            });
        }

        return NextResponse.json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Tipo de ação contábil inválida.' }
        }, { status: 400 });

    } catch (error) {
        console.error('[API] Admin Financial POST Error:', error);
        return NextResponse.json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao processar ação financeira.', details: error.message }
        }, { status: 500 });
    }
}
