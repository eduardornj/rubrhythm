import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Simple endpoint to check if a pending order has been confirmed by webhook
export async function GET(request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const tx = await prisma.credittransaction.findFirst({
        where: {
            id: orderId,
            userId: session.user.id,
            type: "PURCHASE", // confirmed by webhook (not PURCHASE_PENDING)
        },
    });

    return NextResponse.json({ confirmed: !!tx });
}
