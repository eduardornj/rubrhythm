import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const toNum = (val) => (val != null ? parseFloat(val) : 0);

function timeAgo(date) {
    if (!date) return "—";
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "agora";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return new Date(date).toLocaleDateString("pt-BR");
}

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Acesso negado." } },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "30d";

        const now = new Date();
        const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
        const startDate = new Date(now.getTime() - (daysMap[range] || 30) * 86400000);
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const safeAggregate = async (fn) => {
            try { return await fn(); } catch { return null; }
        };

        // ── Core KPIs (parallel) ──────────────────────────────────────
        const [
            totalUsers,
            activeProviders,
            totalClients,
            verifiedUsers,
            bannedUsers,
            pendingVerifications,
            totalListings,
            activeListings,
            pendingListings,
            pendingReviews,
            totalCreditsRow,
            // Weekly deltas
            newUsersWeek,
            newUsersToday,
            newListingsWeek,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "provider", isBanned: false } }),
            prisma.user.count({ where: { role: "user" } }),
            prisma.user.count({ where: { verified: true } }),
            prisma.user.count({ where: { isBanned: true } }),
            prisma.verificationrequest.count({ where: { status: "pending" } }),
            prisma.listing.count(),
            prisma.listing.count({ where: { isActive: true, isApproved: true } }),
            prisma.listing.count({ where: { isApproved: false } }),
            prisma.review.count({ where: { status: "pending" } }),
            prisma.user.aggregate({ _sum: { credits: true } }),
            prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
            prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
        ]);

        // ── Financial (parallel, isolated) ────────────────────────────
        const [escrowPending, escrowDisputed, escrowSum, creditInflow, tipSum, chatPaymentSum] = await Promise.all([
            safeAggregate(() => prisma.escrow.count({ where: { status: "pending" } })),
            safeAggregate(() => prisma.escrow.count({ where: { status: "disputed" } })),
            safeAggregate(() => prisma.escrow.aggregate({ _sum: { amount: true } })),
            safeAggregate(() => prisma.credittransaction.aggregate({ _sum: { amount: true }, where: { amount: { gt: 0 } } })),
            safeAggregate(() => prisma.tip.aggregate({ _sum: { amount: true }, where: { status: "completed" } })),
            safeAggregate(() => prisma.chatpayment?.aggregate({ _sum: { amount: true }, where: { status: "completed" } }).catch(() => null)),
        ]);

        const totalRevenue = toNum(creditInflow?._sum?.amount) + toNum(tipSum?._sum?.amount) + toNum(chatPaymentSum?._sum?.amount);

        // ── Recent Activity Feed ──────────────────────────────────────
        const [recentUsers, recentListings, urgentVerifications, urgentListings] = await Promise.all([
            prisma.user.findMany({
                take: 8,
                orderBy: { createdAt: "desc" },
                select: { id: true, name: true, email: true, role: true, verified: true, isBanned: true, credits: true, createdAt: true },
            }),
            prisma.listing.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, title: true, city: true, state: true, isApproved: true, isActive: true, createdAt: true,
                    user: { select: { name: true, email: true } },
                },
            }),
            prisma.verificationrequest.findMany({
                where: { status: "pending" },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, createdAt: true, user: { select: { name: true, email: true } } },
            }),
            prisma.listing.findMany({
                where: { isApproved: false },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, title: true, city: true, state: true, createdAt: true },
            }),
        ]);

        // ── Top Providers by credits ──────────────────────────────────
        const topProviders = await prisma.user.findMany({
            where: { role: "provider", credits: { gt: 0 } },
            take: 5,
            orderBy: { credits: "desc" },
            select: { id: true, name: true, email: true, credits: true, verified: true },
        });

        // Add timeAgo to recent items
        const recentUsersWithTime = recentUsers.map((u) => ({ ...u, ago: timeAgo(u.createdAt) }));
        const recentListingsWithTime = recentListings.map((l) => ({ ...l, ago: timeAgo(l.createdAt) }));

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    users: { total: totalUsers, providers: activeProviders, clients: totalClients, verified: verifiedUsers, banned: bannedUsers },
                    listings: { total: totalListings, active: activeListings, pending: pendingListings },
                    financial: {
                        totalCreditsInSystem: toNum(totalCreditsRow?._sum?.credits),
                        totalRevenue,
                        pendingEscrows: escrowPending ?? 0,
                        disputedEscrows: escrowDisputed ?? 0,
                        totalEscrowAmount: toNum(escrowSum?._sum?.amount),
                    },
                },
                deltas: {
                    newUsersWeek,
                    newUsersToday,
                    newListingsWeek,
                },
                actionQueue: {
                    pendingVerificationsCount: pendingVerifications,
                    pendingReviewsCount: pendingReviews,
                    urgentTasks: { verifications: urgentVerifications, listings: urgentListings },
                },
                activity: {
                    recentUsers: recentUsersWithTime,
                    recentListings: recentListingsWithTime,
                    topProviders,
                },
            },
            metadata: { timestamp: new Date().toISOString(), rangeFiltered: range },
        });
    } catch (error) {
        console.error("[API] Admin System Route Error:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao buscar dados do sistema." } },
            { status: 500 }
        );
    }
}
