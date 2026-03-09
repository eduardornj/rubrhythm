import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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

        const { listingId, action, days } = await request.json();
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
            default:
                return NextResponse.json({
                    success: false,
                    error: { code: "BAD_REQUEST", message: "Ação de anúncio inválida." }
                }, { status: 400 });
        }

        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: updateData,
            select: { id: true, userId: true, title: true }
        });

        // Auto-notify the provider when their listing is approved or rejected
        if ((action === "approve" || action === "reject" || action === "reactivate" || action === "deactivate") && updatedListing.userId) {
            const notifMap = {
                approve: {
                    title: "✅ Seu anúncio foi aprovado!",
                    body: `Ótimas notícias! Seu anúncio "${updatedListing.title || "sem título"}" foi aprovado e já está visível no diretório RubRhythm.`,
                    type: "success",
                },
                reactivate: {
                    title: "✅ Seu anúncio foi reativado!",
                    body: `Seu anúncio "${updatedListing.title || "sem título"}" foi reativado e está visível novamente.`,
                    type: "success",
                },
                reject: {
                    title: "⚠️ Seu anúncio precisa de ajustes",
                    body: `Seu anúncio "${updatedListing.title || "sem título"}" foi rejeitado pela equipe de moderação. Revise as políticas da plataforma e reenvie.`,
                    type: "warning",
                },
                deactivate: {
                    title: "⏸️ Seu anúncio foi pausado",
                    body: `Seu anúncio "${updatedListing.title || "sem título"}" foi temporariamente desativado pelo administrador.`,
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

        await prisma.listing.delete({ where: { id } });

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
