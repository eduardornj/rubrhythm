import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma.js";

export async function POST(request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const id = formData.get("id");

  try {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
    });
    if (!verificationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationRequest.userId },
        data: { verified: true },
      }),
      prisma.verificationRequest.update({
        where: { id },
        data: { status: "approved" },
      }),
    ]);

    return NextResponse.json({ message: "Verification approved" });
  } catch (error) {
    console.error("Error approving verification:", error);
    return NextResponse.json({ error: "Error approving verification" }, { status: 500 });
  }
}