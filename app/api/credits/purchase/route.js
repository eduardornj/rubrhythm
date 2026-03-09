import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const CREDIT_PACKAGES = {
  1: { amount: 10, price: 10, bonus: 0 },
  2: { amount: 25, price: 20, bonus: 5 },
  3: { amount: 50, price: 35, bonus: 15 },
  4: { amount: 100, price: 60, bonus: 40 }
};

export async function POST(request) {
  const session = await auth();

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packageId, amount, price, returnUrl } = await request.json();

  if (!packageId || !CREDIT_PACKAGES[packageId]) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const packageData = CREDIT_PACKAGES[packageId];
  const totalCredits = packageData.amount + packageData.bonus;

  // Validar dados do pacote
  if (amount !== totalCredits || price !== packageData.price) {
    return NextResponse.json({ error: "Package data mismatch" }, { status: 400 });
  }

  try {
    // Aqui você integraria com Stripe, PayPal ou outro gateway
    // Por enquanto, vamos simular um pagamento bem-sucedido para desenvolvimento

    // Em produção, você criaria uma sessão de pagamento e retornaria a URL
    // Exemplo com Stripe:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: `${totalCredits} Credits Package`,
    //       },
    //       unit_amount: price * 100, // Stripe usa centavos
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/buy-credits`,
    //   metadata: {
    //     userId: session.user.id,
    //     packageId: packageId.toString(),
    //     credits: totalCredits.toString()
    //   }
    // });
    // return NextResponse.json({ paymentUrl: session.url });

    // SIMULAÇÃO PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
    const result = await prisma.$transaction(async (tx) => {
      // Update single source of truth (user.credits)
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: totalCredits } }
      });

      // Keep creditbalance in sync, create if missing
      const newBalance = await tx.creditbalance.upsert({
        where: { userId: session.user.id },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${Date.now()}`, userId: session.user.id, balance: updatedUser.credits }
      });

      // Registrar transação
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          amount: totalCredits,
          type: "PURCHASE",
          description: `Credit purchase - Package ${packageId} ($${price})`,
          paymentMethod: "SIMULATION" // Em produção seria "STRIPE", "PAYPAL", etc.
        }
      });

      return newBalance;
    });

    return NextResponse.json({
      success: true,
      message: "Credits purchased successfully",
      newBalance: result.balance,
      creditsAdded: totalCredits,
      // Em desenvolvimento, não retornamos paymentUrl para simular pagamento instantâneo
    });

  } catch (error) {
    console.error("Error processing credit purchase:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}

// GET para verificar status de pagamento (webhook do Stripe)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    // Aqui você verificaria o status do pagamento no Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.retrieve(sessionId);

    // if (session.payment_status === 'paid') {
    //   // Processar créditos se ainda não foram processados
    //   const { userId, credits } = session.metadata;
    //   // Adicionar créditos ao usuário...
    // }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}