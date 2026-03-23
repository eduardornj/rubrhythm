"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Constants ────────────────────────────────────────────────

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;
const EXCERPT_LEN = 100;

const STATUS_FILTERS = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendentes" },
    { key: "approved", label: "Aprovados" },
    { key: "featured", label: "Destacados" },
];

const STATUS_MAP = {
    active: { className: "border-green-500/30 bg-green-500/10 text-green-400", label: "Ativo" },
    pending: { className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400", label: "Pendente" },
    inactive: { className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400", label: "Inativo" },
    featured: { className: "border-purple-500/30 bg-purple-500/10 text-purple-400", label: "Featured" },
    highlighted: { className: "border-sky-400/30 bg-sky-400/10 text-sky-400", label: "Highlight" },
};

const FEATURE_OPTIONS = [
    { action: "feature", label: "Feature Basic (30d)", days: 30 },
    { action: "feature-premium", label: "Feature Premium (30d)", days: 30 },
    { action: "unfeature", label: "Remover Feature" },
];

const HIGHLIGHT_OPTIONS = [
    { action: "highlight", label: "Highlight (7d)", days: 7 },
    { action: "unhighlight", label: "Remover Highlight" },
];

// ── Helpers ──────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "2-digit",
    });
}

function timeAgo(dateStr) {
    if (!dateStr) return "-";
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d`;
    return formatDate(dateStr);
}

function excerpt(text, max = EXCERPT_LEN) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
}

function formatCurrency(num) {
    if (num == null) return "-";
    return `R$ ${Number(num).toLocaleString("pt-BR")}`;
}

function renderStars(rating) {
    if (!rating) return "-";
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = "";
    for (let i = 0; i < full; i++) stars += "\u2605";
    if (half) stars += "\u00BD";
    return `${stars} ${rating.toFixed(1)}`;
}

function getListingStatus(listing) {
    if (!listing.isApproved) return "pending";
    if (!listing.isActive) return "inactive";
    return "active";
}

// ── Micro-components ─────────────────────────────────────────

function Badge({ type }) {
    const s = STATUS_MAP[type];
    if (!s) return null;
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${s.className}`}>
            {s.label}
        </span>
    );
}

function Thumbnail({ images, title }) {
    const src = images?.[0];
    if (src) {
        return (
            <Image
                src={src}
                alt={title || "Anuncio"}
                width={80}
                height={80}
                unoptimized
                className="rounded-lg object-cover shrink-0 border border-border"
            />
        );
    }
    return (
        <div
            className="rounded-lg flex items-center justify-center shrink-0 text-2xl select-none bg-white/[0.04] border border-border text-text-muted"
            style={{ width: 80, height: 80 }}
        >
            📷
        </div>
    );
}

