import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  try {
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { user: true },
      });

      if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      return NextResponse.json(listing, { status: 200 });
    }

    const listings = await prisma.listing.findMany({
      include: { user: true },
    });

    return NextResponse.json(listings, { status: 200 });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}