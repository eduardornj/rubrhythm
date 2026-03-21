import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../../auth";

const toNum = (v) => (v != null ? parseFloat(v) : 0);
const ago = (d) => {
    if (!d) return null;
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return "agora";
    if (s < 3600) return `${Math.floor(s / 60)}min`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d`;
    return new Date(d).toLocaleDateString("pt-BR");
};

export async function GET(request, { params }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    try {
        // ALL data in parallel
        const [
            user,
            listings,
            allTransactions,
            verifications,
            favoritesCount,
            reviewsGiven,
            reportsReceived,
            reportsSubmitted,
            chatsAsProvider,
            chatsAsClient,
            messagesSent,
            creditBalance,
            spentAgg,
            earnedAgg,
            tipsReceived,
            tipsSent,
            conversationsAsClient,
            conversationsAsProvider,
        ] = await Promise.all([
            // Full user record
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, name: true, email: true, role: true, verified: true,
                    isBanned: true, credits: true, createdAt: true, updatedAt: true,
                    lastSeen: true, image: true, referralCode: true, referredBy: true,
                    isFeatured: true, featuredEndDate: true, settings: true,
                    emailVerified: true,
                },
            }),
            // ALL listings with EVERYTHING
            prisma.listing.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, title: true, description: true, bodyType: true,
                    ethnicity: true, serviceLocation: true, phoneArea: true,
                    phoneNumber: true, country: true, state: true, city: true,
                    neighborhood: true, websiteUrl: true, status: true, type: true,
                    telegram: true, whatsapp: true, isWhatsAppAvailable: true,
                    images: true, services: true, priceRange: true, hourlyRate: true,
                    availability: true, age: true, isApproved: true, isActive: true,
                    isFeatured: true, featureTier: true, isHighlighted: true,
                    highlightEndDate: true, featuredEndDate: true, lastBumpUp: true,
                    availableNow: true, availableUntil: true, viewCount: true,
                    averageRating: true, totalReviews: true, rates: true,
                    socialLinks: true, autoBumpEnabled: true, autoBumpHour: true,
                    autoRenewFeatured: true, autoRenewHighlight: true,
                    autoRenewAvailable: true, isFoundingProvider: true,
                    createdAt: true, updatedAt: true,
                },
            }),
            // ALL credit transactions (not just 15)
            prisma.credittransaction.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 50,
                select: { id: true, amount: true, type: true, description: true, relatedId: true, createdAt: true },
            }),
            // ALL verification requests (not just latest)
            prisma.verificationrequest.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: { id: true, status: true, documentPath: true, selfiePath: true, rejectionReason: true, createdAt: true },
            }),
            prisma.favorite.count({ where: { userId } }),
            // Reviews this user GAVE
            prisma.review.findMany({
                where: { reviewerId: userId },
                orderBy: { createdAt: "desc" },
                take: 20,
                select: {
                    id: true, rating: true, comment: true, status: true, isAnonymous: true,
                    isVerified: true, createdAt: true,
                    listing: { select: { id: true, title: true, city: true, state: true } },
                },
            }),
            // Reports AGAINST this user
            prisma.fraudreport.findMany({
                where: { reportedUserId: userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, type: true, severity: true, description: true, status: true,
                    adminNotes: true, resolution: true, evidence: true, resolvedAt: true,
                    createdAt: true,
                    user_fraudreport_reporterIdTouser: { select: { name: true, email: true } },
                },
            }),
            // Reports this user SUBMITTED
            prisma.fraudreport.count({ where: { reporterId: userId } }),
            prisma.chat.count({ where: { providerId: userId } }),
            prisma.chat.count({ where: { clientId: userId } }),
            prisma.message.count({ where: { senderId: userId } }),
            prisma.creditbalance.findUnique({ where: { userId }, select: { balance: true } }).catch(() => null),
            // Total spent
            prisma.credittransaction.aggregate({ where: { userId, amount: { lt: 0 } }, _sum: { amount: true } }).catch(() => null),
            // Total earned/received
            prisma.credittransaction.aggregate({ where: { userId, amount: { gt: 0 } }, _sum: { amount: true } }).catch(() => null),
            // Tips received
            prisma.tip.findMany({
                where: { receiverId: userId },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: { id: true, amount: true, message: true, status: true, createdAt: true, user_tip_senderIdTouser: { select: { name: true } } },
            }).catch(() => []),
            // Tips sent
            prisma.tip.count({ where: { senderId: userId } }).catch(() => 0),
            prisma.conversation.count({ where: { clientId: userId } }).catch(() => 0),
            prisma.conversation.count({ where: { providerId: userId } }).catch(() => 0),
        ]);

        if (!user) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });

        // Reviews received ON this user's listings
        const listingIds = listings.map((l) => l.id);
        const reviewsOnListings = listingIds.length > 0
            ? await prisma.review.findMany({
                where: { listingId: { in: listingIds } },
                orderBy: { createdAt: "desc" },
                take: 20,
                select: {
                    id: true, rating: true, comment: true, status: true, isAnonymous: true,
                    isVerified: true, providerResponse: true, providerRespondedAt: true,
                    createdAt: true,
                    listing: { select: { id: true, title: true } },
                    user_review_reviewerIdTouser: { select: { name: true, email: true } },
                },
            })
            : [];

        // Blocked contacts
        const blockedContacts = await prisma.blockedcontact.findMany({
            where: { userId },
            select: { id: true, phone: true, email: true, createdAt: true },
        }).catch(() => []);

        // Escrows involving this user
        const escrows = await prisma.escrow.findMany({
            where: { OR: [{ clientId: userId }, { providerId: userId }] },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
                id: true, amount: true, status: true, description: true, disputeReason: true,
                createdAt: true, fundedAt: true, completedAt: true, disputedAt: true,
            },
        }).catch(() => []);

        // Security logs for this user
        const securityLogs = await prisma.securitylog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 15,
            select: { id: true, type: true, severity: true, message: true, ipAddress: true, createdAt: true },
        }).catch(() => []);

        // Process listings to extract all data
        const processedListings = listings.map((l) => {
            const images = Array.isArray(l.images) ? l.images : [];
            const services = Array.isArray(l.services) ? l.services : typeof l.services === "object" && l.services ? Object.values(l.services) : [];
            const rates = Array.isArray(l.rates) ? l.rates : [];
            const socialLinks = typeof l.socialLinks === "object" && l.socialLinks ? l.socialLinks : {};
            const availability = typeof l.availability === "object" && l.availability ? l.availability : {};

            return {
                ...l,
                images,
                services,
                rates,
                socialLinks,
                availability,
                phone: l.phoneArea && l.phoneNumber ? `(${l.phoneArea}) ${l.phoneNumber}` : null,
                imageCount: images.length,
                firstImage: images[0] || null,
                createdAgo: ago(l.createdAt),
                lastBumpAgo: ago(l.lastBumpUp),
                hourlyRate: l.hourlyRate,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    ...user,
                    credits: toNum(user.credits),
                    lastSeenAgo: ago(user.lastSeen),
                    createdAgo: ago(user.createdAt),
                    lastSeen: user.lastSeen,
                    createdAt: user.createdAt,
                },
                listings: processedListings,
                transactions: allTransactions.map((t) => ({ ...t, amount: toNum(t.amount) })),
                verifications,
                reviewsGiven,
                reviewsReceived: reviewsOnListings,
                reportsReceived,
                tipsReceived: tipsReceived.map((t) => ({ ...t, amount: toNum(t.amount) })),
                escrows: escrows.map((e) => ({ ...e, amount: toNum(e.amount) })),
                securityLogs,
                blockedContacts,
                stats: {
                    totalListings: listings.length,
                    activeListings: listings.filter((l) => l.isActive && l.isApproved).length,
                    pendingListings: listings.filter((l) => !l.isApproved).length,
                    totalViews: listings.reduce((sum, l) => sum + (l.viewCount || 0), 0),
                    avgRating: listings.length > 0 ? (listings.reduce((sum, l) => sum + (l.averageRating || 0), 0) / listings.length).toFixed(1) : "0",
                    totalReviewsOnListings: listings.reduce((sum, l) => sum + (l.totalReviews || 0), 0),
                    favorites: favoritesCount,
                    reviewsGivenCount: reviewsGiven.length,
                    reviewsReceivedCount: reviewsOnListings.length,
                    reportsReceivedCount: reportsReceived.length,
                    reportsSubmittedCount: reportsSubmitted,
                    chatsAsProvider,
                    chatsAsClient,
                    totalChats: chatsAsProvider + chatsAsClient,
                    messagesSent,
                    conversations: conversationsAsClient + conversationsAsProvider,
                    creditBalance: toNum(creditBalance?.balance),
                    totalSpent: Math.abs(toNum(spentAgg?._sum?.amount)),
                    totalEarned: toNum(earnedAgg?._sum?.amount),
                    tipsReceivedCount: tipsReceived.length,
                    tipsSentCount: tipsSent,
                    escrowCount: escrows.length,
                    blockedCount: blockedContacts.length,
                    securityEvents: securityLogs.length,
                },
            },
        });
    } catch (error) {
        console.error("[API] Admin user detail error:", error);
        return NextResponse.json({ error: "Falha ao buscar usuario" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const { name, email, role } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!name || !email) return NextResponse.json({ error: "Nome e email obrigatorios" }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
        if (email !== user.email) {
            const dup = await prisma.user.findUnique({ where: { email } });
            if (dup) return NextResponse.json({ error: "Email em uso" }, { status: 400 });
        }
        const updated = await prisma.user.update({ where: { id: userId }, data: { name, email, role: role || user.role } });
        return NextResponse.json({ message: "Atualizado", user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Falha" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
        if (user.role === "admin" && user.id !== session.user.id) {
            return NextResponse.json({ error: "Nao pode deletar outro admin" }, { status: 403 });
        }
        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ message: "Deletado" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Falha" }, { status: 500 });
    }
}
