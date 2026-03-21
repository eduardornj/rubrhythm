import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendCreditsConfirmedEmail } from "@/lib/email";
import { alertPurchase } from "@/lib/telegram";

// NowPayments uses HMAC-SHA512 with IPN secret
// Uses timing-safe comparison to prevent timing attacks
function verifySignature(rawBody, signature) {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret || !signature) return false;
    const expected = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
        return false;
    }
}

export async function POST(request) {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig") || "";

    if (!verifySignature(rawBody, signature)) {
        console.warn("[NowPayments Webhook] Invalid signature — rejected");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { payment_status, order_id, payment_id } = event;

    // Only process fully confirmed payments
    if (payment_status !== "finished" && payment_status !== "confirmed") {
        return NextResponse.json({
            received: true,
            action: "ignored",
            status: payment_status,
        });
    }

    if (!order_id) {
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    try {
        // Find pending transaction by orderId to get userId + credits
        const pendingTx = await prisma.credittransaction.findFirst({
            where: { id: order_id },
        });

        if (!pendingTx) {
            console.error("[NowPayments Webhook] No pending tx found for order:", order_id);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Idempotency: already processed?
        if (pendingTx.type === "PURCHASE") {
            return NextResponse.json({ received: true, action: "duplicate_ignored" });
        }

        const { userId, amount: credits } = pendingTx;

        // Atomically add credits
        await prisma.$transaction(async (tx) => {
            // 1. Increment user credits
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { credits: { increment: credits } },
            });

            // 2. Sync creditbalance
            await tx.creditbalance.upsert({
                where: { userId },
                update: { balance: updatedUser.credits },
                create: { id: `cb_${userId}`, userId, balance: updatedUser.credits },
            });

            // 3. Mark as confirmed
            await tx.credittransaction.update({
                where: { id: order_id },
                data: {
                    type: "PURCHASE",
                    description: `NowPayments BTC confirmed — ${credits} créditos — paymentId:${payment_id}`,
                },
            });

            // 4. In-app notification
            await tx.notification.create({
                data: {
                    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    title: "⚡ Pagamento Bitcoin Confirmado!",
                    body: `Seu pagamento foi confirmado! ${credits} créditos foram adicionados à sua conta RubRhythm.`,
                    type: "success",
                    isRead: false,
                },
            }).catch(() => { });
        });

        console.log(`[NowPayments] ✅ ${credits} credits added for user ${userId} (order: ${order_id})`);

        // Send confirmation email + Telegram alert (non-blocking)
        const userData = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }).catch(() => null);
        if (userData?.email) {
            sendCreditsConfirmedEmail(userData.email, userData.name || "User", credits, credits).catch(() => {});
        }
        alertPurchase(userData?.name, userData?.email, credits, payment_id);

        return NextResponse.json({ received: true, action: "credits_added", credits });

    } catch (error) {
        console.error("[NowPayments Webhook] Error:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
}
