import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request) {
  // SECURITY: Authenticate user — never trust userId from request body
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, listingId, cost, durationDays } = await request.json();
  const userId = session.user.id; // Always use session, never request body

  if (!action || !cost) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Check user credit balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user || user.credits < cost) {
      return NextResponse.json({ error: "Insufficient credits. Please add more credits to your account." }, { status: 400 });
    }

    // Deduct credits atomically
    await prisma.$transaction(async (tx) => {
      // Deduct from user credits (single source of truth)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: cost } },
      });

      // Sync creditbalance
      await tx.creditbalance.upsert({
        where: { userId },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${userId}`, userId, balance: updatedUser.credits }
      });

      // Record transaction
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
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (durationDays || 7));
      await prisma.listing.update({
        where: { id: listingId },
        data: { isHighlighted: true, highlightEndDate: endDate },
      });
    } else if (action === "feature") {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (durationDays || 30));
      await prisma.listing.update({
        where: { id: listingId },
        data: { isFeatured: true, featuredEndDate: endDate },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Action completed successfully" });
  } catch (error) {
    console.error("Error processing action:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
