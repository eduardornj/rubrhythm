import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma.js";

export async function POST(request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, reason } = await request.json();

  try {
    const verificationRequest = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: "rejected",
        rejectionReason: reason,
      },
    });

    return NextResponse.json({ message: "Verification rejected" });
  } catch (error) {
    console.error("Error rejecting verification:", error);
    return NextResponse.json({ error: "Error rejecting verification" }, { status: 500 });
  }
}