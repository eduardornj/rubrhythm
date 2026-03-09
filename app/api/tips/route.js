import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET - Fetch tips for current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tips = await prisma.tip.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ tips });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Send a tip
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { providerId, amount, message, listingTitle } = await request.json();

    if (!providerId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Provider ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Prevent self-tipping
    if (session.user.id === providerId) {
      return NextResponse.json(
        { message: 'You cannot send a tip to yourself' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      select: { id: true, name: true, email: true }
    });

    if (!provider) {
      return NextResponse.json(
        { message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Create tip record
    const tip = await prisma.tip.create({
      data: {
        senderId: session.user.id,
        receiverId: providerId,
        amount: parseFloat(amount),
        message: message || null,
        listingTitle: listingTitle || null,
        status: 'completed' // Tips are immediately completed, no escrow
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log the tip transaction (for record keeping)
    await prisma.credittransaction.create({
      data: {
        id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        amount: -parseFloat(amount),
        type: 'tip_sent',
        description: `Tip sent to ${provider.name || provider.email}${listingTitle ? ` for ${listingTitle}` : ''}`,
        relatedId: tip.id
      }
    });

    await prisma.credittransaction.create({
      data: {
        id: `ct_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
        userId: providerId,
        amount: parseFloat(amount),
        type: 'tip_received',
        description: `Tip received from ${session.user.name || session.user.email}${listingTitle ? ` for ${listingTitle}` : ''}`,
        relatedId: tip.id
      }
    });

    return NextResponse.json({ 
      tip,
      message: 'Tip sent successfully!' 
    });
  } catch (error) {
    console.error('Error sending tip:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}