import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// API pública para listar anúncios com sistema de bump up
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      isApproved: true,
      isActive: true
    };

    if (city) {
      where.city = {
        contains: city
      };
    }

    if (state) {
      where.state = {
        contains: state
      };
    }

    // Buscar anúncios com ordenação especial para bump up
    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true
          }
        },
        _count: {
          select: {
            favorites: true,
            reviews: true
          }
        }
      },
      orderBy: [
        // Primeiro: anúncios em destaque (featured)
        {
          isFeatured: 'desc'
        },
        // Segundo: anúncios com bump up recente (últimas 24h)
        {
          lastBumpUp: 'desc'
        },
        // Terceiro: anúncios destacados (highlighted)
        {
          isHighlighted: 'desc'
        },
        // Quarto: data de atualização (mais recentes primeiro)
        {
          updatedAt: 'desc'
        },
        // Quinto: data de criação
        {
          createdAt: 'desc'
        }
      ],
      skip,
      take: limit
    });

    // Contar total para paginação
    const total = await prisma.listing.count({ where });

    // Processar dados para incluir informações de bump up
    const processedListings = listings.map(listing => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      return {
        ...listing,
        // Indicar se teve bump up recente
        hasRecentBumpUp: listing.lastBumpUp && listing.lastBumpUp > oneDayAgo,
        // Calcular "freshness" do anúncio
        daysSinceUpdate: Math.floor((now - new Date(listing.updatedAt)) / (1000 * 60 * 60 * 24)),
        daysSinceBumpUp: listing.lastBumpUp ? 
          Math.floor((now - new Date(listing.lastBumpUp)) / (1000 * 60 * 60 * 24)) : null
      };
    });

    return NextResponse.json({
      listings: processedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        city,
        state
      }
    });

  } catch (error) {
    console.error("Error fetching public listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST para busca avançada
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      city,
      state,
      bodyType,
      ethnicity,
      priceRange,
      age,
      services,
      page = 1,
      limit = 20
    } = body;

    const skip = (page - 1) * limit;

    // Construir filtros avançados
    const where = {
      isApproved: true,
      isActive: true
    };

    if (city) {
      where.city = {
        contains: city
      };
    }

    if (state) {
      where.state = {
        contains: state
      };
    }

    if (bodyType) {
      where.bodyType = bodyType;
    }

    if (ethnicity) {
      where.ethnicity = ethnicity;
    }

    if (priceRange) {
      where.priceRange = priceRange;
    }

    if (age) {
      where.age = {
        gte: age.min || 18,
        lte: age.max || 99
      };
    }

    if (services && services.length > 0) {
      // Buscar por serviços específicos no JSON
      where.services = {
        path: '$',
        array_contains: services
      };
    }

    // Buscar com mesma ordenação que considera bump up
    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true
          }
        },
        _count: {
          select: {
            favorites: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { lastBumpUp: 'desc' },
        { isHighlighted: 'desc' },
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    });

    const total = await prisma.listing.count({ where });

    // Processar dados
    const processedListings = listings.map(listing => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      return {
        ...listing,
        hasRecentBumpUp: listing.lastBumpUp && listing.lastBumpUp > oneDayAgo,
        daysSinceUpdate: Math.floor((now - new Date(listing.updatedAt)) / (1000 * 60 * 60 * 24)),
        daysSinceBumpUp: listing.lastBumpUp ? 
          Math.floor((now - new Date(listing.lastBumpUp)) / (1000 * 60 * 60 * 24)) : null
      };
    });

    return NextResponse.json({
      listings: processedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: body
    });

  } catch (error) {
    console.error("Error in advanced search:", error);
    return NextResponse.json(
      { error: "Failed to search listings" },
      { status: 500 }
    );
  }
}