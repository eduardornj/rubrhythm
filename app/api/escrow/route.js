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
      case 'fund':
        if (!isClient || escrow.status !== 'pending') {
          return NextResponse.json(
            { message: 'Cannot fund this escrow' },
            { status: 403 }
          );
        }
        newStatus = 'funded';
        updateData.fundedAt = new Date();
        break;

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

    // Update escrow
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId },
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

    // Handle credit transactions for completed escrows
    if (newStatus === 'completed' && escrow.status !== 'completed') {
      try {
        // Transfer credits from client to provider
        await prisma.$transaction(async (tx) => {
          // Deduct from client (if using credit system)
          await tx.user.update({
            where: { id: escrow.clientId },
            data: {
              credits: {
                decrement: escrow.amount
              }
            }
          });

          // Add to provider
          await tx.user.update({
            where: { id: escrow.providerId },
            data: {
              credits: {
                increment: escrow.amount
              }
            }
          });

          // Log credit transactions
          await tx.credittransaction.createMany({
            data: [
              {
                userId: escrow.clientId,
                amount: -escrow.amount,
                type: 'escrow_payment',
                description: `Payment for: ${escrow.description}`,
                relatedId: escrowId
              },
              {
                userId: escrow.providerId,
                amount: escrow.amount,
                type: 'escrow_received',
                description: `Payment received: ${escrow.description}`,
                relatedId: escrowId
              }
            ]
          });
        });
      } catch (creditError) {
        console.error('Error processing credit transaction:', creditError);
        // Don't fail the escrow update if credit transaction fails
      }
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