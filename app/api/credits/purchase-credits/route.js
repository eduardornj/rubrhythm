import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 }); // 10 per minute

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, amount } = await request.json();

  if (!userId || !amount) {
    return NextResponse.json({ error: "Missing userId or amount" }, { status: 400 });
  }

  // Authorization: only the user themselves or an admin can purchase credits
  if (session.user.id !== userId && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Busca ou cria o saldo do usuário
    let creditBalance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!creditBalance) {
      creditBalance = await prisma.creditBalance.create({
        data: { userId, balance: 0.0 },
      });
    }

    // Adiciona os créditos ao saldo (1 USD = 1 crédito)
    const parsedAmount = parseFloat(amount);
    const newBalance = creditBalance.balance + parsedAmount;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: parsedAmount } },
      }),
      prisma.creditBalance.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: parsedAmount,
          status: "completed",
        },
      }),
    ]);

    return NextResponse.json({ message: "Credits purchased successfully", newBalance });
  } catch (error) {
    console.error("Error purchasing credits:", error);
    return NextResponse.json({ error: "Failed to purchase credits" }, { status: 500 });
  }
}
