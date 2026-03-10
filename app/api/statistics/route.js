import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

export async function GET(request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all independent counts in parallel (was 11 sequential queries)
    const [
      totalUsers,
      totalListings,
      verifiedUsers,
      approvedListings,
      featuredListings,
      pendingVerifications,
      pendingListings,
      totalReviews,
      averageRatingResult,
      previousUsers,
      previousListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.user.count({ where: { verified: true } }),
      prisma.listing.count({ where: { isApproved: true } }),
      prisma.listing.count({ where: { isFeatured: true } }),
      prisma.verificationrequest.count({ where: { status: "pending" } }),
      prisma.listing.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { status: "approved" } }),
      prisma.review.aggregate({ where: { status: "approved" }, _avg: { rating: true } }),
      prisma.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
      prisma.listing.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
    ]);

    const averageRating = averageRatingResult._avg.rating || 0;

    return NextResponse.json({
      totalUsers,
      totalListings,
      verifiedUsers,
      approvedListings,
      featuredListings,
      pendingVerifications,
      pendingListings,
      totalReviews,
      averageRating,
      previousUsers,
      previousListings,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}