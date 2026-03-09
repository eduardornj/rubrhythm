import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ isBanned: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isBanned: true }
    });

    return NextResponse.json({ 
      isBanned: user?.isBanned || false 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao verificar status de banimento:', error);
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      isBanned: false 
    }, { status: 500 });
  }
}