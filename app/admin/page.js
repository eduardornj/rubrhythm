import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";

async function getDashboardData() {
    try {
        const reqHeaders = await headers();
        const host = reqHeaders.get("host") || "localhost:3000";
        let protocol = reqHeaders.get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production" ? "https" : "http";
        if (host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1")) protocol = "http";
        const cookie = reqHeaders.get("cookie") || "";
        const res = await fetch(`${protocol}://${host}/api/admin/system`, { method: "GET", headers: { cookie }, cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        return json.success ? json.data : null;
    } catch (err) {
        console.error("[Dashboard]", err);
        return null;
    }
}

function formatNumber(num) {
    if (num == null) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString("pt-BR");
}

function formatCurrency(num) {
    if (num == null) return "$0";
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session || session.user.role !== "admin") redirect("/login");

    const data = await getDashboardData();

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-2xl font-black mb-2 text-primary">Erro ao carregar dashboard</p>
                    <p className="text-text-muted">Nao foi possivel conectar ao servidor.</p>
                </div>
            </div>
        );
    }

    const { overview, deltas, actionQueue, activity } = data;

    const totalPending = (actionQueue.pendingVerificationsCount || 0) + (actionQueue.pendingReviewsCount || 0) + (overview.listings.pending || 0) + (overview.financial.disputedEscrows || 0);

    const alerts = [
        actionQueue.pendingVerificationsCount > 0 && { count: actionQueue.pendingVerificationsCount, label: "Verificacoes pendentes", emoji: "🪪", href: "/admin/verificacao", color: "yellow" },
        actionQueue.pendingReviewsCount > 0 && { count: actionQueue.pendingReviewsCount, label: "Reviews pendentes", emoji: "💬", href: "/admin/reviews", color: "yellow" },
        overview.listings.pending > 0 && { count: overview.listings.pending, label: "Anuncios pendentes", emoji: "📋", href: "/admin/listings", color: "yellow" },
        overview.financial.disputedEscrows > 0 && { count: overview.financial.disputedEscrows, label: "Escrows disputados", emoji: "🚨", href: "/admin/financeiro", color: "red" },
    ].filter(Boolean);

    const kpis = [
        { emoji: "👥", label: "Total usuarios", value: formatNumber(overview.users.total), sub: deltas.newUsersWeek > 0 ? `+${deltas.newUsersWeek} esta semana` : null, color: "primary" },
        { emoji: "💆", label: "Massagistas", value: formatNumber(overview.users.providers), sub: null, color: "accent" },
        { emoji: "🙋", label: "Clientes", value: formatNumber(overview.users.clients), sub: null, color: "primary" },
        { emoji: "📌", label: "Anuncios ativos", value: formatNumber(overview.listings.active), sub: deltas.newListingsWeek > 0 ? `+${deltas.newListingsWeek} esta semana` : null, color: "green" },
        { emoji: "💰", label: "Creditos sistema", value: formatCurrency(overview.financial.totalCreditsInSystem), sub: null, color: "yellow" },
        { emoji: "📈", label: "Revenue total", value: formatCurrency(overview.financial.totalRevenue), sub: null, color: "green" },
    ];

    const colorMap = {
        primary: "from-primary/15 to-primary/5 border-primary/20",
        accent: "from-accent/15 to-accent/5 border-accent/20",
        green: "from-green-500/15 to-green-500/5 border-green-500/20",
        yellow: "from-yellow-500/15 to-yellow-500/5 border-yellow-500/20",
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Dashboard
                    </h1>
                    <p className="text-sm mt-1 text-text-muted">
                        RubRhythm em tempo real
                    </p>
                </div>
                {totalPending > 0 && (
                    <div className="glass-card px-4 py-2.5 flex items-center gap-2 self-start border-primary/30 bg-primary/5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {totalPending} {totalPending === 1 ? "acao pendente" : "acoes pendentes"}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Urgent Alerts ── */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {alerts.map((alert) => (
                        <Link
                            key={alert.label}
                            href={alert.href}
                            className={`glass-card p-4 bg-gradient-to-br ${alert.color === "red" ? "from-red-500/10 to-red-500/5 border-red-500/30" : "from-yellow-500/10 to-yellow-500/5 border-yellow-500/30"} group relative`}
                        >
                            <span className="absolute top-3 right-3 flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${alert.color === "red" ? "bg-red-500" : "bg-yellow-500"}`} />
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${alert.color === "red" ? "bg-red-500" : "bg-yellow-500"}`} />
                            </span>
                            <div className="text-lg mb-1">{alert.emoji}</div>
                            <div className={`text-3xl font-black mb-0.5 ${alert.color === "red" ? "text-red-400" : "text-yellow-400"}`}>
                                {alert.count}
                            </div>
                            <div className="text-xs text-text-muted">{alert.label}</div>
                        </Link>
                    ))}
                </div>
            )}

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className={`glass-card p-4 bg-gradient-to-br ${colorMap[kpi.color]}`}
                    >
                        <div className="text-lg mb-2">{kpi.emoji}</div>
                        <div className="text-xs mb-1 truncate text-text-muted">{kpi.label}</div>
                        <div className="text-xl font-black truncate text-white">{kpi.value}</div>
                        {kpi.sub && (
                            <div className="text-xs mt-1 text-green-400 font-semibold">{kpi.sub}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Activity Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Recent Users */}
                <div className="lg:col-span-2 glass-card overflow-hidden !p-0">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h2 className="text-sm font-bold text-white">Usuarios recentes</h2>
                        <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline">
                            Ver todos &rarr;
                        </Link>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-5 py-2.5 text-xs font-medium text-text-muted">Usuario</th>
                                    <th className="text-left px-5 py-2.5 text-xs font-medium text-text-muted">Role</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-medium text-text-muted">Creditos</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-medium text-text-muted">Tempo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.recentUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-border/50 hover:bg-white/[0.03] transition-colors">
                                        <td className="px-5 py-3">
                                            <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                                                    {(user.name || "?")[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold truncate text-white group-hover:text-primary transition-colors">
                                                        {user.name || "Sem nome"}
                                                    </div>
                                                    <div className="text-xs truncate text-text-muted">{user.email}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                                user.role === "provider" ? "border-primary/30 bg-primary/10 text-primary" :
                                                user.role === "admin" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" :
                                                "border-sky-400/30 bg-sky-400/10 text-sky-400"
                                            }`}>
                                                {user.role === "provider" ? "Massagista" : user.role === "admin" ? "Admin" : "Cliente"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-mono text-text-muted">
                                            {formatCurrency(user.credits)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-xs text-text-muted whitespace-nowrap">
                                            {user.ago}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden divide-y divide-border/50">
                        {activity.recentUsers.map((user) => (
                            <Link key={user.id} href={`/admin/users/${user.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                                    {(user.name || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold truncate text-white">{user.name || "Sem nome"}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                            user.role === "provider" ? "border-primary/30 bg-primary/10 text-primary" :
                                            "border-sky-400/30 bg-sky-400/10 text-sky-400"
                                        }`}>
                                            {user.role === "provider" ? "Massagista" : "Cliente"}
                                        </span>
                                    </div>
                                    <div className="text-xs truncate text-text-muted">{user.email}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-xs font-mono text-text-muted">{formatCurrency(user.credits)}</div>
                                    <div className="text-xs text-text-muted/50">{user.ago}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card !p-0">
                    <div className="px-5 py-4 border-b border-border">
                        <h2 className="text-sm font-bold text-white">Acoes rapidas</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3">
                        {[
                            { emoji: "🪪", label: "Verificacoes", href: "/admin/verificacao", count: actionQueue.pendingVerificationsCount },
                            { emoji: "📋", label: "Anuncios", href: "/admin/listings", count: overview.listings.pending },
                            { emoji: "💬", label: "Reviews", href: "/admin/reviews", count: actionQueue.pendingReviewsCount },
                            { emoji: "👥", label: "Usuarios", href: "/admin/users", count: null },
                            { emoji: "🚨", label: "Escrows", href: "/admin/financeiro", count: overview.financial.disputedEscrows },
                            { emoji: "💰", label: "Financeiro", href: "/admin/financeiro", count: null },
                            { emoji: "🔍", label: "Content Scan", href: "/admin/content-scan", count: null },
                            { emoji: "📊", label: "Relatorios", href: "/admin/relatorios", count: null },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all border border-border text-text-muted hover:border-primary/30 hover:text-white hover:bg-primary/5"
                            >
                                <span className="text-xl">{action.emoji}</span>
                                <span className="text-xs">{action.label}</span>
                                {action.count > 0 && (
                                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-black px-1 bg-primary text-white">
                                        {action.count}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Recent Listings */}
                <div className="glass-card !p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h2 className="text-sm font-bold text-white">Anuncios recentes</h2>
                        <Link href="/admin/listings" className="text-xs font-bold text-primary hover:underline">
                            Ver todos &rarr;
                        </Link>
                    </div>
                    <div className="divide-y divide-border/50">
                        {activity.recentListings.map((listing) => (
                            <div key={listing.id} className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold truncate text-white">{listing.title}</div>
                                    <div className="text-xs mt-0.5 truncate text-text-muted">
                                        {listing.user?.name || "Desconhecido"} &middot; {listing.city}, {listing.state}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                        !listing.isApproved ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" :
                                        !listing.isActive ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-400" :
                                        "border-green-500/30 bg-green-500/10 text-green-400"
                                    }`}>
                                        {!listing.isApproved ? "Pendente" : !listing.isActive ? "Inativo" : "Ativo"}
                                    </span>
                                    <span className="text-xs text-text-muted/50">{listing.ago}</span>
                                </div>
                            </div>
                        ))}
                        {activity.recentListings.length === 0 && (
                            <div className="px-5 py-8 text-center text-sm text-text-muted">Nenhum anuncio recente</div>
                        )}
                    </div>
                </div>

                {/* Top Providers */}
                <div className="glass-card !p-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h2 className="text-sm font-bold text-white">Top Massagistas</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {activity.topProviders.map((provider, i) => (
                            <div key={provider.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border ${
                                    i === 0 ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" :
                                    i === 1 ? "border-zinc-400/30 bg-zinc-400/10 text-zinc-400" :
                                    i === 2 ? "border-amber-700/30 bg-amber-700/10 text-amber-600" :
                                    "border-border bg-white/[0.03] text-text-muted"
                                }`}>
                                    {i + 1}
                                </span>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                                    {(provider.name || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold truncate text-white">{provider.name || "Sem nome"}</span>
                                        {provider.verified && <span title="Verificada">✅</span>}
                                    </div>
                                    <div className="text-xs truncate text-text-muted">{provider.email}</div>
                                </div>
                                <div className="text-sm font-mono font-bold shrink-0 text-green-400">
                                    {formatCurrency(provider.credits)}
                                </div>
                            </div>
                        ))}
                        {activity.topProviders.length === 0 && (
                            <div className="px-5 py-8 text-center text-sm text-text-muted">Nenhuma massagista com creditos</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
