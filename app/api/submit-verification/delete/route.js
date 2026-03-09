import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma.js";

export async function POST(request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing request id" }, { status: 400 });
  }

  try {
    await prisma.verificationRequest.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Verification request deleted successfully" });
  } catch (error) {
    console.error("Error deleting verification request:", error);
    return NextResponse.json({ error: "Error deleting verification request" }, { status: 500 });
  }
}