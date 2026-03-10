import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            views: true,
            clicks: true
          }
        }
      }
    });

    // Use real view/click counts from Prisma _count relation
    const campaignsWithStats = campaigns.map(campaign => ({
      ...campaign,
      views: campaign._count?.views || 0,
      clicks: campaign._count?.clicks || 0,
    }));

    return NextResponse.json({ campaigns: campaignsWithStats });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, duration, budget, targetAudience, description } = await request.json();

    // Validate required fields
    if (!name || !type || !duration || !budget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate campaign type and pricing
    const campaignPricing = {
      'featured': 1.50, // per day
      'bump': 1.00, // one-time
      'premium': 3.00 // per day
    };

    if (!campaignPricing[type]) {
      return NextResponse.json({ error: 'Invalid campaign type' }, { status: 400 });
    }

    // Calculate total cost
    const dailyRate = campaignPricing[type];
    const totalCost = type === 'bump' ? dailyRate : dailyRate * duration;

    if (budget < totalCost) {
      return NextResponse.json({
        error: `Insufficient budget. Minimum required: $${totalCost.toFixed(2)}`
      }, { status: 400 });
    }

    // SECURITY: Check and deduct credits before creating campaign
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user || user.credits < totalCost) {
      return NextResponse.json({ error: 'Insufficient credits for this campaign.' }, { status: 400 });
    }

    // Atomic: deduct credits + create campaign
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: totalCost } }
      });

      await tx.creditbalance.upsert({
        where: { userId: session.user.id },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${session.user.id}`, userId: session.user.id, balance: updatedUser.credits }
      });

      const campaign = await tx.campaign.create({
        data: {
          name,
          type,
          duration,
          budget,
          targetAudience: targetAudience || 'all',
          description: description || '',
          userId: session.user.id,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        }
      });

      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          amount: -totalCost,
          type: 'campaign_created',
          description: `Campaign "${name}" (${type}, ${duration} days)`,
          relatedId: campaign.id
        }
      });

      return campaign;
    });

    return NextResponse.json({ campaign: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}