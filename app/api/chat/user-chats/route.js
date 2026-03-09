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

    // Use authenticated user's ID instead of client-provided userId
    const userId = session.user.id;

    // Buscar saldo de créditos do usuário
    const userCreditBalance = await prisma.creditbalance.findUnique({
      where: { userId }
    });

    const userBalance = userCreditBalance?.balance || 0;
    const messagesCost = 5; // $5 por mensagem
    const maxCreditsFromBalance = Math.floor(userBalance / messagesCost);

    // Buscar chats onde o usuário é cliente ou provedor
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { clientId: userId },
          {
            listing: {
              userId: userId
            }
          }
        ]
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            userId: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Formatar os dados para o frontend
    const formattedChats = chats.map(chat => {
      // Calcular créditos restantes baseado no saldo do usuário e limite de 30 mensagens
      const messagesRemaining = Math.max(0, 30 - chat.messagesCount);
      const creditsFromBalance = maxCreditsFromBalance;
      const creditsRemaining = Math.min(messagesRemaining, creditsFromBalance);

      return {
        id: chat.id,
        clientId: chat.clientId,
        listingId: chat.listingId,
        creditsRemaining: creditsRemaining,
        messagesCount: chat.messagesCount,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        lastMessageAt: chat.messages[0]?.createdAt || chat.createdAt,
        lastMessage: chat.messages[0]?.content || null,
        listing: chat.listing
      };
    });

    return NextResponse.json({
      success: true,
      chats: formattedChats
    });

  } catch (error) {
    console.error('Error fetching user chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}
