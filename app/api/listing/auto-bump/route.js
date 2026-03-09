import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId: session.user.id,
        isApproved: true,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        autoBumpEnabled: true,
        autoBumpHour: true,
        lastBumpUp: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Auto-bump status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch auto-bump status" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, enabled, hour } = await request.json();

    if (!listingId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "listingId (string) and enabled (boolean) are required" },
        { status: 400 }
      );
    }

    if (enabled && hour !== undefined) {
      if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        return NextResponse.json(
          { error: "hour must be an integer between 0 and 23" },
          { status: 400 }
        );
      }
    }

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        isApproved: true,
        isActive: true,
        autoBumpEnabled: true,
        autoBumpHour: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or not authorized" },
        { status: 404 }
      );
    }

    if (!listing.isApproved || !listing.isActive) {
      return NextResponse.json(
        { error: "Listing must be approved and active to enable auto-bump" },
        { status: 400 }
      );
    }

    if (enabled) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      const currentBalance = user?.credits || 0;

      if (currentBalance < 5) {
        return NextResponse.json(
          {
            error: "Insufficient credits. Auto-bump costs 5 credits per day.",
            required: 5,
            available: currentBalance,
            redirectToPayment: true,
          },
          { status: 402 }
        );
      }
    }

    const bumpHour = enabled ? (hour !== undefined ? hour : listing.autoBumpHour ?? 12) : listing.autoBumpHour;

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        autoBumpEnabled: enabled,
        autoBumpHour: bumpHour,
      },
      select: {
        id: true,
        title: true,
        autoBumpEnabled: true,
        autoBumpHour: true,
        lastBumpUp: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: enabled
        ? `Auto-bump enabled for "${updated.title}" at ${String(bumpHour).padStart(2, "0")}:00 UTC daily`
        : `Auto-bump disabled for "${updated.title}"`,
      listing: updated,
    });
  } catch (error) {
    console.error("Auto-bump toggle error:", error);
    return NextResponse.json(
      { error: "Failed to update auto-bump settings" },
      { status: 500 }
    );
  }
}
