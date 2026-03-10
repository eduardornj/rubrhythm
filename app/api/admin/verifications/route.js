import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationApprovedEmail } from '@/lib/email';

// GET - List pending verifications (MCP-Ready Array)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Acesso negado' }
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [verifications, total, counts] = await Promise.all([
      prisma.verificationrequest.findMany({
        where: { status },
        include: {
          user: {
            select: { id: true, name: true, email: true, createdAt: true, verified: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.verificationrequest.count({ where: { status } }),
      prisma.verificationrequest.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    const resolveImageUrl = (rawUrl) => {
      if (!rawUrl) return { url: null, isLegacy: false };
      // Already a full blob/external URL — use directly
      if (rawUrl.startsWith('http')) return { url: rawUrl, isLegacy: false };
      // Everything else is legacy (local filesystem paths, /api/secure-files references)
      // These files don't exist on Vercel anymore
      if (rawUrl.startsWith('/api/')) return { url: rawUrl, isLegacy: true };
      if (rawUrl.includes('path=')) {
        const urlObj = new URL(rawUrl, 'http://localhost');
        const innerPath = urlObj.searchParams.get('path');
        if (innerPath?.startsWith('http')) return { url: innerPath, isLegacy: false };
        return { url: `/api/secure-files?path=${encodeURIComponent(innerPath)}&type=verification`, isLegacy: true };
      }
      return { url: `/api/secure-files?path=${encodeURIComponent(rawUrl)}&type=verification`, isLegacy: true };
    };

    // Format for frontend
    const formattedVerifications = verifications.map(v => {
      return {
        id: v.id,
        userId: v.userId,
        userName: v.user?.name || "Sem Nome",
        userEmail: v.user?.email || "Sem Email",
        status: v.status,
        submittedAt: v.createdAt,
        reviewedAt: v.reviewedAt,
        notes: v.rejectionReason,
        documents: [
          {
            type: "id",
            name: "Documento de Identidade",
            ...resolveImageUrl(v.documentPath)
          },
          {
            type: "selfie",
            name: "Selfie com Documento",
            ...resolveImageUrl(v.selfiePath)
          }
        ].filter(d => d.url !== null)
      }
    });

    // Parse counts manually since Prisma groupby needs reducing
    const stats = counts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      data: {
        verifications: formattedVerifications,
        stats
      },
      metadata: {
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[API] Admin Verifications GET Error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao buscar verificações.' }
    }, { status: 500 });
  }
}

// PUT - Approve/Reject verification (MCP-Ready Action)
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Acesso negado' }
      }, { status: 403 });
    }

    const { verificationId, action, rejectionReason } = await request.json();

    if (!verificationId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Dados inválidos ou ação desconhecida' }
      }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Motivo da rejeição é obrigatório' }
      }, { status: 400 });
    }

    const verification = await prisma.verificationrequest.findUnique({
      where: { id: verificationId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!verification || verification.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND_OR_PROCESSED', message: 'Verificação não encontrada ou já processada.' }
      }, { status: 404 });
    }

    // Heavy DB Transaction block for state safety
    const [updatedVerification] = await prisma.$transaction([
      prisma.verificationrequest.update({
        where: { id: verificationId },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          rejectionReason: action === 'reject' ? rejectionReason : null
        }
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: {
          verified: action === 'approve',
          ...(action === 'approve' && verification.selfiePath ? {
            image: verification.selfiePath.startsWith('http') ? verification.selfiePath
              : verification.selfiePath.startsWith('/api/') ? verification.selfiePath
              : `/api/secure-files?path=${encodeURIComponent(verification.selfiePath)}&type=verification`
          } : {})
        }
      }),
      prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: verification.userId,
          title: action === 'approve' ? 'Verificação Aprovada!' : 'Verificação Rejeitada',
          body: action === 'approve'
            ? 'Sua conta foi verificada com sucesso. Agora você pode acessar todos os recursos.'
            : `Sua verificação foi rejeitada. Motivo: ${rejectionReason}`,
          type: action === 'approve' ? 'success' : 'warning',
          createdAt: new Date()
        }
      }),
      prisma.securitylog.create({
        data: {
          id: crypto.randomUUID(),
          type: 'verification_review', severity: 'medium',
          message: `Admin ${session.user.email} ${action === 'approve' ? 'aprovou' : 'rejeitou'} verificação de ${verification.user.email}`,
          details: { adminId: session.user.id, verificationId, userId: verification.userId, action, rejectionReason: rejectionReason || null },
          userId: session.user.id, createdAt: new Date()
        }
      })
    ]);

    // Send email on approval (non-blocking)
    if (action === 'approve' && verification.user?.email) {
      sendVerificationApprovedEmail(verification.user.email, verification.user.name || "Provider").catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        verificationId: updatedVerification.id,
        status: updatedVerification.status,
        message: `Verificação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`
      },
      metadata: { timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('[API] Admin Verifications PUT Error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro interno ao processar verificação' }
    }, { status: 500 });
  }
}

// POST - Request additional review info (MCP-Ready Action)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Acesso negado' }
      }, { status: 403 });
    }

    const { verificationId, message } = await request.json();

    if (!verificationId || !message) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'ID da verificação e mensagem são obrigatórios' }
      }, { status: 400 });
    }

    const verification = await prisma.verificationrequest.findUnique({
      where: { id: verificationId }
    });

    if (!verification) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Verificação não encontrada' }
      }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.verificationrequest.update({
        where: { id: verificationId },
        data: {
          status: 'needs_review',
          rejectionReason: message
        }
      }),
      prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: verification.userId,
          title: 'Documentos Precisam de Revisão',
          body: `Por favor, revise seus documentos de verificação. Observação: ${message}`,
          type: 'info',
          createdAt: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: { message: 'Solicitação de revisão enviada com sucesso' },
      metadata: { timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('[API] Admin Verifications POST Error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao solicitar revisão' }
    }, { status: 500 });
  }
}