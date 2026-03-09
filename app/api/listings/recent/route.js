import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!city || !state) {
      return NextResponse.json({ error: "City and state are required" }, { status: 400 });
    }

    // Buscar listings recentes da cidade específica
    const recentListings = await prisma.listing.findMany({
      where: {
        isApproved: true,
        isActive: { not: false },
        state: {
          contains: state.replace('-', ' ')
        },
        city: {
          contains: city.replace('-', ' ')
        }
      },
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
        isHighlighted: true,
        featureTier: true,
        availableNow: true,
        availableUntil: true,
        isWhatsAppAvailable: true,
        user: {
          select: {
            id: true,
            name: true,
            verified: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Formatar os dados para incluir campos JSON parseados e tempo relativo
    const formattedListings = recentListings.map(listing => {
      const now = new Date();
      const createdAt = new Date(listing.createdAt);
      const diffInHours = Math.floor((now - createdAt) / (1000 * 60 * 60));

      let timeAgo;
      if (diffInHours < 1) {
        timeAgo = 'Há poucos minutos';
      } else if (diffInHours < 24) {
        timeAgo = `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        timeAgo = `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
      }

      // Helper function to safely parse JSON
      const safeJsonParse = (data) => {
        if (!data) return [];

        // If it's already an array, return it directly
        if (Array.isArray(data)) {
          return data;
        }

        // If it's not a string, try to convert or return empty array
        if (typeof data !== 'string') {
          // If it's an object with length property (like array-like object), convert to array
          if (data && typeof data === 'object' && data.length !== undefined) {
            return Array.from(data);
          }
          console.warn('Expected string or array but got:', typeof data, data);
          return [];
        }

        try {
          // Check if it's a data URL or base64 image
          if (data.startsWith('data:image') || data.startsWith('/9j/') || data.startsWith('iVBOR')) {
            return [data]; // Return as single image array
          }
          return JSON.parse(data);
        } catch (e) {
          console.warn('Failed to parse JSON:', data.substring(0, 50) + '...');
          return [];
        }
      };

      // Parse images and convert to full secure-file URLs
      const rawImages = safeJsonParse(listing.images);
      const formattedImages = rawImages.map(img => {
        if (!img) return null;
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `/api/secure-files?path=users/listings/${img}&type=listing`;
      }).filter(Boolean);

      return {
        ...listing,
        images: formattedImages,
        services: safeJsonParse(listing.services),
        availability: safeJsonParse(listing.availability),
        timeAgo
      };
    });

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error("Error in /api/listings/recent:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}