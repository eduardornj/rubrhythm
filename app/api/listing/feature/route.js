import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { FEATURE_TIERS, VALID_TIERS, VALID_DURATIONS, getFeatureCost } from "@/lib/feature-pricing";

export async function POST(request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingIds, duration, tier, autoRenew } = await request.json();

  // Validate inputs
  if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
    return NextResponse.json({ error: "Missing or invalid listing IDs" }, { status: 400 });
  }

  if (!VALID_DURATIONS.includes(duration)) {
    return NextResponse.json({ error: `Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')} days` }, { status: 400 });
  }

  const selectedTier = tier || 'BASIC'; // default to BASIC if not specified

  if (!VALID_TIERS.includes(selectedTier)) {
    return NextResponse.json({ error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` }, { status: 400 });
  }

  const tierConfig = FEATURE_TIERS[selectedTier];

  // PREMIUM requires a verified account
  if (tierConfig.requiresVerification) {
    // Re-fetch user to ensure fresh verification status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { verified: true },
    });

    if (!user?.verified) {
      return NextResponse.json({
        error: "Feature Premium requires a verified account. Please complete identity verification first.",
        code: "VERIFICATION_REQUIRED",
      }, { status: 403 });
    }
  }

  const costPerListing = getFeatureCost(selectedTier, duration);
  const totalCost = listingIds.length * costPerListing;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check user credits from single source of truth
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      const currentBalance = user?.credits || 0;

      if (currentBalance < totalCost) {
        throw new Error(`Insufficient credits. Need ${totalCost}, have ${currentBalance}`);
      }

      // Verify all listings belong to user
      const listings = await tx.listing.findMany({
        where: {
          id: { in: listingIds },
          userId: session.user.id,
        },
        select: { id: true },
      });

      if (listings.length !== listingIds.length) {
        throw new Error("Some listings were not found or don't belong to you");
      }

      // Calculate featured end date
      const featuredEndDate = new Date();
      featuredEndDate.setDate(featuredEndDate.getDate() + duration);

      // Update listings with tier information
      await tx.listing.updateMany({
        where: { id: { in: listingIds } },
        data: {
          isFeatured: true,
          featureTier: selectedTier,
          featuredEndDate,
          autoRenewFeatured: autoRenew || false,
        },
      });

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

      // Record transaction
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          amount: -totalCost,
          type: `FEATURE_${selectedTier}`,
          description: `${tierConfig.label}: ${listingIds.length} listing(s) for ${duration} days`,
        },
      });

      return { count: listings.length, duration, cost: totalCost, tier: selectedTier };
    });

    return NextResponse.json({
      message: `Successfully activated ${FEATURE_TIERS[result.tier].label} for ${result.count} listing(s) for ${result.duration} days`,
      count: result.count,
      duration: result.duration,
      cost: result.cost,
      tier: result.tier,
      badge: FEATURE_TIERS[result.tier].badge,
    }, { status: 200 });

  } catch (error) {
    console.error("Error featuring listings:", error);
    return NextResponse.json({
      error: "Failed to feature listings",
    }, { status: 500 });
  }
}

/**
 * GET /api/listing/feature — returns tier configurations for the UI
 */
export async function GET() {
  return NextResponse.json({
    tiers: FEATURE_TIERS,
    validDurations: VALID_DURATIONS,
  });
}