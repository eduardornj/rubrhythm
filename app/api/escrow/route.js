import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import prisma from '@/lib/prisma';

// GET - Fetch escrows for user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');

    const where = {
      OR: [
        { clientId: session.user.id },
        { providerId: session.user.id }
      ]
    };

    if (listingId) {
      where.listingId = listingId;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (status) {
      where.status = status;
    }

    const escrows = await prisma.escrow.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ escrows });
  } catch (error) {
    console.error('Error fetching escrows:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new escrow
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description, terms, listingId, providerId } = await request.json();

    // Validation
    if (!amount || !description || !providerId) {
      return NextResponse.json(
        { message: 'Amount, description, and provider are required' },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { message: 'Minimum escrow amount is $1' },
        { status: 400 }
      );
    }

    if (description.length > 1000 || (terms && terms.length > 2000)) {
      return NextResponse.json(
        { message: 'Description or terms too long' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.user.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return NextResponse.json(
        { message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Verify listing exists if provided
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId }
      });

      if (!listing) {
        return NextResponse.json(
          { message: 'Listing not found' },
          { status: 404 }
        );
      }
    }

    // Create escrow
    const escrow = await prisma.escrow.create({
      data: {
        clientId: session.user.id,
        providerId,
        listingId,
        amount: parseFloat(amount),
        description,
        terms: terms || null,
        status: 'pending'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true
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

    // Log the escrow creation
    await prisma.escrowLog.create({
      data: {
        escrowId: escrow.id,
        userId: session.user.id,
        action: 'created',
        details: `Escrow created for $${amount} - ${description}`
      }
    });

    return NextResponse.json({ escrow }, { status: 201 });
  } catch (error) {
    console.error('Error creating escrow:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update escrow status
export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { escrowId, action, reason } = await request.json();

    if (!escrowId || !action) {
      return NextResponse.json(
        { message: 'Escrow ID and action are required' },
        { status: 400 }
      );
    }

    // Fetch escrow with current status
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        client: true,
        provider: true
      }
    });

    if (!escrow) {
      return NextResponse.json(
        { message: 'Escrow not found' },
        { status: 404 }
      );
    }

    const isClient = session.user.id === escrow.clientId;
    const isProvider = session.user.id === escrow.providerId;
    const isAdmin = session.user.role === 'admin';

    // Validate permissions and state transitions
    let newStatus = escrow.status;
    let updateData = {};

    switch (action) {
      case 'fund': {
        if (!isClient || escrow.status !== 'pending') {
          return NextResponse.json(
            { message: 'Cannot fund this escrow' },
            { status: 403 }
          );
        }
        // SECURITY: Balance check + deduction inside transaction to prevent TOCTOU race
        try {
        await prisma.$transaction(async (tx) => {
          const funder = await tx.user.findUnique({
            where: { id: escrow.clientId },
            select: { credits: true }
          });
          if (!funder || funder.credits < escrow.amount) {
            throw new Error("INSUFFICIENT_CREDITS");
          }
          const updated = await tx.user.update({
            where: { id: escrow.clientId },
            data: { credits: { decrement: escrow.amount } }
          });
          await tx.creditbalance.upsert({
            where: { userId: escrow.clientId },
            update: { balance: updated.credits },
            create: { id: `cb_${escrow.clientId}`, userId: escrow.clientId, balance: updated.credits }
          });
          await tx.credittransaction.create({
            data: {
              id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: escrow.clientId,
              amount: -escrow.amount,
              type: 'escrow_funded',
              description: `Escrow funded: ${escrow.description}`,
              relatedId: escrowId
            }
          });
        });
        } catch (fundError) {
          if (fundError.message === "INSUFFICIENT_CREDITS") {
            return NextResponse.json(
              { message: 'Insufficient credits to fund this escrow.' },
              { status: 400 }
            );
          }
          throw fundError;
        }
        newStatus = 'funded';
        updateData.fundedAt = new Date();
        break;
      }

      case 'start':
        if (!isProvider || escrow.status !== 'funded') {
          return NextResponse.json(
            { message: 'Cannot start this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'in_progress';
        updateData.startedAt = new Date();
        break;

      case 'complete':
        if (!isProvider || escrow.status !== 'in_progress') {
          return NextResponse.json(
            { message: 'Cannot complete this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'completed';
        updateData.completedAt = new Date();
        break;

      case 'confirm':
        if (!isClient || escrow.status !== 'in_progress') {
          return NextResponse.json(
            { message: 'Cannot confirm this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'completed';
        updateData.completedAt = new Date();
        updateData.releasedAt = new Date();
        break;

      case 'dispute':
        if ((!isClient && !isProvider) || !['funded', 'in_progress'].includes(escrow.status)) {
          return NextResponse.json(
            { message: 'Cannot dispute this escrow' },
            { status: 403 }
          );
        }
        if (!reason) {
          return NextResponse.json(
            { message: 'Dispute reason is required' },
            { status: 400 }
          );
        }
        newStatus = 'disputed';
        updateData.disputeReason = reason;
        updateData.disputedAt = new Date();
        break;

      case 'resolve':
        if (!isAdmin || escrow.status !== 'disputed') {
          return NextResponse.json(
            { message: 'Cannot resolve this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'completed';
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = session.user.id;
        break;

      case 'cancel':
        if ((!isClient && !isProvider && !isAdmin) || !['pending', 'funded'].includes(escrow.status)) {
          return NextResponse.json(
            { message: 'Cannot cancel this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'cancelled';
        updateData.cancelledAt = new Date();
        break;

      case 'refund':
        if (!isAdmin || !['disputed', 'cancelled'].includes(escrow.status)) {
          return NextResponse.json(
            { message: 'Cannot refund this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'refunded';
        updateData.refundedAt = new Date();
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update escrow with optimistic lock: only update if status hasn't changed since we read it
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId, status: escrow.status },
      data: {
        status: newStatus,
        ...updateData
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true
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

    // Log the action
    await prisma.escrowLog.create({
      data: {
        escrowId,
        userId: session.user.id,
        action,
        details: reason || `Escrow ${action} by ${session.user.name || session.user.email}`,
        previousStatus: escrow.status,
        newStatus
      }
    });

    // Release escrowed credits to provider on completion
    // Credits were already deducted from client at fund time
    if (newStatus === 'completed' && escrow.status !== 'completed') {
      await prisma.$transaction(async (tx) => {
        // Release to provider (client already paid at fund step)
        const updatedProvider = await tx.user.update({
          where: { id: escrow.providerId },
          data: { credits: { increment: escrow.amount } }
        });

        await tx.creditbalance.upsert({
          where: { userId: escrow.providerId },
          update: { balance: updatedProvider.credits },
          create: { id: `cb_${escrow.providerId}`, userId: escrow.providerId, balance: updatedProvider.credits }
        });

        await tx.credittransaction.create({
          data: {
            id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: escrow.providerId,
            amount: escrow.amount,
            type: 'escrow_released',
            description: `Escrow released: ${escrow.description}`,
            relatedId: escrowId
          }
        });
      });
    }

    // Refund credits back to client on cancel (if was funded) or refund
    if ((newStatus === 'cancelled' && escrow.status === 'funded') || newStatus === 'refunded') {
      await prisma.$transaction(async (tx) => {
        const updatedClient = await tx.user.update({
          where: { id: escrow.clientId },
          data: { credits: { increment: escrow.amount } }
        });

        await tx.creditbalance.upsert({
          where: { userId: escrow.clientId },
          update: { balance: updatedClient.credits },
          create: { id: `cb_${escrow.clientId}`, userId: escrow.clientId, balance: updatedClient.credits }
        });

        await tx.credittransaction.create({
          data: {
            id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: escrow.clientId,
            amount: escrow.amount,
            type: 'escrow_refund',
            description: `Escrow refunded: ${escrow.description}`,
            relatedId: escrowId
          }
        });
      });
    }

    return NextResponse.json({ escrow: updatedEscrow });
  } catch (error) {
    console.error('Error updating escrow:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}