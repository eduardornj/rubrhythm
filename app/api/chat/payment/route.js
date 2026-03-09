import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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

    // Validate payment amount (should be $5 per message)
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

    // In a real implementation, you would integrate with Stripe/PayPal here
    // For now, we'll simulate a successful payment

    // Create payment record
    const payment = await prisma.chatpayment.create({
      data: {
        chatId,
        amount,
        messagesCount,
        paymentMethod: 'credit_card', // This would come from actual payment processor
        paymentId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed'
      }
    });

    // Update chat with new credits
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        creditsRemaining: { increment: messagesCount },
        totalPaid: { increment: amount }
      }
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        messagesCount: payment.messagesCount,
        paymentId: payment.paymentId,
        status: payment.status
      },
      chat: {
        creditsRemaining: updatedChat.creditsRemaining,
        totalPaid: updatedChat.totalPaid
      }
    });

  } catch (error) {
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

    // Get chat to verify participation
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: {
          select: { userId: true }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Authorization: only participants of this chat can view payment history
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
