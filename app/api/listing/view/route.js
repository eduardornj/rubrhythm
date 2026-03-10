import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function POST(request) {
  try {
    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json({ success: false, error: "Missing listingId" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, title: true, city: true, state: true },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    // Increment viewCount
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    // Rate limit: skip notification if one was sent in the last hour
    const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS);
    const recentNotificationCount = await prisma.usernotification.count({
      where: {
        userId: listing.userId,
        actionUrl: "/myaccount/listings",
        title: "Someone viewed your listing",
        createdAt: { gt: oneHourAgo },
      },
    });

    if (recentNotificationCount === 0) {
      await prisma.usernotification.create({
        data: {
          id: uuidv4(),
          userId: listing.userId,
          title: "Someone viewed your listing",
          message: `Your listing "${listing.title}" in ${listing.city} received a new profile view.`,
          type: "info",
          priority: "low",
          actionUrl: "/myaccount/listings",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[listing/view] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
