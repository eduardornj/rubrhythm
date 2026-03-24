import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingIds, highlightDays = 7, autoRenew } = await request.json();

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: "Listing IDs array is required" }, { status: 400 });
    }

    const HIGHLIGHT_COST = 15.0; // $15 flat rate per listing
    const totalCost = listingIds.length * HIGHLIGHT_COST;

    // Verify all listings belong to the user
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId: session.user.id
      }
    });

    if (listings.length !== listingIds.length) {
      return NextResponse.json({ error: "Some listings were not found or unauthorized" }, { status: 404 });
    }

    // Calculate highlight end date
    const highlightEndDate = new Date();
    highlightEndDate.setDate(highlightEndDate.getDate() + highlightDays);

    // Process highlight and deduct credits in a transaction (balance check inside to prevent TOCTOU race)
    const result = await prisma.$transaction(async (tx) => {
      // Verify credits atomically inside transaction
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      const currentBalance = user?.credits || 0;
      if (currentBalance < totalCost) {
        throw new Error(`INSUFFICIENT_CREDITS:${currentBalance}`);
      }

      // Deduct from single source of truth (user.credits)
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: totalCost } }
      });

      // Keep creditbalance in sync, create if missing
      await tx.creditbalance.upsert({
        where: { userId: session.user.id },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${Date.now()}`, userId: session.user.id, balance: updatedUser.credits }
      });

      // Register credit transactions and update listings
      for (const listing of listings) {
        await tx.credittransaction.create({
          data: {
            id: `ct_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: session.user.id,
            amount: -HIGHLIGHT_COST,
            type: "HIGHLIGHT",
            description: `Highlight for ${highlightDays} days: ${listing.title}`,
            relatedId: listing.id
          }
        });

        await tx.listing.update({
          where: { id: listing.id },
          data: {
            isHighlighted: true,
            highlightEndDate: highlightEndDate,
            autoRenewHighlight: autoRenew || false,
          }
        });
      }

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully highlighted ${listingIds.length} listing(s) for ${highlightDays} days`,
      count: listingIds.length,
      chargedAmount: totalCost,
      newBalance: result.credits,
      highlightEndDate: highlightEndDate
    }, { status: 200 });

  } catch (error) {
    if (error.message?.startsWith("INSUFFICIENT_CREDITS")) {
      const available = parseFloat(error.message.split(":")[1]) || 0;
      return NextResponse.json({
        error: "Insufficient credits for highlight",
        required: totalCost,
        available,
        needToPurchase: totalCost - available,
        redirectToPayment: true
      }, { status: 402 });
    }
    console.error("Error highlighting listing:", error);
    return NextResponse.json({ error: "Failed to highlight listing" }, { status: 500 });
  }
}

// GET para verificar status do highlight
export async function GET(request) {
  const session = await auth();

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
  }

  try {
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        isHighlighted: true,
        highlightEndDate: true
      }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const now = new Date();
    const isActive = listing.isHighlighted && listing.highlightEndDate && listing.highlightEndDate > now;

    return NextResponse.json({
      listing,
      isHighlightActive: isActive,
      daysRemaining: isActive ? Math.ceil((listing.highlightEndDate - now) / (1000 * 60 * 60 * 24)) : 0
    });

  } catch (error) {
    console.error("Error checking highlight status:", error);
    return NextResponse.json({ error: "Failed to check highlight status" }, { status: 500 });
  }
}