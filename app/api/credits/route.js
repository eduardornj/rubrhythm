import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    if (userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // user.credits is the single source of truth — used by admin pages too
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const balance = user.credits ?? 0;

    // Keep creditbalance in sync (upsert) so the transactions table balanceAfter is also accurate
    await prisma.creditbalance.upsert({
      where: { userId },
      update: { balance },
      create: { id: `cb_${Date.now()}`, userId, balance }
    });

    return NextResponse.json({ balance, userId });

  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}