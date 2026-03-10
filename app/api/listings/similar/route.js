import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { safeJsonParse, formatImageUrls } from "../../../../lib/json-utils";

const FIELDS = {
  id: true,
  title: true,
  images: true,
  priceRange: true,
  hourlyRate: true,
  age: true,
  neighborhood: true,
  city: true,
  state: true,
  isFeatured: true,
  featureTier: true,
  featuredEndDate: true,
  isHighlighted: true,
  highlightEndDate: true,
  availableNow: true,
  availableUntil: true,
  isWhatsAppAvailable: true,
  user: { select: { id: true, name: true, verified: true } }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentListingId = searchParams.get('listingId');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit')) || 8;

    if (!currentListingId || !city || !state) {
      return NextResponse.json({ error: "listingId, city and state are required" }, { status: 400 });
    }

    const formattedState = state.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const formattedCity = city.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    // Step 1 — city-level results (excluding current listing)
    const cityListings = await prisma.listing.findMany({
      where: {
        id: { not: currentListingId },
        city: { contains: formattedCity },
        state: { contains: formattedState },
        isActive: true,
      },
      select: FIELDS,
      orderBy: [{ isFeatured: 'desc' }, { lastBumpUp: 'desc' }, { isHighlighted: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    let results = cityListings;

    // Step 2 — if fewer than `limit`, pad with same-state listings from other cities
    if (results.length < limit) {
      const seenIds = new Set([currentListingId, ...results.map(l => l.id)]);
      const stateListings = await prisma.listing.findMany({
        where: {
          id: { notIn: [...seenIds] },
          state: { contains: formattedState },
          isActive: true,
        },
        select: FIELDS,
        orderBy: [{ isFeatured: 'desc' }, { lastBumpUp: 'desc' }, { isHighlighted: 'desc' }, { createdAt: 'desc' }],
        take: limit - results.length,
      });
      results = [...results, ...stateListings];
    }

    // Format images
    const formatted = results.map(l => ({
      ...l,
      images: formatImageUrls(l.images),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error in /api/listings/similar:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}