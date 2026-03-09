import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import AdminStatCard from "./components/AdminStatCard";
import {
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineCheckBadge,
    HiOutlineBanknotes,
    HiOutlineSparkles,
    HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";

async function getDashboardData() {
    try {
        const reqHeaders = await headers();
        const host = reqHeaders.get("host") || "localhost:3000";
        let protocol = reqHeaders.get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production" ? "https" : "http";
        // Force HTTP for local dev to avoid SSL crash
        if (host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1")) {
            protocol = "http";
        }
        const baseUrl = `${protocol}://${host}`;

        const cookie = reqHeaders.get("cookie") || "";
        const res = await fetch(`${baseUrl}/api/admin/system`, {
            method: "GET",
            headers: { cookie },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || "Erro desconhecido");

        return json.data;
    } catch (err) {
        console.error("[Dashboard] Fetch error:", err);
        return null;
    }
}

export default async function AdminPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") redirect("/login");

    const data = await getDashboardData();

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] glass-card p-12 text-center border-red-500/30">
                <span className="text-4xl mb-4">⚠️</span>
                <h2 className="text-xl font-bold text-white">Falha ao carregar métricas</h2>
                <p className="text-text-muted mt-2">Verifique se as APIs do sistema estão online e se você tem permissão.</p>
            </div>
        );
    }

    const { overview, actionQueue } = data;
    const { users, listings, financial } = overview;

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        Painel Executivo
                    </h1>
                    <p className="text-text-muted text-sm mt-1">Visão geral do ecossistema RubRhythm em tempo real</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/verificacao" className="btn-primary py-2 px-5 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        Ações Pendentes {actionQueue.pendingVerificationsCount > 0 && `(${actionQueue.pendingVerificationsCount})`}
                    </Link>
                </div>
            </div>

            {/* Primary KPI Grid */}
            <div>
                <h2 className="text-white/40 font-bold mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                    Kpis de Crescimento
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AdminStatCard
                        icon={<HiOutlineUsers />}
                        label="Total de Usuários"
                        value={users.total.toLocaleString("pt-BR")}
                        href="/admin/users"
                        trend={Math.round((users.providers / (users.total || 1)) * 100)}
                        trendLabel="% são providers"
                    />
                    <AdminStatCard
                        icon={<HiOutlineSparkles />}
                        label="Massagistas Ativas"
                        value={users.providers.toLocaleString("pt-BR")}
                        href="/admin/users?role=provider"
                    />
                    <AdminStatCard
                        icon={<HiOutlineDocumentText />}
                        label="Anúncios Aprovados"
                        value={listings.active.toLocaleString("pt-BR")}
                        href="/admin/listings"
                    />
                    <AdminStatCard
                        icon={<HiOutlineBanknotes />}
                        label="Créditos no Sistema"
                        value={`${(financial.totalCreditsInSystem || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })} créditos`}
                        href="/admin/financeiro"
                        trend={financial.totalRevenue > 0 ? Math.round(financial.totalRevenue) : 0}
                        trendLabel="Em circulação"
                    />
                </div>
            </div>

            {/* Moderation & Actions Grid */}
            <div>
                <h2 className="text-white/40 font-bold mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400/50"></span>
                    Filtro de Moderação (Ação Necessária)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AdminStatCard
                        icon={<HiOutlineCheckBadge />}
                        label="Verificações na Fila"
                        value={actionQueue.pendingVerificationsCount}
                        href="/admin/verificacao"
                        alert={actionQueue.pendingVerificationsCount > 0}
                    />
                    <AdminStatCard
                        icon={<HiOutlineChatBubbleLeftRight />}
                        label="Reviews Pendentes"
                        value={actionQueue.pendingReviewsCount}
                        href="/admin/reviews"
                        alert={actionQueue.pendingReviewsCount > 0}
                    />
                    <AdminStatCard
                        icon={<HiOutlineDocumentText />}
                        label="Anúncios em Moderação"
                        value={listings.pending}
                        href="/admin/listings?status=pending"
                        alert={listings.pending > 0}
                    />
                </div>
            </div>

        </div>
    );
}
