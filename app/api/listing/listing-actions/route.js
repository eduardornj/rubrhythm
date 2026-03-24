import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getFeatureCost, VALID_DURATIONS } from "@/lib/feature-pricing";

// Server-side pricing — NEVER trust cost from client
const ACTION_COSTS = {
  "listing-fee": 10,
  "bump-up": 5,
};

function getServerCost(action, durationDays, tier) {
  if (ACTION_COSTS[action] !== undefined) return ACTION_COSTS[action];
  if (action === "feature") {
    const duration = VALID_DURATIONS.includes(durationDays) ? durationDays : 7;
    return getFeatureCost(tier || "BASIC", duration);
  }
  if (action === "highlight") {
    const duration = VALID_DURATIONS.includes(durationDays) ? durationDays : 7;
    return duration === 30 ? 30 : 10;
  }
  return null;
}

export async function POST(request) {
  // SECURITY: Authenticate user — never trust userId from request body
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, listingId, durationDays, tier } = await request.json();
  const userId = session.user.id;

  if (!action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Compute cost server-side — ignore any client-provided cost
  const cost = getServerCost(action, durationDays, tier);
  if (cost === null) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    // Verify listing exists and belongs to the authenticated user
    let listing = null;
    if (action !== "listing-fee") {
      listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing || listing.userId !== userId) {
        return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
      }
    }

    // Deduct credits atomically (balance check inside transaction to prevent TOCTOU race)
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });

      if (!user || user.credits < cost) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: cost } },
      });

      await tx.creditbalance.upsert({
        where: { userId },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${userId}`, userId, balance: updatedUser.credits }
      });

      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          amount: -cost,
          type: "SPEND",
          description: `${action} — listingId:${listingId || 'n/a'}`,
        }
      });
    });

    // Apply the listing action
    if (action === "listing-fee") {
      return NextResponse.json({ message: "Listing fee deducted successfully" });
    } else if (action === "bump-up") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { lastBumpUp: new Date() },
      });
    } else if (action === "highlight") {
      const duration = VALID_DURATIONS.includes(durationDays) ? durationDays : 7;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      await prisma.listing.update({
        where: { id: listingId },
        data: { isHighlighted: true, highlightEndDate: endDate },
      });
    } else if (action === "feature") {
      const duration = VALID_DURATIONS.includes(durationDays) ? durationDays : 7;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      await prisma.listing.update({
        where: { id: listingId },
        data: { isFeatured: true, featuredEndDate: endDate },
      });
    }

    return NextResponse.json({ message: "Action completed successfully", cost });
  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient credits. Please add more credits to your account." }, { status: 400 });
    }
    console.error("Error processing action:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
