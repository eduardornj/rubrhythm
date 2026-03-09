import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingIds } = await request.json();

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: "Listing IDs array is required" }, { status: 400 });
    }

    const BUMP_UP_COST = 5.0; // $5 for bump up per listing
    const totalCost = listingIds.length * BUMP_UP_COST;

    // Verify all listings belong to the user
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId: session.user.id,
        isApproved: true,
        isActive: true
      }
    });

    if (listings.length !== listingIds.length) {
      return NextResponse.json({ error: "Some listings were not found or are not authorized" }, { status: 404 });
    }

    // Verify user credits from the single source of truth (user table)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    const currentBalance = user?.credits || 0;

    if (currentBalance < totalCost) {
      return NextResponse.json({
        error: "Insufficient credits for bump up",
        required: totalCost,
        available: currentBalance,
        needToPurchase: totalCost - currentBalance,
        redirectToPayment: true
      }, { status: 402 }); // 402 Payment Required
    }

    // Process bump up in a transaction
    const result = await prisma.$transaction(async (tx) => {
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
            amount: -BUMP_UP_COST,
            type: "BUMP_UP",
            description: `Bump Up for listing: ${listing.title}`,
            relatedId: listing.id
          }
        });

        await tx.listing.update({
          where: { id: listing.id },
          data: {
            updatedAt: new Date(),
            lastBumpUp: new Date()
          }
        });
      }

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully bumped up ${listingIds.length} listing(s)`,
      count: listingIds.length,
      newBalance: result.credits,
    });

  } catch (error) {
    console.error("Bump up error:", error);
    return NextResponse.json(
      { error: "Failed to bump up listing" },
      { status: 500 }
    );
  }
}
