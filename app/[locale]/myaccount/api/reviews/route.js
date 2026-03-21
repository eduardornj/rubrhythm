import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET - Fetch all reviews for the logged-in provider's listings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all listings owned by this provider
    const listings = await prisma.listing.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true, city: true, state: true, averageRating: true, totalReviews: true },
    });

    if (listings.length === 0) {
      return NextResponse.json({
        reviews: [],
        stats: { total: 0, approved: 0, pending: 0, averageRating: 0 },
        listings: [],
      });
    }

    const listingIds = listings.map((l) => l.id);

    // Get all reviews for these listings
    const [reviews, countByStatus] = await Promise.all([
      prisma.review.findMany({
        where: { listingId: { in: listingIds } },
        include: {
          user_review_reviewerIdTouser: {
            select: { id: true, name: true, verified: true },
          },
          listing: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.review.groupBy({
        by: ["status"],
        where: { listingId: { in: listingIds } },
        _count: { id: true },
      }),
    ]);

    // Build stats
    const statusCounts = countByStatus.reduce((acc, c) => {
      acc[c.status] = c._count.id;
      return acc;
    }, {});

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const approvedReviews = reviews.filter((r) => r.status === "approved");
    const averageRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

    // Strip reviewer identity for anonymous reviews
    const safeReviews = reviews.map((r) => ({
      ...r,
      user_review_reviewerIdTouser: r.isAnonymous ? null : r.user_review_reviewerIdTouser,
    }));

    return NextResponse.json({
      reviews: safeReviews,
      stats: {
        total,
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        rejected: statusCounts.rejected || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      listings,
    });
  } catch (error) {
    console.error("[API] MyAccount Reviews Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
