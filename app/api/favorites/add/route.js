import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

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

    // Verificar se o anúncio existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    // Verificar se já está favoritado
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json({ error: "Already favorited." }, { status: 400 });
    }

    // Adicionar aos favoritos
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        listingId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Added to favorites",
      favorite 
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite." }, { status: 500 });
  }
}