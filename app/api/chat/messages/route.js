import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

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
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Verificar se o chat existe
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Authorization: user must be the client, the provider (listing owner), or an admin
    const isClient = chat.clientId === session.user.id;
    const isProvider = chat.listing?.userId === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Buscar todas as mensagens do chat
    const messages = await prisma.chatmessage.findMany({
      where: {
        chatId: chatId
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        senderType: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      messages: messages,
      chat: {
        id: chat.id,
        clientId: chat.clientId,
        listingId: chat.listingId,
        creditsRemaining: chat.creditsRemaining,
        messagesCount: chat.messagesCount,
        providerId: chat.listing?.userId
      }
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
