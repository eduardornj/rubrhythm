import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendExpirationWarningEmail } from "@/lib/email";

const WARNING_DAYS = 3;

export async function POST(request) {
  try {
    // Auth: CRON_SECRET header OR admin session
    const authHeader = request.headers.get("authorization");
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronJob) {
      const session = await auth();
      if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();
    const warningDate = new Date(now.getTime() + WARNING_DAYS * 24 * 60 * 60 * 1000);

    // Find listings with featured or highlight expiring within 3 days
    const expiringListings = await prisma.listing.findMany({
      where: {
        OR: [
          {
            isFeatured: true,
            featuredEndDate: { gte: now, lte: warningDate },
          },
          {
            isHighlighted: true,
            highlightEndDate: { gte: now, lte: warningDate },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        isFeatured: true,
        isHighlighted: true,
        featuredEndDate: true,
        highlightEndDate: true,
        userId: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (expiringListings.length === 0) {
      return NextResponse.json({ message: "No expiring listings found", sent: 0 });
    }

    let emailsSent = 0;
    let notificationsCreated = 0;
    const results = [];

    for (const listing of expiringListings) {
      const warnings = [];

      // Check featured expiration
      if (listing.isFeatured && listing.featuredEndDate) {
        warnings.push({
          featureType: "Featured Listing",
          expiresAt: listing.featuredEndDate,
          notifType: "featured_expiring",
        });
      }

      // Check highlight expiration
      if (listing.isHighlighted && listing.highlightEndDate) {
        warnings.push({
          featureType: "Highlighted Listing",
          expiresAt: listing.highlightEndDate,
          notifType: "highlight_expiring",
        });
      }

      for (const warning of warnings) {
        // Check for duplicate: look for an existing notification with same type + listing in the last 24h
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: listing.userId,
            type: warning.notifType,
            data: { contains: listing.id },
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        });

        if (existingNotification) continue;

        // Send email
        const userName = listing.user.name || "there";
        await sendExpirationWarningEmail(
          listing.user.email,
          userName,
          listing.title,
          warning.featureType,
          warning.expiresAt
        );
        emailsSent++;

        // Create in-app notification
        const dateStr = new Date(warning.expiresAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        await prisma.notification.create({
          data: {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: listing.userId,
            title: `${warning.featureType} Expiring Soon`,
            body: `Your ${warning.featureType.toLowerCase()} on "${listing.title}" expires on ${dateStr}. Renew now to keep your visibility.`,
            type: warning.notifType,
            data: JSON.stringify({ listingId: listing.id, expiresAt: warning.expiresAt }),
          },
        });
        notificationsCreated++;

        results.push({
          listingId: listing.id,
          listingTitle: listing.title,
          user: listing.user.email,
          featureType: warning.featureType,
          expiresAt: warning.expiresAt,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${expiringListings.length} listings`,
      emailsSent,
      notificationsCreated,
      results,
    });
  } catch (error) {
    console.error("Error processing expiration warnings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
