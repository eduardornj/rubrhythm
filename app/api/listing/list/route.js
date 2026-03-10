import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = Math.min(parseInt(searchParams.get("limit")) || 50, 100);
  const skip = (page - 1) * limit;

  try {
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { user: { select: { id: true, name: true, email: true, verified: true, role: true } } },
      });

      if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      return NextResponse.json(listing, { status: 200 });
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        include: { user: { select: { id: true, name: true, email: true, verified: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count(),
    ]);

    return NextResponse.json({ listings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}