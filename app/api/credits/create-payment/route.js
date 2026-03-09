import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const PACKAGES = {
  starter: { credits: 10, priceUSD: 10, label: "Starter" },
  basic: { credits: 27, priceUSD: 25, label: "Basic (+2 bônus)" },
  pro: { credits: 55, priceUSD: 50, label: "Pro (+5 bônus)" },
  premium: { credits: 120, priceUSD: 100, label: "Premium (+20 bônus)" },
  ultra: { credits: 260, priceUSD: 200, label: "Ultra (+60 bônus)" },
};

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packageId } = await request.json();
  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "NOWPAYMENTS_API_KEY não configurado." },
      { status: 500 }
    );
  }

  const orderId = `rubrhythm_${session.user.id}_${packageId}_${Date.now()}`;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:1001";

  try {
    // Create a payment (not invoice) — returns BTC address + amount directly
    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        price_amount: pkg.priceUSD,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: orderId,
        order_description: `RubRhythm — ${pkg.label} (${pkg.credits} créditos)`,
        ipn_callback_url: `${baseUrl}/api/credits/webhook-nowpayments`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.pay_address) {
      console.error("[NowPayments] Error creating payment:", data);
      return NextResponse.json(
        { error: "Falha ao criar pagamento. Verifique a API key e configurações do NowPayments." },
        { status: 500 }
      );
    }

    // Save pending transaction for webhook reconciliation
    await prisma.credittransaction.create({
      data: {
        id: orderId,
        userId: session.user.id,
        amount: pkg.credits,
        type: "PURCHASE_PENDING",
        description: `NowPayments pending — ${pkg.label} — $${pkg.priceUSD} — paymentId:${data.payment_id}`,
        paymentMethod: "BITCOIN_NOWPAYMENTS",
      },
    }).catch(() => { /* ignore duplicate */ });

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: data.payment_id,
      payAddress: data.pay_address,
      payAmount: data.pay_amount,
      payCurrency: data.pay_currency,
      priceUSD: pkg.priceUSD,
      credits: pkg.credits,
      label: pkg.label,
      expiresAt: data.expiration_estimate_date || null,
    });

  } catch (error) {
    console.error("[NowPayments] create-payment error:", error);
    return NextResponse.json({ error: "Erro ao processar pagamento." }, { status: 500 });
  }
}
