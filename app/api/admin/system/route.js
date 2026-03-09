import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Prisma Decimal fields serialize as strings/objects — convert to plain float
const toNum = (val) => (val != null ? parseFloat(val) : 0);

// GET - Unified Admin System Dashboard Data (MCP-Ready)
export async function GET(request) {
    try {
        const session = await auth();

        // Standard MCP Error Response for Unauthorized
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Acesso negado. Requer privilégios de administrador."
                    }
                },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';

        // Calculate date boundaries
        const now = new Date();
        const daysToSubtract = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
        const startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

        // Parallel execution for maximum performance (MCP Best Practice)
        const [
            totalUsers,
            activeProviders,
            pendingVerifications,
            totalListings,
            activeListings,
            pendingListings,
            pendingReviews,
            totalCreditsRow
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'provider', isBanned: false } }),
            prisma.verificationrequest.count({ where: { status: 'pending' } }),
            prisma.listing.count(),
            prisma.listing.count({ where: { isActive: true, isApproved: true } }),
            prisma.listing.count({ where: { isApproved: false } }),
            prisma.review.count({ where: { status: 'pending' } }),
            prisma.user.aggregate({ _sum: { credits: true } })
        ]);

        // Financial calculations (Escrow & Revenue)
        let totalEscrowAmount = 0;
        let pendingEscrows = 0;
        let disputedEscrows = 0;
        let totalRevenue = 0;

        try {
            const escrowStats = await Promise.all([
                prisma.escrow.count({ where: { status: 'pending' } }),
                prisma.escrow.count({ where: { status: 'disputed' } }),
                prisma.escrow.aggregate({ _sum: { amount: true } }),
                prisma.transaction.aggregate({ _sum: { amount: true } }),
                // Sum all credit purchases (positive inflows)
                prisma.credittransaction.aggregate({
                    _sum: { amount: true },
                    where: { amount: { gt: 0 }, type: { in: ['purchase', 'admin_bonus', 'referral_bonus'] } }
                }),
                // Sum all credit spending (negative outflows = actual revenue)
                prisma.credittransaction.aggregate({
                    _sum: { amount: true },
                    where: { amount: { lt: 0 } }
                })
            ]);
            pendingEscrows = escrowStats[0];
            disputedEscrows = escrowStats[1];
            totalEscrowAmount = toNum(escrowStats[2]._sum.amount);
            totalRevenue = toNum(escrowStats[3]._sum.amount);
            const creditPurchases = toNum(escrowStats[4]._sum.amount);
            const creditSpending = Math.abs(toNum(escrowStats[5]._sum.amount));
            // If transaction table is empty, use credit data instead
            if (totalRevenue === 0) totalRevenue = creditPurchases;
        } catch (e) { /* Escrow might be empty or migrating */ }

        // Fetch urgency queue (Top 5 items that need admin action immediately)
        const urgentVerifications = await prisma.verificationrequest.findMany({
            where: { status: 'pending' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
                user: { select: { name: true, email: true } }
            }
        });

        const urgentListings = await prisma.listing.findMany({
            where: { isApproved: false },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, city: true, state: true, createdAt: true }
        });

        // Formatting standard MCP-Ready Data Payload
        const dataResponse = {
            overview: {
                users: { total: totalUsers, providers: activeProviders },
                listings: { total: totalListings, active: activeListings, pending: pendingListings },
                financial: {
                    totalCreditsInSystem: toNum(totalCreditsRow._sum.credits),
                    totalRevenue,
                    pendingEscrows,
                    disputedEscrows,
                    totalEscrowAmount
                }
            },
            actionQueue: {
                pendingVerificationsCount: pendingVerifications,
                pendingReviewsCount: pendingReviews,
                urgentTasks: {
                    verifications: urgentVerifications,
                    listings: urgentListings
                }
            }
        };

        return NextResponse.json({
            success: true,
            data: dataResponse,
            metadata: {
                timestamp: new Date().toISOString(),
                rangeFiltered: range
            }
        });

    } catch (error) {
        console.error('[API] Admin System Route Error:', error);
        // Standard MCP Server Error
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Falha catastrófica ao buscar dados do sistema do Admin.",
                    details: error.message
                }
            },
            { status: 500 }
        );
    }
}
