import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false }, { status: 200 });
    }

    const url = new URL(request.url);
    const listingId = url.searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { 
          userId: session.user.id, 
          listingId 
        },
      },
    });

    return NextResponse.json({ isFavorited: !!favorite }, { status: 200 });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json({ error: "Failed to check favorite." }, { status: 500 });
  }
}