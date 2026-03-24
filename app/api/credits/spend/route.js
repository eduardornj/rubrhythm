import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 20 }); // 20 per minute (chat messages)

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',').pop().trim() : 'unknown';
    const { success } = limiter.check(ip);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, amount, description, relatedId } = await request.json();

    if (!userId || !amount || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Authorization: only the user themselves or an admin can spend their credits
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Perform transaction to check balance AND debit atomically (prevents TOCTOU race condition)
    const result = await prisma.$transaction(async (tx) => {
      // Check balance inside transaction for atomicity
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });

      const currentBalance = user?.credits || 0;
      if (currentBalance < amount) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      // Deduct from single source of truth (user.credits)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } }
      });

      // Keep creditbalance in sync, create if missing
      const updatedBalance = await tx.creditbalance.upsert({
        where: { userId },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${Date.now()}`, userId, balance: updatedUser.credits }
      });

      // Create credit transaction record
      const transaction = await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          amount: -amount, // Negative for spending
          type: 'spent',
          description,
          relatedId: relatedId || null
        }
      });

      return { updatedBalance, transaction };
    });

    return NextResponse.json({
      success: true,
      newBalance: result.updatedBalance.balance,
      transaction: result.transaction
    });

  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { success: false, error: "Insufficient credits" },
        { status: 400 }
      );
    }
    console.error("Error spending credits:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
