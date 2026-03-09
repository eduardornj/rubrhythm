import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorite: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: session.user.id, listingId },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite }, { status: 200 });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json({ error: "Failed to check favorite." }, { status: 500 });
  }
}