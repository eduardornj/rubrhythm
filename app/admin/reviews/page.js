"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── Constants ────────────────────────────────────────────────

const PAGE_SIZE = 20;

const STATUS_TABS = [
    { key: "pending", label: "Pendentes", emoji: "⏳" },
    { key: "approved", label: "Aprovados", emoji: "✅" },
    { key: "rejected", label: "Rejeitados", emoji: "❌" },
    { key: "all", label: "Todos", emoji: "📋" },
];

const STATUS_MAP = {
    pending: { className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400", label: "Pendente" },
    approved: { className: "border-green-500/30 bg-green-500/10 text-green-400", label: "Aprovado" },
    rejected: { className: "border-red-500/30 bg-red-500/10 text-red-400", label: "Rejeitado" },
};

// ── Helpers ──────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function renderStars(rating) {
    const filled = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) =>
        i < filled ? "\u2605" : "\u2606"
    ).join("");
}

// ── Micro-components ─────────────────────────────────────────

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] || STATUS_MAP.pending;
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${s.className}`}>
            {s.label}
        </span>
    );
}

function StatBadge({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap border ${
                active
                    ? "border-primary/40 bg-primary/90 text-white"
                    : "border-border text-text-muted hover:border-primary/20 hover:text-white"
            }`}
        >
            {label}
            {count != null && (
                <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                        active ? "bg-white/20 text-white" : "bg-white/[0.06] text-text-muted"
                    }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function SkeletonCard() {
    return (
        <div className="glass-card !p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 rounded animate-pulse bg-white/[0.06]" />
                    <div className="h-3 w-48 rounded animate-pulse bg-white/[0.04]" />
                </div>
                <div className="h-5 w-20 rounded animate-pulse bg-white/[0.06]" />
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 w-full rounded animate-pulse bg-white/[0.04]" />
                <div className="h-3 w-3/4 rounded animate-pulse bg-white/[0.04]" />
            </div>
            <div className="flex items-center gap-2">
                <div className="h-8 w-20 rounded animate-pulse bg-white/[0.04]" />
                <div className="h-8 w-20 rounded animate-pulse bg-white/[0.04]" />
            </div>
        </div>
    );
}

function RejectModal({ isOpen, onClose, onConfirm, loading }) {
    const [reason, setReason] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setReason("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg p-6 bg-[#12121a] border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-1 text-white">
                    Rejeitar Review
                </h3>
                <p className="text-sm mb-4 text-text-muted">
                    Informe o motivo da rejeicao. O usuario sera notificado.
                </p>
                <textarea
                    ref={inputRef}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo da rejeicao..."
                    rows={3}
                    className="input-field w-full resize-none"
                />
                <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={loading || !reason.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/60 bg-red-500/90 text-white"
                    >
                        {loading ? "Rejeitando..." : "Confirmar Rejeicao"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirm({ isOpen, onClose, onConfirm, loading }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-lg p-6 bg-[#12121a] border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-1 text-white">
                    Deletar Review
                </h3>
                <p className="text-sm mb-5 text-text-muted">
                    Essa acao e permanente. O review sera removido do banco de dados.
                </p>
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/60 bg-red-500/90 text-white"
                    >
                        {loading ? "Deletando..." : "Deletar Permanente"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReviewCard({ review, onApprove, onReject, onDelete, actionLoading }) {
    const reviewer = review.user_review_reviewerIdTouser;
    const listing = review.listing;
    const isLoading = actionLoading === review.id;

    return (
        <div
            className={`glass-card transition-all duration-200 ${
                review.status === "pending" ? "!border-yellow-500/15" : ""
            }`}
        >
            {/* Top row: stars + status + date */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg tracking-wider text-yellow-400" title={`${review.rating}/5`}>
                        {renderStars(review.rating)}
                    </span>
                    <StatusBadge status={review.status} />
                    {review.isVerified && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium border border-sky-400/30 bg-sky-400/10 text-sky-400">
                            Verificado
                        </span>
                    )}
                    {review.isAnonymous && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium border border-zinc-500/30 bg-zinc-500/10 text-zinc-400">
                            Anonimo
                        </span>
                    )}
                </div>
                <span className="text-xs whitespace-nowrap shrink-0 text-text-muted">
                    {formatDate(review.createdAt)}
                </span>
            </div>

            {/* Comment */}
            {review.comment && (
                <p className="text-sm leading-relaxed mb-3 text-zinc-300">
                    {review.comment}
                </p>
            )}

            {/* Provider response */}
            {review.providerResponse && (
                <div className="rounded-md px-4 py-3 mb-3 ml-4 bg-white/[0.02] border-l-[3px] border-l-primary/40">
                    <p className="text-xs font-medium mb-1 text-text-muted">
                        Resposta do profissional:
                    </p>
                    <p className="text-sm leading-relaxed text-text-muted">
                        {review.providerResponse}
                    </p>
                </div>
            )}

            {/* Rejection reason */}
            {review.status === "rejected" && review.rejectionReason && (
                <div className="rounded-md px-4 py-3 mb-3 bg-red-500/[0.06] border-l-[3px] border-l-red-500/40">
                    <p className="text-xs font-medium mb-1 text-red-400">
                        Motivo da rejeicao:
                    </p>
                    <p className="text-sm leading-relaxed text-red-300">
                        {review.rejectionReason}
                    </p>
                </div>
            )}

            {/* Reviewer + listing info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                {reviewer && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                            {(reviewer.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-text-muted">
                            {reviewer.name || "Sem nome"}
                        </span>
                        <span className="text-xs text-text-muted">
                            {reviewer.email}
                        </span>
                        {reviewer.verified && (
                            <span className="text-xs" title="Usuario verificado">✅</span>
                        )}
                    </div>
                )}
                {listing && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-text-muted">sobre</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded border border-primary/15 bg-primary/[0.08] text-primary">
                            {listing.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Reviewed by info */}
            {review.reviewedAt && (
                <p className="text-xs mb-3 text-zinc-700">
                    Revisado em {formatDate(review.reviewedAt)}
                </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
                {review.status === "pending" && (
                    <>
                        <button
                            onClick={() => onApprove(review.id)}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-green-500/30 bg-green-500/15 text-green-400"
                        >
                            {isLoading ? "..." : "Aprovar"}
                        </button>
                        <button
                            onClick={() => onReject(review.id)}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/30 bg-red-500/15 text-red-400"
                        >
                            {isLoading ? "..." : "Rejeitar"}
                        </button>
                    </>
                )}
                {review.status === "rejected" && (
                    <button
                        onClick={() => onApprove(review.id)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-green-500/30 bg-green-500/15 text-green-400"
                    >
                        {isLoading ? "..." : "Aprovar"}
                    </button>
                )}
                {review.status === "approved" && (
                    <button
                        onClick={() => onReject(review.id)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/30 bg-red-500/15 text-red-400"
                    >
                        {isLoading ? "..." : "Rejeitar"}
                    </button>
                )}
                <button
                    onClick={() => onDelete(review.id)}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/25 bg-transparent text-red-400"
                >
                    {isLoading ? "..." : "Deletar"}
                </button>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    // Modal state
    const [rejectTarget, setRejectTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const abortRef = useRef(null);

    // ── Fetch reviews ──────────────────────────────────────────

    const fetchReviews = useCallback(async (currentStatus, currentPage) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        try {
            const params = new URLSearchParams({
                status: currentStatus,
                page: String(currentPage),
                limit: String(PAGE_SIZE),
            });

            const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
                signal: controller.signal,
            });

            if (!res.ok) throw new Error("Fetch failed");

            const json = await res.json();

            if (json.success) {
                setReviews(json.data.reviews || []);
                setStats(json.data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
                const pagination = json.metadata?.pagination || {};
                setTotalPages(pagination.pages || 1);
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("[Reviews] fetch error:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews(statusFilter, page);
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [statusFilter, page, fetchReviews]);

    // ── Actions ────────────────────────────────────────────────

    async function handleApprove(reviewId) {
        setActionLoading(reviewId);
        try {
            const res = await fetch("/api/admin/reviews", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, status: "approved" }),
            });
            const json = await res.json();
            if (json.success) {
                fetchReviews(statusFilter, page);
            }
        } catch (err) {
            console.error("[Approve] error:", err);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleRejectConfirm(reason) {
        if (!rejectTarget) return;
        setActionLoading(rejectTarget);
        try {
            const res = await fetch("/api/admin/reviews", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId: rejectTarget, status: "rejected", reason }),
            });
            const json = await res.json();
            if (json.success) {
                setRejectTarget(null);
                fetchReviews(statusFilter, page);
            }
        } catch (err) {
            console.error("[Reject] error:", err);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setActionLoading(deleteTarget);
        try {
            const res = await fetch(`/api/admin/reviews?id=${deleteTarget}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (json.success) {
                setDeleteTarget(null);
                fetchReviews(statusFilter, page);
            }
        } catch (err) {
            console.error("[Delete] error:", err);
        } finally {
            setActionLoading(null);
        }
    }

    function handleTabChange(key) {
        setStatusFilter(key);
        setPage(1);
    }

    function goPage(p) {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    }

    // ── Render ─────────────────────────────────────────────────

    const isEmpty = !loading && reviews.length === 0;

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Reviews
                    </h1>
                    {!loading && (
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-yellow-500/30 bg-yellow-500/10 text-yellow-400" title="Pendentes">
                                {stats.pending} pendentes
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-green-500/30 bg-green-500/10 text-green-400" title="Aprovados">
                                {stats.approved} aprovados
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-red-500/30 bg-red-500/10 text-red-400" title="Rejeitados">
                                {stats.rejected} rejeitados
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => fetchReviews(statusFilter, page)}
                    disabled={loading}
                    className="btn-secondary self-start sm:self-auto disabled:opacity-50"
                    aria-label="Atualizar lista"
                >
                    {loading ? "Carregando..." : "Atualizar"}
                </button>
            </div>

            {/* ── Status Tabs ─────────────────────────────────── */}
            <div className="flex gap-2 flex-wrap mb-6">
                {STATUS_TABS.map((tab) => (
                    <StatBadge
                        key={tab.key}
                        label={`${tab.emoji} ${tab.label}`}
                        count={tab.key === "all" ? stats.total : stats[tab.key]}
                        active={statusFilter === tab.key}
                        onClick={() => handleTabChange(tab.key)}
                    />
                ))}
            </div>

            {/* ── Review Cards ────────────────────────────────── */}
            <div className="space-y-3 mb-6">
                {loading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {!loading && reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        onApprove={handleApprove}
                        onReject={(id) => setRejectTarget(id)}
                        onDelete={(id) => setDeleteTarget(id)}
                        actionLoading={actionLoading}
                    />
                ))}
            </div>

            {/* ── Empty State ─────────────────────────────────── */}
            {isEmpty && (
                <div className="glass-card py-16 text-center">
                    <div className="text-3xl mb-3">
                        {statusFilter === "pending" ? "⏳" : statusFilter === "approved" ? "✅" : statusFilter === "rejected" ? "❌" : "⭐"}
                    </div>
                    <p className="text-sm font-medium text-text-muted">
                        Nenhum review {statusFilter === "all" ? "encontrado" : STATUS_MAP[statusFilter]?.label.toLowerCase() || "encontrado"}
                    </p>
                    <p className="text-xs mt-1 text-text-muted">
                        {statusFilter === "pending"
                            ? "Nao ha reviews aguardando moderacao"
                            : "Tente trocar o filtro de status"}
                    </p>
                </div>
            )}

            {/* ── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => goPage(page - 1)}
                        disabled={page <= 1}
                        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>

                    <span className="text-sm tabular-nums text-text-muted">
                        Pagina <span className="text-zinc-300">{page}</span> de{" "}
                        <span className="text-zinc-300">{totalPages}</span>
                    </span>

                    <button
                        onClick={() => goPage(page + 1)}
                        disabled={page >= totalPages}
                        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Proxima
                    </button>
                </div>
            )}

            {/* ── Modals ──────────────────────────────────────── */}
            <RejectModal
                isOpen={rejectTarget !== null}
                onClose={() => setRejectTarget(null)}
                onConfirm={handleRejectConfirm}
                loading={actionLoading === rejectTarget}
            />

            <DeleteConfirm
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                loading={actionLoading === deleteTarget}
            />
        </div>
    );
}
