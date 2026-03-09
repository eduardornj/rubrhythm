import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentCity = searchParams.get('city');
    const currentState = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit')) || 6;

    if (!currentCity || !currentState) {
      return NextResponse.json({ error: "City and state are required" }, { status: 400 });
    }

    // Buscar cidades próximas do mesmo estado que tenham listings ativos
    const nearbyCities = await prisma.listing.groupBy({
      by: ['city'],
      where: {
        state: {
          contains: currentState.replace('-', ' ')
        },
        city: {
          not: {
            contains: currentCity.replace('-', ' ')
          }
        },
        isApproved: true,
        isActive: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    // Formatar os dados para incluir o nome da cidade e contagem
    const formattedCities = nearbyCities.map(cityGroup => ({
      name: cityGroup.city,
      count: cityGroup._count.id,
      slug: cityGroup.city.toLowerCase().replace(/\s+/g, '-')
    }));

    return NextResponse.json(formattedCities);
  } catch (error) {
    console.error("Error in /api/cities/nearby:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}