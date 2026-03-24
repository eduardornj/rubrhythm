import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { listingId, reason, details } = await req.json();

    if (!listingId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (reason.length > 500 || (details && details.length > 2000)) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // Use existing fraudreport model — no schema migration needed
    await prisma.fraudreport.create({
      data: {
        id: uuidv4(),
        type: "listing_report",
        severity: reason.includes("trafficking") || reason.includes("Underage") ? "high" : "medium",
        description: reason,
        evidence: details ? { details } : null,
        status: "pending",
        listingId: String(listingId),
        reporterId: "anonymous", // public report — no auth required
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
