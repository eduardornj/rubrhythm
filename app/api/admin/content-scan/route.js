import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { scanContent } from '@/lib/contentFilter';

/**
 * GET /api/admin/content-scan
 * Scans all listings with the current content filter and returns matches.
 * Query params:
 *   - severity: "red" | "yellow" | "all" (default: "all")
 *   - approved: "true" | "false" | "all" (default: "all")
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity') || 'all';
    const approvedFilter = searchParams.get('approved') || 'all';

    const where = {};
    if (approvedFilter === 'true') where.isApproved = true;
    if (approvedFilter === 'false') where.isApproved = false;

    const listings = await prisma.listing.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        state: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const results = [];

    for (const listing of listings) {
      const text = [listing.title, listing.description].filter(Boolean).join(' ');
      const scan = scanContent(text);

      if (severity === 'red' && !scan.hasBlocked) continue;
      if (severity === 'yellow' && !scan.hasFlagged) continue;
      if (severity === 'all' && !scan.hasBlocked && !scan.hasFlagged) continue;

      results.push({
        id: listing.id,
        title: listing.title,
        city: listing.city,
        state: listing.state,
        isApproved: listing.isApproved,
        isActive: listing.isActive,
        createdAt: listing.createdAt,
        provider: listing.user,
        blocked: scan.blocked,
        flagged: scan.flagged,
        hasBlocked: scan.hasBlocked,
        hasFlagged: scan.hasFlagged,
      });
    }

    return NextResponse.json({
      total: listings.length,
      flaggedCount: results.length,
      redCount: results.filter(r => r.hasBlocked).length,
      yellowCount: results.filter(r => r.hasFlagged && !r.hasBlocked).length,
      results,
    });
  } catch (error) {
    console.error('Content scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
