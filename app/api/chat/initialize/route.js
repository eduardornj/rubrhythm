import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { providerId, listingId } = await request.json();

    // Use authenticated user's ID as clientId instead of client-provided value
    const clientId = session.user.id;

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: providerId is required" },
        { status: 400 }
      );
    }

    // Check if chat already exists
    const whereClause = {
      clientId,
      providerId,
      isActive: true
    };

    // Add listingId to where clause only if provided
    if (listingId) {
      whereClause.listingId = listingId;
    }
    // If listingId is not provided, we omit it from the query (undefined means "don't filter by this field")

    let chat = await prisma.chat.findFirst({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50 // Limit messages for performance
        }
      }
    });

    // Create new chat if doesn't exist
    if (!chat) {
      // Check if provider exists
      const provider = await prisma.user.findUnique({
        where: { id: providerId }
      });

      if (!provider) {
        return NextResponse.json(
          { success: false, error: "Provider not found" },
          { status: 404 }
        );
      }

      const chatData = {
        clientId,
        messagesCount: 0,
        totalPaid: 0,
        isActive: true,
        provider: {
          connect: { id: providerId }
        }
      };

      // Only add listing connection if listingId is provided
      if (listingId) {
        chatData.listing = {
          connect: { id: listingId }
        };
      }

      chat = await prisma.chat.create({
        data: chatData,
        include: {
          messages: true
        }
      });

      logActivity(clientId, 'chat_start', {
        target: providerId,
        metadata: { listingId },
        request,
      });
    }

    // Clean up old messages if count >= 30
    if (chat.messagesCount >= 30) {
      // Delete all but the last message
      const lastMessage = await prisma.chatmessage.findFirst({
        where: { chatId: chat.id },
        orderBy: { createdAt: 'desc' }
      });

      if (lastMessage) {
        await prisma.chatmessage.deleteMany({
          where: {
            chatId: chat.id,
            id: { not: lastMessage.id }
          }
        });

        // Reset message count
        chat = await prisma.chat.update({
          where: { id: chat.id },
          data: { messagesCount: 1 },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        messagesCount: chat.messagesCount,
        totalPaid: chat.totalPaid
      },
      messages: chat.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderType: msg.senderType,
        createdAt: msg.createdAt,
        isRead: msg.isRead
      }))
    });

  } catch (error) {
    console.error("Error initializing chat:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
