import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { isActive } = await request.json();

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

    // Check if campaign has expired
    const now = new Date();
    if (campaign.endDate < now && isActive) {
      return NextResponse.json({ 
        error: 'Cannot activate expired campaign. Please extend the duration first.' 
      }, { status: 400 });
    }

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id: id },
      data: { 
        isActive,
        ...(isActive && { resumedAt: now }),
        ...(!isActive && { pausedAt: now })
      }
    });

    return NextResponse.json({ 
      campaign: updatedCampaign,
      message: `Campaign ${isActive ? 'resumed' : 'paused'} successfully`
    });
  } catch (error) {
    console.error('Error toggling campaign:', error);
    return NextResponse.json({ error: 'Failed to toggle campaign' }, { status: 500 });
  }
}