import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma";
import { randomUUID } from "crypto";
import { sendReviewNotificationEmail } from "@/lib/email";

// GET - Buscar reviews de um listing
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  const status = searchParams.get("status") || "approved";

  if (!listingId) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        listingId,
        status,
      },
      include: {
        user_review_reviewerIdTouser: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Strip reviewer identity for anonymous reviews
    const filteredReviews = reviews.map(review => ({
      ...review,
      user_review_reviewerIdTouser: review.isAnonymous ? null : review.user_review_reviewerIdTouser,
    }));

    return NextResponse.json({ reviews: filteredReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Criar um novo review
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId, rating, comment, isAnonymous } = await request.json();
  const reviewerId = session.user.id;

  if (!listingId || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    // Verificar se o usuário já fez review para este listing
    const existingReview = await prisma.review.findFirst({
      where: { listingId, reviewerId },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this listing" }, { status: 400 });
    }

    // Fetch reviewer + listing info in parallel
    const [user, listing] = await Promise.all([
      prisma.user.findUnique({
        where: { id: reviewerId },
        select: { verified: true, name: true },
      }),
      prisma.listing.findUnique({
        where: { id: listingId },
        select: { userId: true, title: true },
      }),
    ]);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        id: randomUUID(),
        listingId,
        reviewerId,
        rating,
        comment: comment || null,
        isAnonymous: isAnonymous ?? true,
        isVerified: user?.verified || false,
        status: "pending",
        updatedAt: new Date(),
      },
    });

    // Auto-notify the provider
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: listing.userId,
        title: "New Review Received!",
        body: `Someone left a ${stars} (${rating}/5) review on your listing "${listing.title || "Untitled"}". It will be visible after admin approval.`,
        type: "success",
        isRead: false,
      },
    }).catch((e) => console.error("[Auto-notif] Review notification failed:", e));

    // Send email to provider (non-blocking)
    const provider = await prisma.user.findUnique({ where: { id: listing.userId }, select: { email: true, name: true } }).catch(() => null);
    if (provider?.email) {
      sendReviewNotificationEmail(provider.email, provider.name || "Provider", listing.title || "Untitled", rating).catch(() => {});
    }

    return NextResponse.json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// PUT - Atualizar status de um review (admin only)
export async function PUT(request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { reviewId, status } = await request.json();

  if (!reviewId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {

    // Atualizar o review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    // Se aprovado, atualizar estatísticas do listing
    if (status === "approved") {
      await updateListingStats(review.listingId);
    }

    return NextResponse.json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// Função auxiliar para atualizar estatísticas do listing
async function updateListingStats(listingId) {
  try {
    const stats = await prisma.review.aggregate({
      where: {
        listingId,
        status: "approved",
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id || 0,
      },
    });
  } catch (error) {
    console.error("Error updating listing stats:", error);
  }
}