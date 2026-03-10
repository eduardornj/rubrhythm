import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";
import { getFeatureCost } from "@/lib/feature-pricing";

const HIGHLIGHT_COST = 15;
const HIGHLIGHT_DAYS = 14;
const AVAILABLE_NOW_COST = 3;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const session = await auth();

    const authHeader = request.headers.get("authorization");
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (session?.user?.role !== "admin" && !isCronJob) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = { renewed: [], expired: [], errors: [] };

    // ── 1. Process expired FEATURED listings ──
    const expiredFeatured = await prisma.listing.findMany({
      where: {
        isFeatured: true,
        featuredEndDate: { lte: now },
      },
      select: {
        id: true,
        title: true,
        userId: true,
        featureTier: true,
        featuredEndDate: true,
        autoRenewFeatured: true,
        user: { select: { id: true, credits: true, email: true, name: true } },
      },
    });

    for (const listing of expiredFeatured) {
      if (listing.autoRenewFeatured) {
        const tier = listing.featureTier || "BASIC";
        const duration = 7; // default renewal duration
        let cost;
        try {
          cost = getFeatureCost(tier, duration);
        } catch {
          cost = tier === "PREMIUM" ? 20 : 15;
        }

        if (listing.user.credits >= cost) {
          // Renew: charge credits, extend dates
          try {
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + duration);

            await prisma.$transaction(async (tx) => {
              await tx.listing.update({
                where: { id: listing.id },
                data: { featuredEndDate: newEndDate },
              });

              const updatedUser = await tx.user.update({
                where: { id: listing.userId },
                data: { credits: { decrement: cost } },
              });

              await tx.creditbalance.upsert({
                where: { userId: listing.userId },
                update: { balance: updatedUser.credits },
                create: { id: `cb_${Date.now()}`, userId: listing.userId, balance: updatedUser.credits },
              });

              await tx.credittransaction.create({
                data: {
                  id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: listing.userId,
                  amount: -cost,
                  type: `FEATURE_${tier}_RENEW`,
                  description: `Auto-renewal: Feature ${tier} for ${duration} days - ${listing.title}`,
                  relatedId: listing.id,
                },
              });

              await tx.notification.create({
                data: {
                  id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: listing.userId,
                  title: "Feature Auto-Renewed",
                  body: `Your listing "${listing.title}" has been automatically re-featured for ${duration} days. ${cost} credits charged.`,
                  type: "feature_renewal",
                },
              });
            });

            results.renewed.push({ id: listing.id, title: listing.title, type: "featured", cost });
          } catch (err) {
            results.errors.push({ id: listing.id, title: listing.title, error: err.message });
          }
        } else {
          // Not enough credits: disable auto-renew, expire, notify
          await prisma.$transaction(async (tx) => {
            await tx.listing.update({
              where: { id: listing.id },
              data: {
                isFeatured: false,
                featureTier: null,
                featuredEndDate: null,
                autoRenewFeatured: false,
              },
            });

            await tx.notification.create({
              data: {
                id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: listing.userId,
                title: "Feature Expired - Insufficient Credits",
                body: `Your listing "${listing.title}" feature has expired. Auto-renewal failed because you only have ${listing.user.credits} credits (need ${cost}). Auto-renew has been turned off.`,
                type: "feature_expired",
              },
            });
          });

          results.expired.push({ id: listing.id, title: listing.title, type: "featured", reason: "insufficient_credits" });
        }
      } else {
        // No auto-renew: just expire
        await prisma.listing.update({
          where: { id: listing.id },
          data: { isFeatured: false, featureTier: null, featuredEndDate: null },
        });

        results.expired.push({ id: listing.id, title: listing.title, type: "featured", reason: "no_auto_renew" });
      }
    }

    // ── 2. Process expired HIGHLIGHTED listings ──
    const expiredHighlighted = await prisma.listing.findMany({
      where: {
        isHighlighted: true,
        highlightEndDate: { lte: now },
      },
      select: {
        id: true,
        title: true,
        userId: true,
        highlightEndDate: true,
        autoRenewHighlight: true,
        user: { select: { id: true, credits: true, email: true, name: true } },
      },
    });

    for (const listing of expiredHighlighted) {
      if (listing.autoRenewHighlight) {
        if (listing.user.credits >= HIGHLIGHT_COST) {
          try {
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + HIGHLIGHT_DAYS);

            await prisma.$transaction(async (tx) => {
              await tx.listing.update({
                where: { id: listing.id },
                data: { highlightEndDate: newEndDate },
              });

              const updatedUser = await tx.user.update({
                where: { id: listing.userId },
                data: { credits: { decrement: HIGHLIGHT_COST } },
              });

              await tx.creditbalance.upsert({
                where: { userId: listing.userId },
                update: { balance: updatedUser.credits },
                create: { id: `cb_${Date.now()}`, userId: listing.userId, balance: updatedUser.credits },
              });

              await tx.credittransaction.create({
                data: {
                  id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: listing.userId,
                  amount: -HIGHLIGHT_COST,
                  type: "HIGHLIGHT_RENEW",
                  description: `Auto-renewal: Highlight for ${HIGHLIGHT_DAYS} days - ${listing.title}`,
                  relatedId: listing.id,
                },
              });

              await tx.notification.create({
                data: {
                  id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: listing.userId,
                  title: "Highlight Auto-Renewed",
                  body: `Your listing "${listing.title}" highlight has been automatically renewed for ${HIGHLIGHT_DAYS} days. ${HIGHLIGHT_COST} credits charged.`,
                  type: "highlight_renewal",
                },
              });
            });

            results.renewed.push({ id: listing.id, title: listing.title, type: "highlight", cost: HIGHLIGHT_COST });
          } catch (err) {
            results.errors.push({ id: listing.id, title: listing.title, error: err.message });
          }
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.listing.update({
              where: { id: listing.id },
              data: {
                isHighlighted: false,
                highlightEndDate: null,
                autoRenewHighlight: false,
              },
            });

            await tx.notification.create({
              data: {
                id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: listing.userId,
                title: "Highlight Expired - Insufficient Credits",
                body: `Your listing "${listing.title}" highlight has expired. Auto-renewal failed because you only have ${listing.user.credits} credits (need ${HIGHLIGHT_COST}). Auto-renew has been turned off.`,
                type: "highlight_expired",
              },
            });
          });

          results.expired.push({ id: listing.id, title: listing.title, type: "highlight", reason: "insufficient_credits" });
        }
      } else {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { isHighlighted: false, highlightEndDate: null },
        });

        results.expired.push({ id: listing.id, title: listing.title, type: "highlight", reason: "no_auto_renew" });
      }
    }

    // ── 3. Process expired AVAILABLE NOW listings ──
    const expiredAvailable = await prisma.listing.findMany({
      where: {
        availableNow: true,
        availableUntil: { lte: now },
      },
      select: {
        id: true,
        title: true,
        userId: true,
        availableUntil: true,
        autoRenewAvailable: true,
        user: { select: { id: true, credits: true, email: true, name: true } },
      },
    });

    for (const listing of expiredAvailable) {
      if (listing.autoRenewAvailable) {
        if (listing.user.credits >= AVAILABLE_NOW_COST) {
          try {
            const newUntil = new Date(Date.now() + SIX_HOURS_MS);

            await prisma.$transaction(async (tx) => {
              await tx.listing.update({
                where: { id: listing.id },
                data: { availableUntil: newUntil },
              });

              const updatedUser = await tx.user.update({
                where: { id: listing.userId },
                data: { credits: { decrement: AVAILABLE_NOW_COST } },
              });

              await tx.creditbalance.upsert({
                where: { userId: listing.userId },
                update: { balance: updatedUser.credits },
                create: { id: `cb_${Date.now()}`, userId: listing.userId, balance: updatedUser.credits },
              });

              await tx.credittransaction.create({
                data: {
                  id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: listing.userId,
                  amount: -AVAILABLE_NOW_COST,
                  type: "AVAILABLE_NOW_RENEW",
                  description: `Auto-renewal: Available Now for 6h - ${listing.title}`,
                  relatedId: listing.id,
                },
              });

              await tx.notification.create({
                data: {
                  id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: listing.userId,
                  title: "Available Now Auto-Renewed",
                  body: `Your listing "${listing.title}" Available Now status has been automatically renewed for 6 hours. ${AVAILABLE_NOW_COST} credits charged.`,
                  type: "available_renewal",
                },
              });
            });

            results.renewed.push({ id: listing.id, title: listing.title, type: "available_now", cost: AVAILABLE_NOW_COST });
          } catch (err) {
            results.errors.push({ id: listing.id, title: listing.title, error: err.message });
          }
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.listing.update({
              where: { id: listing.id },
              data: {
                availableNow: false,
                availableUntil: null,
                autoRenewAvailable: false,
              },
            });

            await tx.notification.create({
              data: {
                id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: listing.userId,
                title: "Available Now Expired - Insufficient Credits",
                body: `Your listing "${listing.title}" Available Now has expired. Auto-renewal failed because you only have ${listing.user.credits} credits (need ${AVAILABLE_NOW_COST}). Auto-renew has been turned off.`,
                type: "available_expired",
              },
            });
          });

          results.expired.push({ id: listing.id, title: listing.title, type: "available_now", reason: "insufficient_credits" });
        }
      } else {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { availableNow: false, availableUntil: null },
        });

        results.expired.push({ id: listing.id, title: listing.title, type: "available_now", reason: "no_auto_renew" });
      }
    }

    // ── 4. Legacy: expire featured users (keep backward compat) ──
    await prisma.user.updateMany({
      where: {
        isFeatured: true,
        featuredEndDate: { lte: now },
      },
      data: {
        isFeatured: false,
        featuredEndDate: null,
      },
    });

    const totalProcessed = results.renewed.length + results.expired.length;

    console.log(`Auto-expire processed: ${totalProcessed} listings (${results.renewed.length} renewed, ${results.expired.length} expired, ${results.errors.length} errors)`);

    return NextResponse.json({
      message: `Processed ${totalProcessed} expired promotions`,
      renewed: results.renewed,
      expired: results.expired,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error in auto-expire:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = new Date();

    const [expiredFeatured, activeFeatured, expiredHighlighted, activeHighlighted, expiredAvailable, activeAvailable] = await Promise.all([
      prisma.listing.count({ where: { isFeatured: true, featuredEndDate: { lte: now } } }),
      prisma.listing.count({ where: { isFeatured: true, featuredEndDate: { gt: now } } }),
      prisma.listing.count({ where: { isHighlighted: true, highlightEndDate: { lte: now } } }),
      prisma.listing.count({ where: { isHighlighted: true, highlightEndDate: { gt: now } } }),
      prisma.listing.count({ where: { availableNow: true, availableUntil: { lte: now } } }),
      prisma.listing.count({ where: { availableNow: true, availableUntil: { gt: now } } }),
    ]);

    return NextResponse.json({
      featured: { expired: expiredFeatured, active: activeFeatured },
      highlighted: { expired: expiredHighlighted, active: activeHighlighted },
      availableNow: { expired: expiredAvailable, active: activeAvailable },
      lastCheck: now.toISOString(),
    });
  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
