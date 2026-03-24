import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

const chatLimiter = rateLimit({ interval: 60_000, limit: 15 });

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit per user (15 messages/min)
    const { success: rateLimitOk } = chatLimiter.check(session.user.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { success: false, error: "Too many messages. Please wait a moment." },
        { status: 429 }
      );
    }

    const { chatId, content, senderType } = await request.json();

    // Use authenticated user's ID instead of client-provided senderId
    const senderId = session.user.id;

    if (!chatId || !content || !senderType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate content length (max 2000 chars)
    if (typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Message must be between 1 and 2000 characters" },
        { status: 400 }
      );
    }

    // Validate content for inappropriate material
    const inappropriateWords = [
      'sex', 'sexual', 'porn', 'nude', 'naked', 'escort', 'prostitute',
      'illegal', 'drugs', 'weapon', 'violence', 'threat'
    ];

    const hasInappropriateContent = inappropriateWords.some(word =>
      content.toLowerCase().includes(word)
    );

    if (hasInappropriateContent) {
      return NextResponse.json(
        { success: false, error: "Message contains inappropriate content" },
        { status: 400 }
      );
    }

    // Get chat and check credits
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // SECURITY: Verify sender is a participant of this chat
    if (chat.clientId !== senderId && chat.providerId !== senderId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: you are not a participant of this chat" },
        { status: 403 }
      );
    }

    // Check if user has sufficient credits (5 dollars per message)
    const requiredAmount = 5.0;

    // Create message, debit credits, and update chat in a single transaction
    // Balance check is INSIDE transaction to prevent TOCTOU race condition
    const result = await prisma.$transaction(async (tx) => {
      // Check balance atomically inside transaction
      const user = await tx.user.findUnique({
        where: { id: senderId },
        select: { credits: true }
      });

      if (!user || (user.credits || 0) < requiredAmount) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      // Deduct from single source of truth (user.credits)
      const updatedUser = await tx.user.update({
        where: { id: senderId },
        data: { credits: { decrement: requiredAmount } }
      });

      // Keep creditbalance in sync
      const updatedBalance = await tx.creditbalance.upsert({
        where: { userId: senderId },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${Date.now()}`, userId: senderId, balance: updatedUser.credits }
      });

      // Create credit transaction record
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: senderId,
          amount: -requiredAmount,
          type: 'spent',
          description: `Chat message sent to ${senderType === 'client' ? 'provider' : 'client'}`,
          relatedId: chatId
        }
      });

      // Create the message
      const message = await tx.chatmessage.create({
        data: {
          chatId,
          content: content.trim(),
          senderId,
          senderType,
          isRead: false
        }
      });

      // Update chat message count and total paid
      const updatedChat = await tx.chat.update({
        where: { id: chatId },
        data: {
          messagesCount: { increment: 1 },
          totalPaid: { increment: requiredAmount },
          lastMessageAt: new Date()
        }
      });

      return { message, updatedChat, newBalance: updatedBalance.balance };
    });

    // Auto-delete messages if count reaches 30
    if (result.updatedChat.messagesCount >= 30) {
      // Keep only the latest message
      const latestMessage = await prisma.chatmessage.findFirst({
        where: { chatId },
        orderBy: { createdAt: 'desc' }
      });

      if (latestMessage) {
        await prisma.chatmessage.deleteMany({
          where: {
            chatId,
            id: { not: latestMessage.id }
          }
        });

        // Reset message count to 1
        await prisma.chat.update({
          where: { id: chatId },
          data: { messagesCount: 1 }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: result.message.id,
        content: result.message.content,
        senderType: result.message.senderType,
        createdAt: result.message.createdAt,
        isRead: result.message.isRead
      },
      newBalance: result.newBalance,
      messagesCount: result.updatedChat.messagesCount >= 30 ? 1 : result.updatedChat.messagesCount
    });

  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { success: false, error: "Insufficient credits. Please add more credits to continue chatting." },
        { status: 400 }
      );
    }
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
