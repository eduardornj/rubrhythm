import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { state, city } = await params;

    // Busca listings reais do banco de dados por estado e cidade
    const listings = await prisma.listing.findMany({
      where: {
        state: state.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        city: city.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        isApproved: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Formata os dados para incluir campos JSON parseados
    const formattedListings = listings.map(listing => ({
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : [],
      services: listing.services ? JSON.parse(listing.services) : [],
      availability: listing.availability ? JSON.parse(listing.availability) : []
    }));

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error("Error in /api/states/[state]/cities/[city]/massagistas:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}