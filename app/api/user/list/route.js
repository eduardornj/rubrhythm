import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth"; // Verifique o caminho

export async function GET(request) {
  const session = await auth();

  // Verifica se há uma sessão ativa
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    if (userId) {
      // Permite acesso se o userId for do usuário logado ou se for admin
      if (userId === session.user.id || session.user.role === "admin") {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            verified: true,
            isBanned: true,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Busca todos os usuários só se for admin
    if (session.user.role === "admin") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verified: true,
          isBanned: true,
        },
      });
      return NextResponse.json(users, { status: 200 });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}