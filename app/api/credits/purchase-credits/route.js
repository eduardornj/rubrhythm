import { NextResponse } from "next/server";

// DISABLED — This route allowed adding credits without payment verification.
// Credits should only be added via the NowPayments webhook after confirmed payment.
// See: /api/credits/create-payment (creates BTC payment)
// See: /api/credits/webhook-nowpayments (confirms and adds credits)

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been disabled. Please use the Bitcoin payment flow at /myaccount/credits/buy" },
    { status: 410 }
  );
}
