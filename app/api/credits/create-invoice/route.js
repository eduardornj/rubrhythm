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
      { error: "NowPayments não configurado. Adicione NOWPAYMENTS_API_KEY no .env" },
      { status: 500 }
    );
  }

  const orderId = `rubrhythm_${session.user.id}_${packageId}_${Date.now()}`;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:1001";

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
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
        success_url: `${baseUrl}/myaccount/credits/success?orderId=${orderId}`,
        cancel_url: `${baseUrl}/myaccount/credits/buy`,
        ipn_callback_url: `${baseUrl}/api/credits/webhook-nowpayments`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.invoice_url) {
      console.error("[NowPayments] Error creating invoice:", data);
      return NextResponse.json({ error: "Falha ao criar invoice. Verifique se a API key e a wallet estão configuradas no NowPayments." }, { status: 500 });
    }

    // Save pending transaction for webhook reconciliation
    await prisma.credittransaction.create({
      data: {
        id: orderId,
        userId: session.user.id,
        amount: pkg.credits,
        type: "PURCHASE_PENDING",
        description: `NowPayments pending — ${pkg.label} — $${pkg.priceUSD} — invoiceId:${data.id}`,
        paymentMethod: "BITCOIN_NOWPAYMENTS",
      },
    }).catch(() => {/* ignore duplicate */ });

    return NextResponse.json({
      success: true,
      paymentUrl: data.invoice_url,
      invoiceId: data.id,
      orderId,
    });

  } catch (error) {
    console.error("[NowPayments] create-invoice error:", error);
    return NextResponse.json({ error: "Erro ao processar pagamento." }, { status: 500 });
  }
}

// GET → list available packages
export async function GET() {
  return NextResponse.json({
    packages: Object.entries(PACKAGES).map(([id, p]) => ({ id, ...p })),
  });
}
