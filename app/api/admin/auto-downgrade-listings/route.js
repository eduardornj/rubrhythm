import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Esta API deve ser chamada diariamente por um cron job
// Ela faz os anúncios "descerem" na lista automaticamente
export async function POST(request) {
  try {
    const session = await auth();

    // Verify admin or cron job (via Authorization header, never query params)
    const authHeader = request.headers.get("authorization");
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (session?.user?.role !== 'admin' && !isCronJob) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Batch update: listings sem bump que não foram atualizados nas últimas 24h
    const noBumpDegraded = await prisma.listing.updateMany({
      where: {
        isApproved: true,
        isActive: true,
        updatedAt: { lt: oneDayAgo },
        lastBumpUp: null
      },
      data: {
        // MySQL doesn't support date math in updateMany, so we set to a fixed degraded time
        updatedAt: new Date(oneDayAgo.getTime() - 60 * 60 * 1000)
      }
    });

    // Batch update: listings com bump expirado (>24h)
    const expiredBumpDegraded = await prisma.listing.updateMany({
      where: {
        isApproved: true,
        isActive: true,
        lastBumpUp: { lt: oneDayAgo }
      },
      data: {
        updatedAt: new Date(oneDayAgo.getTime() - 30 * 60 * 1000)
      }
    });

    const processedCount = noBumpDegraded.count + expiredBumpDegraded.count;

    console.log(`Auto-downgrade completed: ${processedCount} listings processed at ${now.toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Auto-downgrade completed successfully`,
      processedListings: processedCount,
      noBumpDegraded: noBumpDegraded.count,
      expiredBumpDegraded: expiredBumpDegraded.count,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error("Auto-downgrade error:", error);
    return NextResponse.json(
      { error: "Failed to process auto-downgrade" },
      { status: 500 }
    );
  }
}

// GET para verificar status
export async function GET(request) {
  try {
    const session = await auth();

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Estatísticas dos anúncios
    const stats = await prisma.listing.groupBy({
      by: ['isActive', 'isApproved'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    // Anúncios com bump up recente
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBumpUps = await prisma.listing.count({
      where: {
        lastBumpUp: {
          gte: oneDayAgo
        },
        isActive: true,
        isApproved: true
      }
    });

    return NextResponse.json({
      stats,
      recentBumpUps,
      lastCheck: new Date().toISOString()
    });

  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
