import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const typeFilter = searchParams.get('type');
    const skip = (page - 1) * limit;

    // Verify user can access this data (only their own or admin)
    if (userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build Prisma query condition
    let whereClause = { userId };

    // Convert frontend type filter to database types
    if (typeFilter === 'purchase') {
      whereClause.amount = { gt: 0 };
    } else if (typeFilter === 'spent') {
      whereClause.amount = { lt: 0 };
    }

    // Get transactions and total count
    const [transactions, total, userBalance] = await Promise.all([
      prisma.credittransaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.credittransaction.count({
        where: whereClause
      }),
      prisma.creditbalance.findUnique({
        where: { userId }
      })
    ]);

    // Normalize type and compute running balance for display
    const currentBalance = Number(userBalance?.balance || 0);
    let runningBalance = currentBalance;

    // Transactions are desc, so we compute backwards
    const txWithBalance = transactions.map(t => {
      const amt = Number(t.amount);
      const entry = {
        id: t.id,
        amount: amt,
        // Normalize admin_add and any positive-amount type to 'purchase' for UI
        type: amt > 0 ? 'purchase' : 'spent',
        description: t.description,
        createdAt: t.createdAt,
        relatedId: t.relatedId,
        balanceAfter: runningBalance
      };
      runningBalance -= amt; // walk backwards
      return entry;
    });

    return NextResponse.json({
      transactions: txWithBalance,
      total,
      currentBalance
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}