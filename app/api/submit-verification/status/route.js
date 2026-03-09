import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma.js";

export async function GET(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const request = await prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (request) {
      return NextResponse.json({
        status: request.status,
        rejectionReason: request.rejectionReason || null,
      });
    } else {
      return NextResponse.json({ message: "No verification request found" });
    }
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json({ error: "Error fetching verification status" }, { status: 500 });
  }
}