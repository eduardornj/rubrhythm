"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function imgSrc(images) {
    try {
        const arr = typeof images === "string" ? JSON.parse(images) : images;
        if (!arr?.length) return "/placeholder-provider.svg";
        const img = arr[0];
        return img?.startsWith("http") ? img : `/api/images/${img}`;
    } catch { return "/placeholder-provider.svg"; }
}

function getStatus(l) {
    if (!l.isApproved && !l.isActive) return "inactive";
    if (!l.isApproved) return "pending";
    if (l.isFeatured || l.isHighlighted) return "featured";
    return "active";
}

const STATUS_CFG = {
    active:   { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400",  dot: "bg-green-400",  label: "Ativo" },
    pending:  { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-400", label: "Pendente" },
    inactive: { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400",    dot: "bg-red-400",    label: "Pausado" },
    featured: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", dot: "bg-violet-400", label: "Promovido" },
};

function formatDaysLeft(endDateString) {
    if (!endDateString) return "";
    const diff = new Date(endDateString) - new Date();
    if (diff <= 0) return "Expirado";
    const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${d}d restantes`;
}

function formatTimeLeft(endDateString) {
    if (!endDateString) return "";
    const diff = new Date(endDateString) - new Date();
    if (diff <= 0) return "Expirado";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

function formatCompactDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function countImages(images) {
    try {
        const arr = typeof images === "string" ? JSON.parse(images) : images;
        return arr?.length || 0;
    } catch { return 0; }
}

function formatPrice(listing) {
    if (listing.hourlyRate) return `R$${listing.hourlyRate}/h`;
    if (listing.priceRange) return listing.priceRange;
    return "—";
}

// ─── Expandable listing detail row ─────────────────────────────────────────────
function ListingDetail({ listing, onAction, onDelete, actionLoading }) {
    const s = getStatus(listing);
    const busy = (act) => actionLoading === listing.id + act;

    const ActionBtn = ({ action, label, color, extra, confirm: needConfirm }) => (
        <button
            onClick={() => {
                if (needConfirm && !confirm(needConfirm)) return;
                onAction(listing.id, action, extra);
            }}
            disabled={busy(action)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 ${color}`}
        >
            {busy(action) ? "..." : label}
        </button>
    );

    const isFeaturedActive = listing.isFeatured && listing.featuredEndDate && new Date(listing.featuredEndDate) > new Date();
    const isHighlightActive = listing.isHighlighted && listing.highlightEndDate && new Date(listing.highlightEndDate) > new Date();
    const isAvailableNow = listing.availableNow && listing.availableUntil && new Date(listing.availableUntil) > new Date();

    return (
        <div className="bg-white/[0.02] border-t border-white/5 px-4 py-4 space-y-4 animate-fade-in">
            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1">Criado em</p>
                    <p className="text-white text-xs font-medium">{formatDate(listing.createdAt)}</p>
                </div>
                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1">Ultimo Bump</p>
                    <p className="text-white text-xs font-medium">{formatDate(listing.lastBumpUp)}</p>
                </div>
                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1">Provider</p>
                    <p className="text-white text-xs font-medium flex items-center gap-1">
                        {listing.user?.name || "—"}
                        {listing.user?.verified && <span className="text-blue-400 text-[10px]">&#10003;</span>}
                    </p>
                    <p className="text-white/30 text-[10px]">{listing.user?.email}</p>
                </div>
                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white text-xs font-medium">{listing.city}, {listing.state}</p>
                </div>
            </div>

            {/* Active Promotions */}
            <div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Promotions Ativas</p>
                <div className="flex flex-wrap gap-2">
                    {isAvailableNow && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] bg-green-500/15 border border-green-500/25 text-green-400 px-2.5 py-1 rounded-lg font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Available Now ({formatTimeLeft(listing.availableUntil)})
                        </span>
                    )}
                    {isHighlightActive && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 px-2.5 py-1 rounded-lg font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                            Highlight ({formatDaysLeft(listing.highlightEndDate)})
                        </span>
                    )}
                    {isFeaturedActive && listing.featureTier?.toUpperCase() === "PREMIUM" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] bg-violet-500/15 border border-violet-500/25 text-violet-400 px-2.5 py-1 rounded-lg font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Premium ({formatDaysLeft(listing.featuredEndDate)})
                        </span>
                    )}
                    {isFeaturedActive && listing.featureTier?.toUpperCase() !== "PREMIUM" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-500/15 border border-amber-500/25 text-amber-400 px-2.5 py-1 rounded-lg font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Featured ({formatDaysLeft(listing.featuredEndDate)})
                        </span>
                    )}
                    {!isAvailableNow && !isHighlightActive && !isFeaturedActive && (
                        <span className="text-white/20 text-[11px]">Nenhuma promotion ativa</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                {/* Status Actions */}
                <div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Status</p>
                    <div className="flex flex-wrap gap-2">
                        {s === "pending" && (
                            <>
                                <ActionBtn action="approve" label="Aprovar" color="border-green-500/30 text-green-400 hover:bg-green-500/10" />
                                <ActionBtn action="reject" label="Rejeitar" color="border-red-500/30 text-red-400 hover:bg-red-500/10" />
                            </>
                        )}
                        {s === "inactive" && (
                            <ActionBtn action="reactivate" label="Reativar" color="border-green-500/30 text-green-400 hover:bg-green-500/10" />
                        )}
                        {(s === "active" || s === "featured") && (
                            <ActionBtn action="deactivate" label="Pausar" color="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" />
                        )}
                        <ActionBtn action="bump-up" label="Bump Up" color="border-blue-500/30 text-blue-400 hover:bg-blue-500/10" />
                        <Link
                            href={`/united-states/${listing.state?.toLowerCase().replace(/\s+/g, "-")}/${listing.city?.toLowerCase().replace(/\s+/g, "-")}/massagists/${listing.slug || listing.id}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Ver no Site
                        </Link>
                    </div>
                </div>

                {/* Highlight Actions */}
                <div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Highlight</p>
                    <div className="flex flex-wrap gap-2">
                        <ActionBtn action="highlight" label="+ 7 dias" extra={{ days: 7 }} color="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" />
                        <ActionBtn action="highlight" label="+ 30 dias" extra={{ days: 30 }} color="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" />
                        {listing.isHighlighted && (
                            <ActionBtn action="unhighlight" label="Remover Highlight" color="border-red-500/20 text-red-400/70 hover:bg-red-500/10" />
                        )}
                    </div>
                </div>

                {/* Feature Actions */}
                <div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Feature</p>
                    <div className="flex flex-wrap gap-2">
                        <ActionBtn action="feature" label="Standard 7d" extra={{ days: 7 }} color="border-amber-500/30 text-amber-400 hover:bg-amber-500/10" />
                        <ActionBtn action="feature" label="Standard 30d" extra={{ days: 30 }} color="border-amber-500/30 text-amber-400 hover:bg-amber-500/10" />
                        <ActionBtn action="feature-premium" label="Premium 7d" extra={{ days: 7 }} color="border-violet-500/30 text-violet-400 hover:bg-violet-500/10" />
                        <ActionBtn action="feature-premium" label="Premium 30d" extra={{ days: 30 }} color="border-violet-500/30 text-violet-400 hover:bg-violet-500/10" />
                        {listing.isFeatured && (
                            <ActionBtn action="unfeature" label="Remover Feature" color="border-red-500/20 text-red-400/70 hover:bg-red-500/10" />
                        )}
                    </div>
                </div>

                {/* Danger */}
                <div className="pt-2 border-t border-white/5">
                    <button
                        onClick={() => onDelete(listing.id, listing.title)}
                        disabled={busy("delete")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                        {busy("delete") ? "Deletando..." : "Deletar Permanentemente"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AnunciosPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center py-16"><div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" /></div>}>
            <AnunciosPage />
        </Suspense>
    );
}

function AnunciosPage() {
    const searchParams = useSearchParams();
    const userIdFilter = searchParams.get("userId");

    const [listings, setListings] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [filterUserName, setFilterUserName] = useState(null);

    const LIMIT = 20;

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: LIMIT, search });
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (userIdFilter) params.set("userId", userIdFilter);
        const res = await fetch(`/api/admin/listings?${params}`);
        const json = await res.json();
        const fetched = json.data?.listings || [];
        setListings(fetched);
        setTotal(json.data?.total || 0);
        if (userIdFilter && fetched.length > 0 && !filterUserName) {
            setFilterUserName(fetched[0].user?.name || fetched[0].user?.email || "Usuário");
        }
        setLoading(false);
    }, [page, search, statusFilter, userIdFilter]);

    useEffect(() => { load(); }, [load]);

    const doAction = async (id, action, extra = {}) => {
        setActionLoading(id + action);
        try {
            const res = await fetch("/api/admin/listings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId: id, action, ...extra }),
            });
            const json = await res.json();
            if (res.ok) { showToast(json.data?.message || "Acao executada!"); load(); }
            else showToast(json.error?.message || json.error || "Erro.", "error");
        } catch { showToast("Erro de rede.", "error"); }
        setActionLoading(null);
    };

    const doDelete = async (id, title) => {
        if (!confirm(`Deletar "${title}" permanentemente? Nao pode ser desfeito.`)) return;
        setActionLoading(id + "delete");
        try {
            const res = await fetch(`/api/admin/listings?id=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (res.ok) { showToast("Anuncio deletado."); setExpandedId(null); load(); }
            else showToast(json.error?.message || "Erro.", "error");
        } catch { showToast("Erro de rede.", "error"); }
        setActionLoading(null);
    };

    const totalPages = Math.ceil(total / LIMIT);

    // Count stats
    const pendingCount = listings.filter(l => getStatus(l) === "pending").length;

    return (
        <div className="space-y-5 pb-20">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border backdrop-blur-sm transition-all ${toast.type === "success"
                    ? "bg-green-500/15 border-green-500/25 text-green-400"
                    : "bg-red-500/15 border-red-500/25 text-red-400"
                }`}>
                    {toast.msg}
                </div>
            )}

            {/* User filter banner */}
            {userIdFilter && (
                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5">
                    <span className="text-blue-400 text-sm font-semibold">
                        Filtrando por: {filterUserName || "..."}
                    </span>
                    <Link href="/admin/listings" className="text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1 rounded-lg hover:bg-white/5 transition-all">
                        Ver todos
                    </Link>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Moderacao de Anuncios</h1>
                    <p className="text-white/40 text-sm mt-0.5">
                        {total} anuncio{total !== 1 ? "s" : ""}
                        {pendingCount > 0 && <span className="ml-2 text-yellow-400 font-semibold">{pendingCount} pendentes nesta pagina</span>}
                    </p>
                </div>
                <button onClick={load} className="text-xs border border-white/10 text-white/50 px-4 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-all font-medium">
                    Recarregar
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <input
                    id="admin-listings-search"
                    name="search"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar por titulo, cidade ou provider..."
                    className="flex-1 min-w-48 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
                />
                {[
                    { key: "all",      label: "Todos",     count: null },
                    { key: "approved", label: "Ativos",    count: null },
                    { key: "pending",  label: "Pendentes", count: null },
                    { key: "featured", label: "Promovidos", count: null },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setStatusFilter(f.key); setPage(1); }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${statusFilter === f.key
                            ? "bg-white/10 border-white/15 text-white"
                            : "bg-white/[0.02] border-white/6 text-white/40 hover:text-white/70 hover:border-white/12"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Listings Table */}
            <div className="bg-white/[0.015] border border-white/6 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-[56px_1fr_140px_90px_60px_80px_100px_auto_120px] gap-2 px-4 py-3 border-b border-white/6 bg-white/[0.02]">
                    <span></span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Anuncio</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Provider</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Preco</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider text-center">Fotos</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Criado</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Status</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Promotions</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider text-right">Acoes</span>
                </div>

                {/* Rows */}
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-16 text-white/20 text-sm">
                        Nenhum anuncio encontrado.
                    </div>
                ) : listings.map(l => {
                    const s = getStatus(l);
                    const cfg = STATUS_CFG[s];
                    const isExpanded = expandedId === l.id;

                    const isFeaturedActive = l.isFeatured && l.featuredEndDate && new Date(l.featuredEndDate) > new Date();
                    const isHighlightActive = l.isHighlighted && l.highlightEndDate && new Date(l.highlightEndDate) > new Date();
                    const isAvailableNow = l.availableNow && l.availableUntil && new Date(l.availableUntil) > new Date();
                    const promoCount = [isAvailableNow, isHighlightActive, isFeaturedActive].filter(Boolean).length;

                    const imgCount = countImages(l.images);
                    const price = formatPrice(l);
                    const quickBusy = (act) => actionLoading === l.id + act;

                    return (
                        <div key={l.id} className={`border-b border-white/4 transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}>
                            {/* Main Row — Desktop */}
                            <div
                                className="hidden lg:grid grid-cols-[56px_1fr_140px_90px_60px_80px_100px_auto_120px] gap-2 px-4 py-3 cursor-pointer items-center"
                                onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                                {/* Thumbnail */}
                                <div className="relative w-11 h-11">
                                    <Image
                                        src={imgSrc(l.images)}
                                        alt={l.title}
                                        fill
                                        unoptimized
                                        className="object-cover rounded-xl"
                                        onError={e => { e.currentTarget.src = "/placeholder-provider.svg"; }}
                                    />
                                    {s === "pending" && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-[#0a0a0a] animate-pulse" />
                                    )}
                                </div>

                                {/* Title + Location */}
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{l.title}</p>
                                    <p className="text-white/30 text-[11px] truncate">{l.city}, {l.state}</p>
                                </div>

                                {/* Provider */}
                                <div className="min-w-0">
                                    <p className="text-white/60 text-xs font-medium truncate flex items-center gap-1">
                                        {l.user?.name || "—"}
                                        {l.user?.verified && <span className="text-blue-400 text-[10px]">&#10003;</span>}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="min-w-0">
                                    <p className="text-white/50 text-xs font-medium truncate">{price}</p>
                                </div>

                                {/* Image Count */}
                                <div className="text-center">
                                    <span className={`text-xs font-medium ${imgCount === 0 ? "text-red-400/60" : "text-white/40"}`}>
                                        {imgCount}
                                    </span>
                                </div>

                                {/* Created Date */}
                                <div>
                                    <p className="text-white/35 text-[11px] font-medium">{formatCompactDate(l.createdAt)}</p>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Promotions Ativas */}
                                <div className="flex flex-wrap gap-1">
                                    {isFeaturedActive && (
                                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${l.featureTier?.toUpperCase() === "PREMIUM" ? "bg-violet-500/15 border border-violet-500/20 text-violet-400" : "bg-amber-500/15 border border-amber-500/20 text-amber-400"}`}>
                                            {l.featureTier?.toUpperCase() === "PREMIUM" ? "Premium" : "Featured"}
                                            <span className="text-[8px] opacity-60">{formatDaysLeft(l.featuredEndDate)}</span>
                                        </span>
                                    )}
                                    {isHighlightActive && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-yellow-500/15 border border-yellow-500/20 text-yellow-400">
                                            Highlight
                                            <span className="text-[8px] opacity-60">{formatDaysLeft(l.highlightEndDate)}</span>
                                        </span>
                                    )}
                                    {isAvailableNow && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/15 border border-green-500/20 text-green-400">
                                            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                                            Now
                                        </span>
                                    )}
                                    {!isFeaturedActive && !isHighlightActive && !isAvailableNow && (
                                        <span className="text-white/15 text-[9px]">—</span>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="text-right flex items-center justify-end gap-1.5">
                                    {s === "pending" && (
                                        <>
                                            <button
                                                onClick={e => { e.stopPropagation(); doAction(l.id, "approve"); }}
                                                disabled={quickBusy("approve")}
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-green-500/25 text-green-400 hover:bg-green-500/15 transition-all disabled:opacity-40"
                                                title="Aprovar"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); doAction(l.id, "reject"); }}
                                                disabled={quickBusy("reject")}
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-40"
                                                title="Rejeitar"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    <Link
                                        href={`/united-states/${l.state?.toLowerCase().replace(/\s+/g, "-")}/${l.city?.toLowerCase().replace(/\s+/g, "-")}/massagists/${l.slug || l.id}`}
                                        target="_blank"
                                        onClick={e => e.stopPropagation()}
                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-white/8 text-white/30 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                        title="Ver no site"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Main Row — Mobile/Tablet */}
                            <div
                                className="lg:hidden flex items-start gap-3 px-4 py-3 cursor-pointer"
                                onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                                {/* Thumbnail */}
                                <div className="relative w-11 h-11 shrink-0">
                                    <Image
                                        src={imgSrc(l.images)}
                                        alt={l.title}
                                        fill
                                        unoptimized
                                        className="object-cover rounded-xl"
                                        onError={e => { e.currentTarget.src = "/placeholder-provider.svg"; }}
                                    />
                                    {s === "pending" && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-[#0a0a0a] animate-pulse" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-white text-sm font-semibold truncate">{l.title}</p>
                                        <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-[11px] truncate">{l.city}, {l.state}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/35">
                                        <span className="flex items-center gap-1">
                                            <span className="text-white/50 font-medium">{l.user?.name || "—"}</span>
                                            {l.user?.verified && <span className="text-blue-400 text-[10px]">&#10003;</span>}
                                        </span>
                                        <span>{price}</span>
                                        <span>{imgCount} fotos</span>
                                        <span>{formatCompactDate(l.createdAt)}</span>
                                    </div>
                                    {/* Promotions — mobile */}
                                    {(isFeaturedActive || isHighlightActive || isAvailableNow) && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {isFeaturedActive && (
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${l.featureTier?.toUpperCase() === "PREMIUM" ? "bg-violet-500/15 border border-violet-500/20 text-violet-400" : "bg-amber-500/15 border border-amber-500/20 text-amber-400"}`}>
                                                    {l.featureTier?.toUpperCase() === "PREMIUM" ? "Premium" : "Featured"} {formatDaysLeft(l.featuredEndDate)}
                                                </span>
                                            )}
                                            {isHighlightActive && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-yellow-500/15 border border-yellow-500/20 text-yellow-400">
                                                    Highlight {formatDaysLeft(l.highlightEndDate)}
                                                </span>
                                            )}
                                            {isAvailableNow && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/15 border border-green-500/20 text-green-400">
                                                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                                                    Now
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {/* Quick actions for pending — mobile */}
                                    {s === "pending" && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={e => { e.stopPropagation(); doAction(l.id, "approve"); }}
                                                disabled={quickBusy("approve")}
                                                className="px-3 py-1 rounded-lg text-[11px] font-semibold border border-green-500/25 text-green-400 hover:bg-green-500/15 transition-all disabled:opacity-40"
                                            >
                                                {quickBusy("approve") ? "..." : "Aprovar"}
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); doAction(l.id, "reject"); }}
                                                disabled={quickBusy("reject")}
                                                className="px-3 py-1 rounded-lg text-[11px] font-semibold border border-red-500/25 text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-40"
                                            >
                                                {quickBusy("reject") ? "..." : "Rejeitar"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            {isExpanded && (
                                <ListingDetail
                                    listing={l}
                                    onAction={doAction}
                                    onDelete={doDelete}
                                    actionLoading={actionLoading}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-white/30 text-xs font-medium">
                        {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
                    </p>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl border border-white/8 text-white/50 text-xs font-medium hover:bg-white/5 disabled:opacity-30 transition-all"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-2 text-white/40 text-xs font-medium">{page}/{totalPages}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 rounded-xl border border-white/8 text-white/50 text-xs font-medium hover:bg-white/5 disabled:opacity-30 transition-all"
                        >
                            Proxima
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
