import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { safeJsonParse } from "@/lib/json-utils";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { 
        listing: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                verified: true,
                image: true
              }
            }
          }
        }
      },
    });

    // Format the response to include parsed JSON fields
    const formattedFavorites = favorites.map(favorite => {
      let images = [];
      let services = [];
      let availability = [];
      
      try {
        if (favorite.listing.images) {
          if (Array.isArray(favorite.listing.images)) {
            images = favorite.listing.images;
          } else if (typeof favorite.listing.images === 'string' && favorite.listing.images.trim() !== '') {
            images = safeJsonParse(favorite.listing.images);
          }
        }
      } catch (e) {
        console.error('Error parsing images for listing:', favorite.listing.id, e);
        images = [];
      }
      
      try {
        if (favorite.listing.services && typeof favorite.listing.services === 'string' && favorite.listing.services.trim() !== '') {
          services = safeJsonParse(favorite.listing.services);
        }
      } catch (e) {
        console.error('Error parsing services for listing:', favorite.listing.id, e);
        services = [];
      }
      
      try {
        if (favorite.listing.availability && typeof favorite.listing.availability === 'string' && favorite.listing.availability.trim() !== '') {
          // Try to parse as JSON first, if it fails, treat as a simple string
          try {
            availability = safeJsonParse(favorite.listing.availability);
          } catch (jsonError) {
            // If it's not valid JSON, treat as a simple string value
            availability = favorite.listing.availability;
          }
        }
      } catch (e) {
        console.error('Error parsing availability for listing:', favorite.listing.id, e);
        availability = [];
      }
      
      return {
        ...favorite.listing,
        images,
        services,
        availability
      };
    })

    return NextResponse.json({ favorites: formattedFavorites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: session.user.id, listingId },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({ error: "Favorite already exists." }, { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: { userId: session.user.id, listingId },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: session.user.id, listingId },
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found." }, { status: 404 });
    }

    await prisma.favorite.delete({
      where: {
        userId_listingId: { userId: session.user.id, listingId },
      },
    });

    return NextResponse.json({ message: "Favorite removed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite." }, { status: 500 });
  }
}