function ConfirmButton({ label, emoji, onConfirm, color = "red", loading }) {
    const [confirming, setConfirming] = useState(false);
    const timerRef = useRef(null);

    const colorMap = {
        red: { active: "bg-red-500 border-red-500 text-white", idle: "bg-white/[0.04] border-border text-red-400" },
    };
    const colors = colorMap[color] || colorMap.red;

    function handleClick() {
        if (confirming) {
            clearTimeout(timerRef.current);
            setConfirming(false);
            onConfirm();
        } else {
            setConfirming(true);
            timerRef.current = setTimeout(() => setConfirming(false), 3000);
        }
    }

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 disabled:opacity-40 whitespace-nowrap border ${
                confirming ? colors.active : colors.idle
            }`}
            title={confirming ? "Clique de novo pra confirmar" : label}
        >
            {loading ? "..." : confirming ? `Confirmar ${label}?` : `${emoji} ${label}`}
        </button>
    );
}

function DropdownMenu({ label, emoji, options, onSelect, loading }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="btn-secondary !px-2.5 !py-1.5 !text-xs disabled:opacity-40 whitespace-nowrap"
            >
                {loading ? "..." : `${emoji} ${label}`}
            </button>
            {open && (
                <div className="absolute z-50 mt-1 right-0 min-w-[180px] rounded-lg py-1 shadow-xl bg-[#16161e] border border-white/10">
                    {options.map((opt) => (
                        <button
                            key={opt.action}
                            onClick={() => { onSelect(opt); setOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs transition-colors duration-100 hover:bg-white/[0.06] text-zinc-300"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ImageGallery({ images }) {
    if (!images?.length) return <p className="text-xs text-text-muted">Nenhuma imagem</p>;
    return (
        <div className="flex gap-2 flex-wrap">
            {images.map((src, i) => (
                <Image
                    key={i}
                    src={src}
                    alt={`Foto ${i + 1}`}
                    width={120}
                    height={120}
                    unoptimized
                    className="rounded-lg object-cover border border-border"
                />
            ))}
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="p-4 border-b border-border/50">
            <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg animate-pulse bg-white/[0.06]" />
                <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-48 rounded animate-pulse bg-white/[0.06]" />
                    <div className="h-3 w-32 rounded animate-pulse bg-white/[0.04]" />
                    <div className="h-3 w-64 rounded animate-pulse bg-white/[0.04]" />
                    <div className="flex gap-2 mt-2">
                        <div className="h-7 w-20 rounded animate-pulse bg-white/[0.04]" />
                        <div className="h-7 w-20 rounded animate-pulse bg-white/[0.04]" />
                        <div className="h-7 w-20 rounded animate-pulse bg-white/[0.04]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Listing Card ─────────────────────────────────────────────

function ListingCard({ listing, onAction, actionLoading }) {
    const [expanded, setExpanded] = useState(false);
    const isLoading = actionLoading === listing.id;
    const status = getListingStatus(listing);

    function handleAction(action, extra = {}) {
        onAction(listing.id, action, extra);
    }

    return (
        <div className="transition-colors duration-100 border-b border-border/50">
            {/* ── Card Header (clickable) ── */}
            <div
                className="p-4 cursor-pointer transition-colors duration-100 hover:bg-white/[0.02]"
                onClick={() => setExpanded(!expanded)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); } }}
                aria-expanded={expanded}
            >
                <div className="flex gap-4">
                    {/* Thumbnail */}
                    <Thumbnail images={listing.images} title={listing.title} />

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                        {/* Row 1: Title + Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold truncate max-w-[300px] text-white">
                                {listing.title || "Sem titulo"}
                            </h3>
                            <Badge type={status} />
                            {listing.isFeatured && <Badge type="featured" />}
                            {listing.isHighlighted && <Badge type="highlighted" />}
                        </div>

                        {/* Row 2: Location */}
                        <p className="text-xs mb-1.5 text-text-muted">
                            📍 {listing.city || "?"}, {listing.state || "?"}
                            {listing.priceRange && (
                                <span className="ml-2">
                                    {" "}|{" "}
                                    <span className="text-green-400">{listing.priceRange}</span>
                                </span>
                            )}
                            {listing.hourlyRate != null && (
                                <span className="ml-2">
                                    {" "}|{" "}
                                    <span className="text-green-400">{formatCurrency(listing.hourlyRate)}/h</span>
                                </span>
                            )}
                        </p>

                        {/* Row 3: Provider */}
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs text-text-muted">
                                👤 {listing.user?.name || "Desconhecido"}
                            </span>
                            <span className="text-xs text-text-muted">
                                {listing.user?.email}
                            </span>
                            {listing.user?.verified && (
                                <span className="text-xs" title="Verificado">✅</span>
                            )}
                        </div>

                        {/* Row 4: Stats */}
                        <div className="flex flex-wrap items-center gap-3 mb-1.5">
                            <span className="text-xs text-text-muted">
                                👁 {listing.viewCount ?? 0}
                            </span>
                            <span className="text-xs text-yellow-400">
                                {renderStars(listing.averageRating)}
                            </span>
                            <span className="text-xs text-text-muted">
                                💬 {listing.totalReviews ?? 0} reviews
                            </span>
                            {listing.featureTier && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                    Tier: {listing.featureTier}
                                </span>
                            )}
                        </div>

                        {/* Row 5: Description excerpt */}
                        {listing.description && (
                            <p className="text-xs leading-relaxed text-text-muted">
                                {excerpt(listing.description)}
                            </p>
                        )}

                        {/* Row 6: Contact */}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            {listing.phoneArea && listing.phoneNumber && (
                                <span className="text-xs text-text-muted">
                                    📞 ({listing.phoneArea}) {listing.phoneNumber}
                                </span>
                            )}
                            {listing.whatsapp && (
                                <span className="text-xs text-green-400">
                                    💬 WhatsApp
                                </span>
                            )}
                            {listing.telegram && (
                                <span className="text-xs text-sky-400">
                                    ✈️ Telegram
                                </span>
                            )}
                        </div>

                        {/* Row 7: Dates */}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="text-xs text-text-muted">
                                Criado: {formatDate(listing.createdAt)}
                            </span>
                            {listing.lastBumpUp && (
                                <span className="text-xs text-text-muted">
                                    Bump: {timeAgo(listing.lastBumpUp)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Expand arrow */}
                    <div className="shrink-0 self-start pt-1">
                        <span
                            className="text-xs transition-transform duration-200 inline-block text-text-muted"
                            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                            ▼
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Action Buttons ── */}
            <div
                className="px-4 pb-3 flex flex-wrap gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Approve / Reject */}
                {!listing.isApproved && (
                    <>
                        <button
                            onClick={() => handleAction("approve")}
                            disabled={isLoading}
                            className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 disabled:opacity-40 whitespace-nowrap border border-green-500/30 bg-green-500/10 text-green-400"
                        >
                            ✅ Aprovar
                        </button>
                        <button
                            onClick={() => handleAction("reject")}
                            disabled={isLoading}
                            className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 disabled:opacity-40 whitespace-nowrap border border-red-500/30 bg-red-500/10 text-red-400"
                        >
                            ❌ Rejeitar
                        </button>
                    </>
                )}

                {/* Activate / Deactivate */}
                {listing.isApproved && (
                    <button
                        onClick={() => handleAction(listing.isActive ? "deactivate" : "reactivate")}
                        disabled={isLoading}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 disabled:opacity-40 whitespace-nowrap border ${
                            listing.isActive
                                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                                : "border-green-500/30 bg-green-500/10 text-green-400"
                        }`}
                    >
                        {listing.isActive ? "⏸ Desativar" : "▶ Reativar"}
                    </button>
                )}

                {/* Bump Up */}
                <button
                    onClick={() => handleAction("bump-up")}
                    disabled={isLoading}
                    className="btn-secondary !px-2.5 !py-1.5 !text-xs disabled:opacity-40 whitespace-nowrap"
                >
                    🚀 Bump Up
                </button>

                {/* Feature dropdown */}
                <DropdownMenu
                    label="Feature"
                    emoji="⭐"
                    options={FEATURE_OPTIONS}
                    onSelect={(opt) => handleAction(opt.action, opt.days ? { days: opt.days } : {})}
                    loading={isLoading}
                />

                {/* Highlight dropdown */}
                <DropdownMenu
                    label="Highlight"
                    emoji="✨"
                    options={HIGHLIGHT_OPTIONS}
                    onSelect={(opt) => handleAction(opt.action, opt.days ? { days: opt.days } : {})}
                    loading={isLoading}
                />

                {/* Delete */}
                <ConfirmButton
                    label="Excluir"
                    emoji="🗑"
                    onConfirm={() => handleAction("delete")}
                    color="red"
                    loading={isLoading}
                />
            </div>

            {/* ── Expanded Details ── */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-border/50">
                    <div className="pt-4 space-y-4">
                        {/* Full description */}
                        <div>
                            <h4 className="text-xs font-semibold mb-1.5 text-text-muted">
                                Descricao completa
                            </h4>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap text-text-muted">
                                {listing.description || "Sem descricao"}
                            </p>
                        </div>

                        {/* Services */}
                        {listing.services?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold mb-1.5 text-text-muted">
                                    Servicos
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {listing.services.map((svc, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded text-xs border border-primary/20 bg-primary/[0.08] text-primary"
                                        >
                                            {svc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Images gallery */}
                        <div>
                            <h4 className="text-xs font-semibold mb-1.5 text-text-muted">
                                Imagens ({listing.images?.length || 0})
                            </h4>
                            <ImageGallery images={listing.images} />
                        </div>

                        {/* Contact details */}
                        <div>
                            <h4 className="text-xs font-semibold mb-1.5 text-text-muted">
                                Contato
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-text-muted">
                                {listing.phoneArea && listing.phoneNumber && (
                                    <div>
                                        📞 ({listing.phoneArea}) {listing.phoneNumber}
                                    </div>
                                )}
                                {listing.whatsapp && (
                                    <div className="text-green-400">💬 WhatsApp: {listing.whatsapp}</div>
                                )}
                                {listing.telegram && (
                                    <div className="text-sky-400">✈️ Telegram: {listing.telegram}</div>
                                )}
                            </div>
                        </div>

                        {/* Provider details */}
                        <div>
                            <h4 className="text-xs font-semibold mb-1.5 text-text-muted">
                                Provider
                            </h4>
                            <div className="text-xs space-y-1 text-text-muted">
                                <p>ID: <span className="font-mono text-text-muted">{listing.user?.id}</span></p>
                                <p>Nome: {listing.user?.name || "-"}</p>
                                <p>Email: {listing.user?.email || "-"}</p>
                                <p>Role: {listing.user?.role || "-"}</p>
                                <p>Verificado: {listing.user?.verified ? "Sim ✅" : "Nao"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionLoading, setActionLoading] = useState(null);

    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const searchRef = useRef(search);

    // ── Fetch listings ──────────────────────────────────────

    const fetchListings = useCallback(async (currentPage, currentStatus, currentSearch) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        try {
            const params = new URLSearchParams();
            params.set("page", String(currentPage));
            params.set("limit", String(PAGE_SIZE));
            if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
            if (currentSearch.trim()) params.set("search", currentSearch.trim());

            const res = await fetch(`/api/admin/listings?${params.toString()}`, {
                signal: controller.signal,
            });

            if (!res.ok) throw new Error("Fetch failed");

            const json = await res.json();

            if (json.success) {
                const data = json.data || {};
                const pagination = json.metadata?.pagination || {};

                setListings(data.listings || []);
                setTotal(pagination.total || data.total || 0);
                setTotalPages(pagination.pages || 1);
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("[Listings] fetch error:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Effects ──────────────────────────────────────────────

    useEffect(() => {
        fetchListings(page, statusFilter, searchRef.current);
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [page, statusFilter, fetchListings]);

    function handleSearchChange(value) {
        setSearch(value);
        searchRef.current = value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchListings(1, statusFilter, value);
        }, DEBOUNCE_MS);
    }

    function handleStatusChange(status) {
        setStatusFilter(status);
        setPage(1);
    }

    function handleRefresh() {
        fetchListings(page, statusFilter, searchRef.current);
    }

    // ── Actions ──────────────────────────────────────────────

    async function handleAction(listingId, action, extra = {}) {
        setActionLoading(listingId);

        try {
            if (action === "delete") {
                const res = await fetch(`/api/admin/listings?id=${listingId}`, { method: "DELETE" });
                const json = await res.json();
                if (json.success) {
                    setListings((prev) => prev.filter((l) => l.id !== listingId));
                    setTotal((prev) => prev - 1);
                    return;
                }
            } else {
                const body = { listingId, action, ...extra };
                const res = await fetch("/api/admin/listings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                const json = await res.json();
                if (json.success) {
                    setListings((prev) => prev.map((l) => {
                        if (l.id !== listingId) return l;
                        const updated = { ...l };
                        switch (action) {
                            case "approve": updated.isApproved = true; updated.isActive = true; break;
                            case "reject": updated.isApproved = false; break;
                            case "deactivate": updated.isActive = false; break;
                            case "reactivate": updated.isActive = true; break;
                            case "bump-up": updated.lastBumpUp = new Date().toISOString(); break;
                            case "feature": updated.isFeatured = true; updated.featureTier = "basic"; break;
                            case "feature-premium": updated.isFeatured = true; updated.featureTier = "premium"; break;
                            case "unfeature": updated.isFeatured = false; updated.featureTier = null; break;
                            case "highlight": updated.isHighlighted = true; break;
                            case "unhighlight": updated.isHighlighted = false; break;
                        }
                        return updated;
                    }));
                }
            }
        } catch (err) {
            console.error("[Action] error:", err);
        } finally {
            setActionLoading(null);
        }
    }

    // ── Pagination ───────────────────────────────────────────

    function goPage(p) {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    }

    // ── Render ───────────────────────────────────────────────

    const isEmpty = !loading && listings.length === 0;

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Anuncios
                    </h1>
                    {!loading && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-primary/25 bg-primary/10 text-primary">
                            {total}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="btn-secondary self-start sm:self-auto disabled:opacity-50"
                    aria-label="Atualizar lista"
                >
                    {loading ? "⏳" : "🔄"} Atualizar
                </button>
            </div>

            {/* ── Search + Filters ────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
                        aria-hidden="true"
                    >
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por titulo, cidade, provider..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="input-field w-full !pl-9"
                    />
                </div>

                {/* Status chips */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map((sf) => {
                        const isActive = statusFilter === sf.key;
                        return (
                            <button
                                key={sf.key}
                                onClick={() => handleStatusChange(sf.key)}
                                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap border ${
                                    isActive
                                        ? "border-primary/40 bg-primary/10 text-primary"
                                        : "border-border text-text-muted hover:border-primary/20 hover:text-white"
                                }`}
                            >
                                {sf.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Listing Cards ────────────────────────────────── */}
            <div className="glass-card !p-0 overflow-hidden mb-6">
                {loading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {!loading && listings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        onAction={handleAction}
                        actionLoading={actionLoading}
                    />
                ))}

                {isEmpty && (
                    <div className="py-16 text-center">
                        <div className="text-3xl mb-3">📋</div>
                        <p className="text-sm font-medium text-text-muted">
                            Nenhum anuncio encontrado
                        </p>
                        {search && (
                            <p className="text-xs mt-1 text-text-muted">
                                Tente ajustar a busca ou os filtros
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Pagination ───────────────────────────────────── */}
            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => goPage(page - 1)}
                        disabled={page <= 1}
                        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        &larr; Anterior
                    </button>

                    <span className="text-sm tabular-nums text-text-muted">
                        Pagina{" "}
                        <span className="text-zinc-300">{page}</span>{" "}
                        de{" "}
                        <span className="text-zinc-300">{totalPages}</span>
                    </span>

                    <button
                        onClick={() => goPage(page + 1)}
                        disabled={page >= totalPages}
                        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Proxima &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
