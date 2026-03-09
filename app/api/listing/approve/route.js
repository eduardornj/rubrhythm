import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

export async function POST(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId, isApproved } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
  }

  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { isApproved: isApproved === "true" || isApproved === true },
    });

    return NextResponse.json({ message: "Approval status updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating approval status:", error);
    return NextResponse.json({ error: "Failed to update approval status" }, { status: 500 });
  }
}