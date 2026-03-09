/**
 * GET /api/listings/featured-count
 * Returns the current featured slot usage per city.
 * Used by the boost page and admin panel.
 *
 * Query params:
 *   city  (required)
 *   state (required)
 */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MAX_FEATURED_SLOTS } from "@/lib/featured-rotation";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const state = searchParams.get('state');

        if (!city || !state) {
            return NextResponse.json({ error: "city and state are required" }, { status: 400 });
        }

        const formattedState = state.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        const formattedCity = city.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

        const now = new Date();

        // Count active featured listings by tier
        const [premiumCount, basicCount] = await Promise.all([
            prisma.listing.count({
                where: {
                    state: formattedState,
                    city: formattedCity,
                    isFeatured: true,
                    featureTier: 'PREMIUM',
                    isActive: true,
                    OR: [
                        { featuredEndDate: null },
                        { featuredEndDate: { gt: now } },
                    ],
                },
            }),
            prisma.listing.count({
                where: {
                    state: formattedState,
                    city: formattedCity,
                    isFeatured: true,
                    featureTier: 'BASIC',
                    isActive: true,
                    OR: [
                        { featuredEndDate: null },
                        { featuredEndDate: { gt: now } },
                    ],
                },
            }),
        ]);

        const total = premiumCount + basicCount;

        return NextResponse.json({
            city: formattedCity,
            state: formattedState,
            slots: {
                premium: premiumCount,
                basic: basicCount,
                total,
                max: MAX_FEATURED_SLOTS,
                available: Math.max(0, MAX_FEATURED_SLOTS - total),
                hasRotation: total > MAX_FEATURED_SLOTS,
            },
        });

    } catch (error) {
        console.error("Error fetching featured count:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
