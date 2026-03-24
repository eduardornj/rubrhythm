import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// SECURED — Chat payment now deducts from user's credit balance instead of simulating free payments

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId, amount, messagesCount } = await request.json();

    if (!chatId || !amount || !messagesCount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate payment amount (should be 5 credits per message)
    if (amount !== 5 || messagesCount !== 1) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount or message count" },
        { status: 400 }
      );
    }

    // Get chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Authorization: only the client of this chat can make payments
    if (chat.clientId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Deduct credits from user balance and add chat credits atomically
    // Balance check INSIDE transaction to prevent TOCTOU race condition
    const result = await prisma.$transaction(async (tx) => {
      // Check balance atomically inside transaction
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      if (!user || user.credits < amount) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      // Deduct from user credits
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: amount } }
      });

      // Sync creditbalance
      await tx.creditbalance.upsert({
        where: { userId: session.user.id },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${session.user.id}`, userId: session.user.id, balance: updatedUser.credits }
      });

      // Record credit transaction
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          amount: -amount,
          type: "CHAT_PAYMENT",
          description: `Chat message payment — chatId:${chatId}`,
        }
      });

      // Create payment record
      const payment = await tx.chatpayment.create({
        data: {
          chatId,
          amount,
          messagesCount,
          paymentMethod: 'credits',
          paymentId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'completed'
        }
      });

      // Update chat with new message credits
      const updatedChat = await tx.chat.update({
        where: { id: chatId },
        data: {
          creditsRemaining: { increment: messagesCount },
          totalPaid: { increment: amount }
        }
      });

      return { payment, updatedChat };
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        messagesCount: result.payment.messagesCount,
        paymentId: result.payment.paymentId,
        status: result.payment.status
      },
      chat: {
        creditsRemaining: result.updatedChat.creditsRemaining,
        totalPaid: result.updatedChat.totalPaid
      }
    });

  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { success: false, error: "Insufficient credits. Please purchase more credits." },
        { status: 400 }
      );
    }
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve payment history
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { listing: { select: { userId: true } } }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const isClient = chat.clientId === session.user.id;
    const isProvider = chat.listing?.userId === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const payments = await prisma.chatpayment.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        messagesCount: payment.messagesCount,
        paymentId: payment.paymentId,
        status: payment.status,
        createdAt: payment.createdAt
      }))
    });

  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
