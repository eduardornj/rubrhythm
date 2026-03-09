import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Acesso negado." }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const roleMatch = searchParams.get("role") || undefined;
    const skip = (page - 1) * limit;

    const whereClause = roleMatch ? { role: roleMatch } : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verified: true,
          isBanned: true,
          credits: true,
          createdAt: true,
          // CRITICAL SECURITY UPDATE: password removed.
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      metadata: {
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[API] Admin Users GET Error:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar usuários." }
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Acesso negado." }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ID do usuário é obrigatório." }
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: "NOT_FOUND", message: "Usuário não encontrado." }
      }, { status: 404 });
    }

    // Protect other admins from deletion
    if (user.role === "admin" && user.id !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: { code: "FORBIDDEN", message: "Não é permitido deletar outros administradores." }
      }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      data: { deletedUserId: userId, message: "Usuário deletado com sucesso." }
    });
  } catch (error) {
    console.error("[API] Admin Users DELETE Error:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar usuário." }
    }, { status: 500 });
  }
}

// POST - Moderação de Usuários (Ban, Verifica, Feature) - MCP-Ready
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Acesso negado." }
      }, { status: 401 });
    }

    const { userId, action, value, duration } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ID do usuário e ação são obrigatórios." }
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: "NOT_FOUND", message: "Usuário não encontrado." }
      }, { status: 404 });
    }

    if (action === "ban" && user.role === "admin" && user.id !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: { code: "FORBIDDEN", message: "Não é possível banir outros administradores." }
      }, { status: 403 });
    }

    let updateData = {};
    let message = "";

    switch (action) {
      case "ban":
        updateData.isBanned = value;
        message = value ? "Usuário banido com sucesso" : "Usuário desbanido com sucesso";
        break;
      case "verify":
        updateData.verified = value;
        message = value ? "Usuário verificado com sucesso" : "Usuário desverificado com sucesso";
        break;
      case "feature":
        updateData.isFeatured = value;
        if (value && duration) {
          const featuredEndDate = new Date();
          featuredEndDate.setDate(featuredEndDate.getDate() + duration);
          updateData.featuredEndDate = featuredEndDate;
          message = `Usuário destacado por ${duration} dias`;
        } else if (value) {
          updateData.featuredEndDate = null;
          message = "Usuário destacado permanentemente";
        } else {
          updateData.featuredEndDate = null;
          message = "Destaque removido";
        }
        break;
      default:
        return NextResponse.json({
          success: false,
          error: { code: "BAD_REQUEST", message: "Ação de moderação inválida." }
        }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: { message, updatedUserId: userId },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error("[API] Admin Users POST Error:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao executar ação de moderação." }
    }, { status: 500 });
  }
}