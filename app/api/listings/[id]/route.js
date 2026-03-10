import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Buscar o anúncio
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            lastSeen: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        bodyType: listing.bodyType,
        ethnicity: listing.ethnicity,
        serviceLocation: listing.serviceLocation,
        phoneArea: listing.phoneArea,
        phoneNumber: listing.phoneNumber,
        country: listing.country,
        state: listing.state,
        city: listing.city,
        neighborhood: listing.neighborhood,
        websiteUrl: listing.websiteUrl,
        images: Array.isArray(listing.images) ? listing.images : (listing.images ? (() => { try { return JSON.parse(listing.images); } catch { return []; } })() : []),
        services: Array.isArray(listing.services) ? listing.services : (listing.services ? (() => { try { return JSON.parse(listing.services); } catch { return []; } })() : []),
        priceRange: listing.priceRange,
        hourlyRate: listing.hourlyRate,
        availability: Array.isArray(listing.availability) ? listing.availability : (listing.availability ? (() => { try { return JSON.parse(listing.availability); } catch { return []; } })() : []),
        age: listing.age,
        rates: listing.rates,
        socialLinks: listing.socialLinks,
        viewCount: listing.viewCount,
        userId: listing.userId,
        status: listing.status,
        isApproved: listing.isApproved,
        isActive: listing.isActive,
        isFeatured: listing.isFeatured,
        isHighlighted: listing.isHighlighted,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        user: {
          id: listing.user?.id,
          name: listing.user?.name,
          lastSeen: listing.user?.lastSeen,
          ...(session.user.id === listing.userId || session.user.role === 'admin'
            ? { email: listing.user?.email }
            : {}),
        }
      }
    });

  } catch (error) {
    console.error('Get listing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Verificar se o anúncio existe e pertence ao usuário
    const existingListing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to edit this listing' }, { status: 403 });
    }

    // Atualizar o anúncio
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        bodyType: body.bodyType,
        ethnicity: body.ethnicity,
        serviceLocation: body.serviceLocation,
        phoneArea: body.phoneArea,
        phoneNumber: body.phoneNumber,
        country: body.country,
        state: body.state,
        city: body.city,
        neighborhood: body.neighborhood,
        websiteUrl: body.websiteUrl,
        images: Array.isArray(body.images) ? body.images.filter(img => typeof img === 'string' && img.length > 0) : [],
        priceRange: body.priceRange,
        hourlyRate: body.hourlyRate ? parseInt(body.hourlyRate) : null,
        availability: body.availability || [],
        age: body.age ? parseInt(body.age) : null,
        rates: Array.isArray(body.rates) ? body.rates : [],
        socialLinks: body.socialLinks || {},
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing
    });

  } catch (error) {
    console.error('Update listing API error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Verificar se o anúncio existe e pertence ao usuário
    const existingListing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to delete this listing' }, { status: 403 });
    }

    // Deletar o anúncio
    await prisma.listing.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('Delete listing API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}