import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Busca o listing pelo ID usando Prisma
    const listing = await prisma.listing.findUnique({
      where: { id },
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
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Parse JSON fields
    const formattedListing = {
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : [],
      services: listing.services ? JSON.parse(listing.services) : [],
      availability: listing.availability ? JSON.parse(listing.availability) : []
    };

    return NextResponse.json(formattedListing);
  } catch (error) {
    console.error("Error in /api/massagistas/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}