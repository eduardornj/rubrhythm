import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            views: true,
            clicks: true
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Add mock analytics data
    const campaignWithStats = {
      ...campaign,
      views: Math.floor(Math.random() * 500) + 50,
      clicks: Math.floor(Math.random() * 100) + 10,
      impressions: Math.floor(Math.random() * 1000) + 100,
      ctr: ((Math.floor(Math.random() * 100) + 10) / (Math.floor(Math.random() * 500) + 50) * 100).toFixed(2)
    };

    return NextResponse.json({ campaign: campaignWithStats });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, type, duration, budget, targetAudience, description } = await request.json();

    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Validate campaign type and pricing if type is being changed
    if (type && type !== existingCampaign.type) {
      const campaignPricing = {
        'featured': 1.50,
        'bump': 1.00,
        'premium': 3.00
      };

      if (!campaignPricing[type]) {
        return NextResponse.json({ error: 'Invalid campaign type' }, { status: 400 });
      }

      // Recalculate cost if type or duration changed
      const dailyRate = campaignPricing[type];
      const newDuration = duration || existingCampaign.duration;
      const totalCost = type === 'bump' ? dailyRate : dailyRate * newDuration;
      const newBudget = budget || existingCampaign.budget;

      if (newBudget < totalCost) {
        return NextResponse.json({ 
          error: `Insufficient budget. Minimum required: $${totalCost.toFixed(2)}` 
        }, { status: 400 });
      }
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(duration && { 
          duration,
          endDate: new Date(existingCampaign.startDate.getTime() + duration * 24 * 60 * 60 * 1000)
        }),
        ...(budget && { budget }),
        ...(targetAudience && { targetAudience }),
        ...(description !== undefined && { description })
      }
    });

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}