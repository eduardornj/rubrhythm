import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,

            city: true,
            state: true,
            country: true,
            images: true,
            services: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ favorites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites." }, { status: 500 });
  }
}