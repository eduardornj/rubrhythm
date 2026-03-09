import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";

const BUMP_COST = 5.0;

export async function POST(request) {
  try {
    const session = await auth();
    const authHeader = request.headers.get("authorization");
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isAdmin = session?.user?.role === "admin";

    if (!isCronJob && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentHour = new Date().getUTCHours();

    const listings = await prisma.listing.findMany({
      where: {
        autoBumpEnabled: true,
        autoBumpHour: currentHour,
        isApproved: true,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        userId: true,
      },
    });

    if (listings.length === 0) {
      return NextResponse.json({
        message: "No listings scheduled for auto-bump this hour",
        hour: currentHour,
        bumped: 0,
        disabled: 0,
        details: [],
      });
    }

    const listingsByUser = {};
    for (const listing of listings) {
      if (!listingsByUser[listing.userId]) {
        listingsByUser[listing.userId] = [];
      }
      listingsByUser[listing.userId].push(listing);
    }

    let bumpedCount = 0;
    let disabledCount = 0;
    const details = [];

    for (const [userId, userListings] of Object.entries(listingsByUser)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      const currentBalance = user?.credits || 0;
      let remainingCredits = currentBalance;

      for (const listing of userListings) {
        if (remainingCredits >= BUMP_COST) {
          await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
              where: { id: userId },
              data: { credits: { decrement: BUMP_COST } },
            });

            await tx.creditbalance.upsert({
              where: { userId },
              update: { balance: updatedUser.credits },
              create: {
                id: `cb_${crypto.randomUUID()}`,
                userId,
                balance: updatedUser.credits,
              },
            });

            await tx.credittransaction.create({
              data: {
                id: `ct_${crypto.randomUUID()}`,
                userId,
                amount: -BUMP_COST,
                type: "AUTO_BUMP",
                description: `Auto-bump for listing: ${listing.title}`,
                relatedId: listing.id,
              },
            });

            await tx.listing.update({
              where: { id: listing.id },
              data: {
                lastBumpUp: new Date(),
                updatedAt: new Date(),
              },
            });
          });

          remainingCredits -= BUMP_COST;
          bumpedCount++;
          details.push({
            listingId: listing.id,
            title: listing.title,
            userId,
            status: "bumped",
          });
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.listing.update({
              where: { id: listing.id },
              data: { autoBumpEnabled: false },
            });

            await tx.notification.create({
              data: {
                id: `notif_${crypto.randomUUID()}`,
                userId,
                title: "Auto-bump disabled",
                body: `Auto-bump was disabled for "${listing.title}" due to insufficient credits. You need at least 5 credits per listing. Please add credits and re-enable.`,
                type: "credits",
              },
            });
          });

          disabledCount++;
          details.push({
            listingId: listing.id,
            title: listing.title,
            userId,
            status: "disabled_insufficient_credits",
          });
        }
      }
    }

    console.log(
      `[Auto-Bump] Hour ${currentHour} UTC | Bumped: ${bumpedCount} | Disabled: ${disabledCount}`
    );

    return NextResponse.json({
      message: `Auto-bump completed for hour ${currentHour} UTC`,
      hour: currentHour,
      bumped: bumpedCount,
      disabled: disabledCount,
      details,
    });
  } catch (error) {
    console.error("Auto-bump cron error:", error);
    return NextResponse.json(
      { error: "Auto-bump cron failed" },
      { status: 500 }
    );
  }
}
