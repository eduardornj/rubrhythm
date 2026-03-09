import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
  }

  try {
    await prisma.listing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({ message: "Listing deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}