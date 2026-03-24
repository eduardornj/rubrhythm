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

    const tipAmount = parseFloat(amount);

    // Atomic transaction: check balance + deduct sender, credit receiver, create tip + logs
    // Balance check INSIDE transaction to prevent TOCTOU race condition
    const result = await prisma.$transaction(async (tx) => {
      // Check sender credits atomically inside transaction
      const sender = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      if (!sender || sender.credits < tipAmount) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      // Deduct from sender
      const updatedSender = await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: tipAmount } }
      });

      // Credit receiver
      const updatedReceiver = await tx.user.update({
        where: { id: providerId },
        data: { credits: { increment: tipAmount } }
      });

      // Sync creditbalance for sender
      await tx.creditbalance.upsert({
        where: { userId: session.user.id },
        update: { balance: updatedSender.credits },
        create: { id: `cb_${session.user.id}`, userId: session.user.id, balance: updatedSender.credits }
      });

      // Sync creditbalance for receiver
      await tx.creditbalance.upsert({
        where: { userId: providerId },
        update: { balance: updatedReceiver.credits },
        create: { id: `cb_${providerId}`, userId: providerId, balance: updatedReceiver.credits }
      });

      // Create tip record
      const tip = await tx.tip.create({
        data: {
          senderId: session.user.id,
          receiverId: providerId,
          amount: tipAmount,
          message: message || null,
          listingTitle: listingTitle || null,
          status: 'completed'
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } }
        }
      });

      // Log sender debit
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          amount: -tipAmount,
          type: 'tip_sent',
          description: `Tip sent to ${provider.name || provider.email}${listingTitle ? ` for ${listingTitle}` : ''}`,
          relatedId: tip.id
        }
      });

      // Log receiver credit
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
          userId: providerId,
          amount: tipAmount,
          type: 'tip_received',
          description: `Tip received from ${session.user.name || session.user.email}${listingTitle ? ` for ${listingTitle}` : ''}`,
          relatedId: tip.id
        }
      });

      return tip;
    });

    return NextResponse.json({
      tip: result,
      message: 'Tip sent successfully!'
    });
  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { message: 'Insufficient credits to send this tip.' },
        { status: 400 }
      );
    }
    console.error('Error sending tip:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}