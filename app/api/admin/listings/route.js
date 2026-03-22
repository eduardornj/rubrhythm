import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";

// Audit log helper — logs admin actions to securitylog table
async function logAdminAction(adminId, action, details, request) {
    try {
        const ip = request?.headers?.get("x-forwarded-for") || request?.headers?.get("x-real-ip") || "unknown";
        await prisma.securitylog.create({
            data: {
                id: `sl_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
                type: "ADMIN_ACTION",
                severity: ["approve", "reactivate", "bump-up"].includes(action) ? "info" : ["reject", "deactivate", "delete"].includes(action) ? "warning" : "info",
                message: `Admin ${action} on listing`,
                details: details,
                userId: adminId,
                ipAddress: ip,
            }
        });
    } catch (e) {
        console.error("[AuditLog] Failed to log admin action:", e);
    }
}

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Acesso negado." }
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const status = searchParams.get("status"); // approved, pending, featured
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        const where = {};
        if (userId) where.userId = userId;
        if (status === "pending") where.isApproved = false;
        if (status === "approved") where.isApproved = true;
        if (status === "featured") where.isFeatured = true;
        if (search) where.OR = [
            { title: { contains: search } },
            { city: { contains: search } },
            { user: { name: { contains: search } } },
        ];

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, verified: true, role: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.listing.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: { listings, total },
            metadata: {
                pagination: { total, page, limit, pages: Math.ceil(total / limit) },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("[API] Admin Listings GET Error:", error);
        return NextResponse.json({
            success: false,
            error: { code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar anúncios." }
        }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Acesso negado." }
            }, { status: 401 });
        }

        const { listingId, action, days, hours } = await request.json();
        if (!listingId || !action) {
            return NextResponse.json({
                success: false,
                error: { code: "BAD_REQUEST", message: "listingId e action são obrigatórios." }
            }, { status: 400 });
        }

        let updateData = {};
        let message = "";

        switch (action) {
            case "approve":
                updateData = { isApproved: true, isActive: true };
                message = "Anúncio aprovado e ativado com sucesso.";
                break;
            case "reject":
                updateData = { isApproved: false, isActive: false };
                message = "Anúncio rejeitado/pausado.";
                break;
            case "reactivate":
                updateData = { isApproved: true, isActive: true };
                message = "Anúncio reativado.";
                break;
            case "deactivate":
                updateData = { isApproved: false, isActive: false };
                message = "Anúncio desativado.";
                break;
            case "bump-up":
                updateData = { lastBumpUp: new Date() };
                message = "Anúncio subido para o topo da lista (Bump Up).";
                break;
            case "highlight": {
                const highlightEndDate = new Date();
                highlightEndDate.setDate(highlightEndDate.getDate() + (days || 7));
                updateData = { isHighlighted: true, highlightEndDate };
                message = `Anúncio destacado (Highlight) por ${days || 7} dias.`;
                break;
            }
            case "unhighlight":
                updateData = { isHighlighted: false, highlightEndDate: null };
                message = "Destaque (Highlight) removido do anúncio.";
                break;
            case "feature": {
                const featuredEndDate = new Date();
                featuredEndDate.setDate(featuredEndDate.getDate() + (days || 30));
                updateData = { isFeatured: true, featuredEndDate, featureTier: "BASIC" };
                message = `Destaque Básico (⭐) aplicado por ${days || 30} dias.`;
                break;
            }
            case "feature-premium": {
                const premiumEndDate = new Date();
                premiumEndDate.setDate(premiumEndDate.getDate() + (days || 30));
                updateData = { isFeatured: true, featuredEndDate: premiumEndDate, featureTier: "PREMIUM" };
                message = `Destaque Premium (💎) aplicado por ${days || 30} dias.`;
                break;
            }
            case "unfeature":
                updateData = { isFeatured: false, featuredEndDate: null, featureTier: null };
                message = "Destaque (Feature) removido do anúncio.";
                break;
            case "available-now": {
                const availableUntil = new Date();
                availableUntil.setHours(availableUntil.getHours() + (hours || 1));
                updateData = { availableNow: true, availableUntil };
                message = `Available Now ativado por ${hours || 1} hora(s).`;
                break;
            }
            case "unavailable":
                updateData = { availableNow: false, availableUntil: null };
                message = "Available Now desativado.";
                break;
            default:
                return NextResponse.json({
                    success: false,
                    error: { code: "BAD_REQUEST", message: "Ação de anúncio inválida." }
                }, { status: 400 });
        }

        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: updateData,
            select: { id: true, userId: true, title: true, state: true, city: true }
        });

        // Auto-mark as Founding Provider based on city tier limits
        if (action === "approve" || action === "reactivate") {
            const TIER1_CITIES = ["New York", "Los Angeles", "Las Vegas", "Miami"];
            const TIER2_CITIES = ["Chicago", "Houston", "Atlanta", "Phoenix", "Dallas", "San Francisco", "Orlando", "Denver", "San Diego", "Seattle", "Philadelphia", "Tampa"];
            const cityName = updatedListing.city;
            const foundingLimit = TIER1_CITIES.includes(cityName) ? 50 : TIER2_CITIES.includes(cityName) ? 25 : 10;
            const approvedCountInCity = await prisma.listing.count({
                where: {
                    state: updatedListing.state,
                    city: updatedListing.city,
                    isApproved: true,
                    isActive: true,
                },
            });
            if (approvedCountInCity <= foundingLimit) {
                await prisma.listing.update({
                    where: { id: listingId },
                    data: { isFoundingProvider: true },
                });
            }
        }

        // Auto-notify the provider when their listing is approved or rejected
        if ((action === "approve" || action === "reject" || action === "reactivate" || action === "deactivate") && updatedListing.userId) {
            const notifMap = {
                approve: {
                    title: "Your listing has been approved!",
                    body: `Great news! Your listing "${updatedListing.title || "Untitled"}" has been approved and is now visible on RubRhythm.`,
                    type: "success",
                },
                reactivate: {
                    title: "Your listing has been reactivated!",
                    body: `Your listing "${updatedListing.title || "Untitled"}" has been reactivated and is visible again.`,
                    type: "success",
                },
                reject: {
                    title: "Your listing needs adjustments",
                    body: `Your listing "${updatedListing.title || "Untitled"}" was not approved. Please review the platform policies and resubmit.`,
                    type: "warning",
                },
                deactivate: {
                    title: "Your listing has been paused",
                    body: `Your listing "${updatedListing.title || "Untitled"}" has been temporarily deactivated by the administrator.`,
                    type: "warning",
                },
            };

            const notif = notifMap[action];
            if (notif) {
                await prisma.notification.create({
                    data: {
                        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: updatedListing.userId,
                        title: notif.title,
                        body: notif.body,
                        type: notif.type,
                        isRead: false,
                    }
                }).catch(e => console.error("[Auto-notif] Failed to create notification:", e));
            }
        }

        // Audit log — record every admin action on listings
        await logAdminAction(session.user.id, action, {
            listingId: updatedListing.id,
            listingTitle: updatedListing.title,
            city: updatedListing.city,
            state: updatedListing.state,
            action,
            days: days || null,
            hours: hours || null,
            message,
        }, request);

        return NextResponse.json({
            success: true,
            data: { listingId: updatedListing.id, action, message },
            metadata: { timestamp: new Date().toISOString() }
        });

    } catch (error) {
        console.error("[API] Admin Listings PATCH Error:", error);
        return NextResponse.json({
            success: false,
            error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao executar ação no anúncio." }
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Acesso negado." }
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                success: false,
                error: { code: "BAD_REQUEST", message: "ID do anúncio é obrigatório." }
            }, { status: 400 });
        }

        // Fetch listing info before deleting for audit log
        const listingToDelete = await prisma.listing.findUnique({
            where: { id },
            select: { title: true, city: true, state: true, userId: true },
        });

        await prisma.listing.delete({ where: { id } });

        // Audit log
        await logAdminAction(session.user.id, "delete", {
            listingId: id,
            listingTitle: listingToDelete?.title || "unknown",
            city: listingToDelete?.city,
            state: listingToDelete?.state,
            providerId: listingToDelete?.userId,
        }, request);

        return NextResponse.json({
            success: true,
            data: { deletedId: id, message: "Anúncio deletado permanentemente." },
            metadata: { timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error("[API] Admin Listings DELETE Error:", error);
        return NextResponse.json({
            success: false,
            error: { code: "INTERNAL_SERVER_ERROR", message: "Falha ao deletar anúncio." }
        }, { status: 500 });
    }
}
