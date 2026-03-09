import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { auth } from "@/auth";
import { formatImageUrls } from "@/lib/json-utils";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priceRange: true,
        hourlyRate: true,
        state: true,
        city: true,
        neighborhood: true,
        images: true,
        isApproved: true,
        isActive: true,
        isFeatured: true,
        featureTier: true,
        featuredEndDate: true,
        isHighlighted: true,
        highlightEndDate: true,
        availableNow: true,
        availableUntil: true,
        autoRenewFeatured: true,
        autoRenewHighlight: true,
        autoRenewAvailable: true,
        isWhatsAppAvailable: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { verified: true } }
      },
      take: 20,
    });

    const safeListings = listings.map(listing => ({
      ...listing,
      images: formatImageUrls(listing.images)
    }));

    return NextResponse.json({ listings: safeListings }, { status: 200 });
  } catch (err) {
    console.error("Error fetching listings:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    // Verifica se o anúncio pertence ao usuário
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Deleta o anúncio
    await prisma.listing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({ message: "Listing deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting listing:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}