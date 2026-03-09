import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { action, listingId, userId, cost, durationDays } = await request.json();

  if (!action || !userId || !cost) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Verifica se o anúncio existe e pertence ao usuário (se for uma ação que precisa de listingId)
    let listing = null;
    if (action !== "listing-fee") {
      listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing || listing.userId !== userId) {
        return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
      }
    }

    // Busca o saldo do usuário
    const creditBalance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!creditBalance || creditBalance.balance < cost) {
      return NextResponse.json({ error: "Insufficient credits. Please add more credits to your account." }, { status: 400 });
    }

    // Deduz os créditos
    const newBalance = creditBalance.balance - cost;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: cost } },
      }),
      prisma.creditBalance.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: -cost,
          status: "completed",
        },
      }),
    ]);

    // Aplica a funcionalidade
    if (action === "listing-fee") {
      // Apenas deduziu a taxa, não precisa fazer mais nada
      return NextResponse.json({ message: "Listing fee deducted successfully", newBalance });
    } else if (action === "bump-up") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { added: new Date() },
      });
    } else if (action === "highlight") {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      await prisma.listing.update({
        where: { id: listingId },
        data: { isHighlighted: true, highlightEndDate: endDate },
      });
    } else if (action === "feature") {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      await prisma.listing.update({
        where: { id: listingId },
        data: { isFeatured: true, featuredEndDate: endDate },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Action completed successfully", newBalance });
  } catch (error) {
    console.error("Error processing action:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}