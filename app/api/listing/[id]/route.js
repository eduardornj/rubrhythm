import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";
import { formatImageUrls, safeJsonParse } from "@/lib/json-utils";

export async function GET(request, context) {
  // Resolvemos params com await, pois é uma Promise
  const params = await context.params;
  const { id } = params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true,
            image: true,
            lastSeen: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Parse JSON fields safely
    const formattedListing = {
      ...listing,
      images: formatImageUrls(listing.images),
      services: safeJsonParse(listing.services),
      availability: safeJsonParse(listing.availability)
    };

    return NextResponse.json(formattedListing, { status: 200 });
  } catch (err) {
    console.error("Error fetching listing:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}