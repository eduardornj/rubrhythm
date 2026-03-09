import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

export async function POST(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, isBanned } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: isBanned === "true" || isBanned === true },
    });

    return NextResponse.json({ message: "Ban status updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating ban status:", error);
    return NextResponse.json({ error: "Failed to update ban status" }, { status: 500 });
  }
}