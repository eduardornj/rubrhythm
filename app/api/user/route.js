import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar dados do usuário incluindo créditos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        verified: true,
        role: true,
        image: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, settings } = body;

    // Atualizar dados do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(settings && { settings })
      },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        verified: true,
        role: true,
        image: true,
        settings: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json({ error: "Failed to update user data" }, { status: 500 });
  }
}