import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { v4 as uuidv4 } from 'uuid';

import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = params;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        clientId: true,
        providerId: true
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this conversation (admin can view all)
    if (conversation.clientId !== session.user.id && conversation.providerId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: session.user.id },
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      messages: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = params;
    const { content } = await request.json();

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        clientId: true,
        providerId: true,
        isAnonymous: true
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isClient = conversation.clientId === session.user.id;
    const isProvider = conversation.providerId === session.user.id;

    // Check if user is part of this conversation
    if (!isClient && !isProvider) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // If the sender is the client, charge them based on the identity lock
    if (isClient) {
      const creditCost = conversation.isAnonymous ? 2 : 1;

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      if (!user || user.credits < creditCost) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 402 }
        );
      }

      // Deduct the credits and log the transaction
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: creditCost } }
        }),
        prisma.credittransaction.create({
          data: {
            id: uuidv4(),
            userId: session.user.id,
            amount: -creditCost,
            type: "SPEND",
            description: conversation.isAnonymous ? "Anonymous Message Sent" : "Private Message Sent",
            relatedId: conversation.id
          }
        })
      ]);
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        id: uuidv4(),
        content: content.trim(),
        senderId: session.user.id,
        conversationId: conversation.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(
      { message: newMessage },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}