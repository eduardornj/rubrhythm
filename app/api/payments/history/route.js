import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch credit transactions (payments)
    const creditTransactions = await prisma.credittransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 transactions
    });

    // Fetch escrow transactions
    const escrowTransactions = await prisma.escrow.findMany({
      where: {
        OR: [
          { clientId: session.user.id },
          { providerId: session.user.id }
        ]
      },
      include: {
        user_escrow_clientIdTouser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user_escrow_providerIdTouser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Format transactions for display
    const formattedPayments = [
      ...creditTransactions.map(transaction => ({
        id: transaction.id,
        type: 'credit',
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.amount > 0 ? 'completed' : 'completed',
        date: transaction.createdAt,
        transactionId: `CT-${transaction.id}`,
        gateway: transaction.type === 'purchase' ? 'Credit Purchase' : transaction.type
      })),
      ...escrowTransactions.map(escrow => ({
        id: escrow.id,
        type: 'escrow',
        amount: escrow.clientId === session.user.id ? -escrow.amount : escrow.amount,
        description: escrow.description,
        status: escrow.status,
        date: escrow.createdAt,
        transactionId: `ES-${escrow.id}`,
        gateway: 'Escrow Service',
        otherParty: escrow.clientId === session.user.id ? escrow.user_escrow_providerIdTouser : escrow.user_escrow_clientIdTouser
      }))
    ];

    // Sort by date (newest first)
    formattedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({ payments: formattedPayments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json({ error: "Failed to fetch payment history." }, { status: 500 });
  }
}