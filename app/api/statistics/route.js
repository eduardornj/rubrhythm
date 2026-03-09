import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

export async function GET(request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    // Basic counts
    const totalUsers = await prisma.user.count();
    const totalListings = await prisma.listing.count();
    const verifiedUsers = await prisma.user.count({ where: { verified: true } });
    const approvedListings = await prisma.listing.count({ where: { isApproved: true } });
    const featuredListings = await prisma.listing.count({ where: { isFeatured: true } });
    const pendingVerifications = await prisma.verificationRequest.count({ where: { status: "pending" } });
    const pendingListings = await prisma.listing.count({ where: { isApproved: false } });

    // Review statistics
    const totalReviews = await prisma.review.count({ where: { status: "approved" } });
    const averageRatingResult = await prisma.review.aggregate({
      where: { status: "approved" },
      _avg: { rating: true }
    });
    const averageRating = averageRatingResult._avg.rating || 0;

    // Growth metrics (comparing with previous period - simplified for now)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousUsers = await prisma.user.count({
      where: { createdAt: { lt: thirtyDaysAgo } }
    });
    
    const previousListings = await prisma.listing.count({
      where: { createdAt: { lt: thirtyDaysAgo } }
    });

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