import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma.js";

export async function POST(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, amount, reason } = await request.json();

    if (!userId || !amount || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar registro da transação
      const transaction = await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: userId,
          amount: amount,
          type: "admin_add",
          description: reason,
        }
      });

      // Atualizar user.credits (fonte primária)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } }
      });

      // Manter creditbalance sincronizado
      await tx.creditbalance.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { id: `cb_${Date.now()}`, userId, balance: amount }
      });

      return { transaction, updatedUser };
    });

    return NextResponse.json({
      message: "Credits added successfully",
      transaction: result.transaction,
      newBalance: result.updatedUser.credits
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
  }
}