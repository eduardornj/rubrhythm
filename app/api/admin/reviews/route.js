import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

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
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const where = status === "all" ? {} : { status };

    const [reviews, statsRaw, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user_review_reviewerIdTouser: { select: { id: true, name: true, email: true, verified: true } },
          listing: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.review.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.review.count({ where })
    ]);

    const stats = statsRaw.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      data: { reviews, stats },
      metadata: {
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[API] Admin Reviews GET Error:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao buscar reviews." }
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Acesso negado." }
      }, { status: 401 });
    }

    const { reviewId, status, reason } = await request.json();

    if (!reviewId || !status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ID do review e status válido são obrigatórios." }
      }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        rejectionReason: status === "rejected" ? reason : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      },
      include: {
        listing: { select: { id: true, title: true } },
        user_review_reviewerIdTouser: { select: { id: true, name: true } }
      }
    });

    if (status === "approved") {
      await updateListingStats(review.listingId);
    }

    if (status !== "pending" && review.reviewerId) {
      await prisma.notification.create({
        data: {
          id: randomUUID(),
          userId: review.reviewerId,
          title: status === "approved" ? "Review Approved" : "Review Rejected",
          body: status === "approved"
            ? `Your review for "${review.listing.title}" was approved and is now publicly visible.`
            : `Your review for "${review.listing.title}" was rejected. ${reason || ""}`,
          type: status === "approved" ? "success" : "warning",
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: { reviewId: review.id, status: review.status, message: `Review ${status} com sucesso.` },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error("[API] Admin Reviews PUT Error:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao atualizar review." }
    }, { status: 500 });
  }
}

async function updateListingStats(listingId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { listingId, status: "approved" },
      select: { rating: true }
    });

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length
        }
      });
    }
  } catch (error) {
    console.error("[Utility] Error updating listing stats:", error);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ID do review é obrigatório." }
      }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { deletedId: id, message: "Avaliação deletada permanentemente." },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error("[API] Admin Reviews DELETE Error:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao deletar review." }
    }, { status: 500 });
  }
}