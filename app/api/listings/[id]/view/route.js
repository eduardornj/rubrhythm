import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Simple in-memory rate limit for view counts (1 view per IP per listing per 5 min)
const viewCache = new Map();
const VIEW_COOLDOWN_MS = 5 * 60 * 1000;

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewCache) {
    if (now - timestamp > VIEW_COOLDOWN_MS) viewCache.delete(key);
  }
}, 10 * 60 * 1000);

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const cacheKey = `${ip}:${id}`;

    // Rate limit: skip duplicate views from same IP
    if (viewCache.has(cacheKey)) {
      return NextResponse.json({ ok: true });
    }
    viewCache.set(cacheKey, Date.now());

    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
