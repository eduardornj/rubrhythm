import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { safeJsonParse, formatImageUrls } from '../../../lib/json-utils';

// Inline weighted rotation (63% PREMIUM / 37% BASIC, max 8 slots)
function applyFeaturedRotation(listings, maxSlots = 8) {
  const premium = listings.filter(l => l.featureTier === 'PREMIUM');
  const basic = listings.filter(l => l.featureTier !== 'PREMIUM');
  const total = listings.length;

  if (total <= maxSlots) return listings.sort((a, b) => (a.featureTier === 'PREMIUM' ? -1 : 1));

  // Weighted pick
  const targetPremium = Math.round(maxSlots * 0.63);
  const targetBasic = maxSlots - targetPremium;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const pPick = Math.min(targetPremium, premium.length);
  const bPick = Math.min(targetBasic, basic.length);

  return [
    ...shuffle(premium).slice(0, pPick),
    ...shuffle(basic).slice(0, bPick),
  ];
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const excludeId = searchParams.get('excludeId');

    if (!city || !state) {
      return NextResponse.json(
        { error: 'City and state are required' },
        { status: 400 }
      );
    }

    const formattedState = state
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const formattedCity = city
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const currentDate = new Date();

    // Build where clause
    const whereClause = {
      state: formattedState,
      city: formattedCity,
      isActive: true,
    };

    // Add featured filter if requested
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // Exclude specific listing if provided
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        priceRange: true,
        hourlyRate: true,
        age: true,
        state: true,
        city: true,
        createdAt: true,
        isFeatured: true,
        featureTier: true,
        featuredEndDate: true,
        isHighlighted: true,
        availableNow: true,
        availableUntil: true,
        isWhatsAppAvailable: true,
        services: true,
        availability: true,
        user: {
          select: {
            verified: true
          }
        }
      },
      orderBy: [{ isFeatured: 'desc' }, { lastBumpUp: 'desc' }, { isHighlighted: 'desc' }, { createdAt: 'desc' }],
      // When featured=true, fetch all so rotation can pick fairly; otherwise limit
      take: featured === 'true' ? undefined : limit
    });

    // Filter featured listings by expiration date
    let filteredListings = listings;
    if (featured === 'true') {
      // Remove expired featured listings
      filteredListings = listings.filter(l =>
        !l.featuredEndDate || new Date(l.featuredEndDate) > currentDate
      );
      // Apply weighted rotation (max 8 slots, 63% PREMIUM / 37% BASIC)
      filteredListings = applyFeaturedRotation(filteredListings);
    }

    // Process listings to parse JSON fields and format image URLs
    const processedListings = filteredListings.map(listing => ({
      ...listing,
      images: formatImageUrls(listing.images),
      services: safeJsonParse(listing.services),
      availability: safeJsonParse(listing.availability)
    }));

    return NextResponse.json({
      listings: processedListings,
      total: processedListings.length
    });

  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}