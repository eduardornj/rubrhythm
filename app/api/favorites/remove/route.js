import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

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

    // Verificar se está favoritado
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId
        }
      }
    });

    if (!existingFavorite) {
      return NextResponse.json({ error: "Not favorited." }, { status: 400 });
    }

    // Remover dos favoritos
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Removed from favorites" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite." }, { status: 500 });
  }
}