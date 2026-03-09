import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { v4 as uuidv4 } from 'uuid';

import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const listingId = searchParams.get('listingId');

    // Build where clause for conversations
    const whereClause = {};

    // Only apply participant filtering if the user is not an admin
    if (session.user.role !== 'admin') {
      whereClause.OR = [
        { clientId: session.user.id },
        { providerId: session.user.id }
      ];

      // If providerId is specified, filter conversations with that provider
      if (providerId) {
        whereClause.AND = [
          {
            OR: [
              { clientId: session.user.id, providerId: providerId },
              { clientId: providerId, providerId: session.user.id }
            ]
          }
        ];
      }
    } else {
      // If admin and they specifically want to filter by a provider
      if (providerId) {
        whereClause.OR = [
          { clientId: providerId },
          { providerId: providerId }
        ];
      }
    }

    // If listingId is specified, filter by listing
    if (listingId) {
      if (!whereClause.AND) whereClause.AND = [];
      whereClause.AND.push({ listingId: listingId });
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        user_conversation_clientIdTouser: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        },
        user_conversation_providerIdTouser: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        },
        message: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        },
        _count: {
          select: {
            message: {
              where: {
                senderId: { not: session.user.id },
                readAt: null
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      subject: conv.subject,
      clientId: conv.clientId,
      providerId: conv.providerId,
      listingId: conv.listingId,
      isAnonymous: conv.isAnonymous,
      createdAt: conv.createdAt,
      lastMessageAt: conv.message[0]?.createdAt || conv.createdAt,
      unreadCount: conv._count.message,
      otherUser: conv.clientId === session.user.id ? conv.user_conversation_providerIdTouser : conv.user_conversation_clientIdTouser,
      client: conv.user_conversation_clientIdTouser,
      provider: conv.user_conversation_providerIdTouser,
      listing: conv.listing
    }));

    return NextResponse.json({
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { providerId, listingId, subject, isAnonymous } = await request.json();

    if (!providerId || !subject?.trim()) {
      return NextResponse.json(
        { error: 'Provider ID and subject are required' },
        { status: 400 }
      );
    }

    // Prevent users from messaging themselves
    if (providerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      select: { id: true, name: true }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Verify listing exists if provided
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, userId: true }
      });

      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }

      // Ensure listing belongs to the provider
      if (listing.userId !== providerId) {
        return NextResponse.json(
          { error: 'Listing does not belong to provider' },
          { status: 400 }
        );
      }
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        clientId: session.user.id,
        providerId: providerId,
        listingId: listingId || null
      }
    });

    if (existingConversation) {
      return NextResponse.json(
        { error: 'Conversation already exists', conversationId: existingConversation.id },
        { status: 409 }
      );
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        id: uuidv4(),
        subject: subject.trim(),
        clientId: session.user.id,
        providerId: providerId,
        listingId: listingId || null,
        isAnonymous: isAnonymous === true
      },
      include: {
        user_conversation_clientIdTouser: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        user_conversation_providerIdTouser: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Format conversation for frontend
    const formattedConversation = {
      id: conversation.id,
      subject: conversation.subject,
      clientId: conversation.clientId,
      providerId: conversation.providerId,
      listingId: conversation.listingId,
      isAnonymous: conversation.isAnonymous,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.createdAt,
      unreadCount: 0,
      otherUser: conversation.user_conversation_providerIdTouser,
      listing: conversation.listing
    };

    return NextResponse.json({
      conversation: formattedConversation
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    try { require('fs').writeFileSync('./api-crash.log', error.stack || error.message); } catch (e) { }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}