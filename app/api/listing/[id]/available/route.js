import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const AVAILABLE_NOW_COST = 3; // créditos por ativação (6h)

function isExpired(availableUntil) {
  return !availableUntil || new Date(availableUntil) <= new Date();
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, availableNow: true, availableUntil: true, userId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Auto-expire: if availableUntil has passed, mark as unavailable
    if (listing.availableNow && isExpired(listing.availableUntil)) {
      await prisma.listing.update({
        where: { id },
        data: { availableNow: false, availableUntil: null },
      });
      return NextResponse.json({ availableNow: false, availableUntil: null });
    }

    return NextResponse.json({
      availableNow: listing.availableNow,
      availableUntil: listing.availableUntil,
    });
  } catch (error) {
    console.error('GET available error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { available, autoRenew, setAutoRenew } = body;

    // Verify listing belongs to the authenticated user
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, userId: true, isApproved: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!listing.isApproved) {
      return NextResponse.json({ error: 'Listing must be approved to toggle availability' }, { status: 400 });
    }

    // Handle standalone auto-renew toggle (no activation/deactivation)
    if (typeof setAutoRenew === 'boolean' && available === undefined) {
      const updated = await prisma.listing.update({
        where: { id },
        data: { autoRenewAvailable: setAutoRenew },
        select: { id: true, autoRenewAvailable: true },
      });
      return NextResponse.json(updated);
    }

    if (typeof available !== 'boolean') {
      return NextResponse.json({ error: 'Field "available" must be a boolean' }, { status: 400 });
    }

    // Turning OFF is always free
    if (!available) {
      const updated = await prisma.listing.update({
        where: { id },
        data: { availableNow: false, availableUntil: null },
        select: { id: true, availableNow: true, availableUntil: true },
      });
      return NextResponse.json(updated);
    }

    // Turning ON costs credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < AVAILABLE_NOW_COST) {
      return NextResponse.json({
        error: `Insufficient credits. "Available Now" costs ${AVAILABLE_NOW_COST} credits (2h). Your balance: ${user?.credits ?? 0} credits.`,
        required: AVAILABLE_NOW_COST,
        available: user?.credits ?? 0,
      }, { status: 402 });
    }

    // Deduct credits + activate + log transaction in a single transaction
    const [updated] = await prisma.$transaction([
      prisma.listing.update({
        where: { id },
        data: {
          availableNow: true,
          availableUntil: new Date(Date.now() + SIX_HOURS_MS),
          autoRenewAvailable: autoRenew || false,
        },
        select: { id: true, availableNow: true, availableUntil: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: AVAILABLE_NOW_COST } },
      }),
      prisma.credittransaction.create({
        data: {
          id: randomUUID(),
          userId: session.user.id,
          amount: -AVAILABLE_NOW_COST,
          type: 'available_now',
          description: `Available Now activated (6h)`,
          relatedId: id,
        },
      }),
    ]);

    return NextResponse.json({ ...updated, creditsCost: AVAILABLE_NOW_COST });
  } catch (error) {
    console.error('PATCH available error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
