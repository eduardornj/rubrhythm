"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────

const PAGE_SIZE = 50;

const STATUS_TABS = [
    { key: "all", label: "Todos" },
    { key: "funded", label: "Funded" },
    { key: "in_progress", label: "In Progress" },
    { key: "disputed", label: "Disputed" },
    { key: "completed", label: "Completed" },
    { key: "refunded", label: "Refunded" },
];

const STATUS_MAP = {
    funded: { className: "border-sky-400/30 bg-sky-400/10 text-sky-400", label: "Funded" },
    in_progress: { className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400", label: "In Progress" },
    disputed: { className: "border-red-500/30 bg-red-500/10 text-red-400", label: "Disputed" },
    completed: { className: "border-green-500/30 bg-green-500/10 text-green-400", label: "Completed" },
    refunded: { className: "border-zinc-400/30 bg-zinc-400/10 text-zinc-400", label: "Refunded" },
};

const KPI_CONFIG = [
    { key: "funded", emoji: "💰", label: "Funded", textColor: "text-sky-400", bgAlpha: "56,189,248" },
    { key: "in_progress", emoji: "⏳", label: "In Progress", textColor: "text-yellow-400", bgAlpha: "251,191,36" },
    { key: "disputed", emoji: "🚨", label: "Disputed", textColor: "text-red-400", bgAlpha: "239,68,68" },
    { key: "completed", emoji: "✅", label: "Completed", textColor: "text-green-400", bgAlpha: "34,197,94" },
    { key: "refunded", emoji: "↩️", label: "Refunded", textColor: "text-zinc-400", bgAlpha: "161,161,170" },
];

// ── Helpers ──────────────────────────────────────────────────

function formatCurrency(num) {
    if (num == null || isNaN(num)) return "$0.00";
    return `$${Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusStyle(status) {
    return STATUS_MAP[status] || STATUS_MAP.funded;
}

function getRelevantActions(status) {
    switch (status) {
        case "funded":
        case "in_progress":
            return ["complete", "refund"];
        case "disputed":
            return ["resolve", "complete", "refund"];
        default:
            return [];
    }
}

// ── Micro-components ─────────────────────────────────────────

function StatusBadge({ status }) {
    const s = getStatusStyle(status);
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${s.className}`}>
            {s.label}
        </span>
    );
}

function SkeletonKPI() {
    return (
        <div className="glass-card !p-4">
            <div className="h-3 w-20 rounded animate-pulse mb-3 bg-white/[0.06]" />
            <div className="h-6 w-12 rounded animate-pulse mb-1.5 bg-white/[0.08]" />
            <div className="h-3.5 w-24 rounded animate-pulse bg-white/[0.04]" />
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="p-4 border-b border-border/50">
            <div className="flex items-start gap-3">
                <div className="h-9 w-24 rounded animate-pulse bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded animate-pulse bg-white/[0.06]" />
                    <div className="h-3 w-64 rounded animate-pulse bg-white/[0.04]" />
                    <div className="h-3 w-40 rounded animate-pulse bg-white/[0.04]" />
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
    const [reason, setReason] = useState("");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
            <div className="w-full max-w-md rounded-xl p-6 bg-[#0d0d15] border border-border">
                <h3 className="text-lg font-semibold mb-2 text-white">
                    {title}
                </h3>
                <p className="text-sm mb-4 text-text-muted">
                    {message}
                </p>

                <label className="block text-xs font-medium mb-1.5 text-text-muted">
                    Motivo (obrigatorio)
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="input-field w-full resize-none mb-4"
                    placeholder="Descreva o motivo..."
                />

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={loading || !reason.trim()}
                        className="btn-primary disabled:opacity-40"
                    >
                        {loading ? "Processando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminFinanceiroPage() {
    const [escrows, setEscrows] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Action modal
    const [modal, setModal] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Credit adjustment
    const [creditOpen, setCreditOpen] = useState(false);
    const [creditUserId, setCreditUserId] = useState("");
    const [creditAmount, setCreditAmount] = useState("");
    const [creditReason, setCreditReason] = useState("");
    const [creditLoading, setCreditLoading] = useState(false);
    const [creditMessage, setCreditMessage] = useState(null);

    const abortRef = useRef(null);

    // ── Fetch escrows ────────────────────────────────────────

    const fetchData = useCallback(async (currentStatus, currentPage) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        try {
            const params = new URLSearchParams({
                view: "escrows",
                status: currentStatus,
                page: String(currentPage),
                limit: String(PAGE_SIZE),
            });

            const res = await fetch(`/api/admin/financial?${params.toString()}`, {
                signal: controller.signal,
            });

            if (!res.ok) throw new Error("Fetch failed");

            const json = await res.json();

            if (json.success) {
                setEscrows(json.data.escrows || []);
                setSummary(json.data.summary || null);

                const totalCount = currentStatus === "all"
                    ? Object.values(json.data.summary || {}).reduce((sum, s) => sum + (s.count || 0), 0)
                    : (json.data.summary?.[currentStatus]?.count || 0);
                setTotalPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("[Financeiro] fetch error:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(statusFilter, page);
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [statusFilter, page, fetchData]);

    // ── Status filter ────────────────────────────────────────

    function handleStatusChange(status) {
        setStatusFilter(status);
        setPage(1);
    }

    // ── Escrow actions ───────────────────────────────────────

    function openActionModal(escrowId, actionType) {
        const titles = {
            complete: "Forcar Conclusao",
            refund: "Forcar Reembolso",
            resolve: "Resolver Disputa",
        };
        const messages = {
            complete: "Isso vai marcar o escrow como concluido e liberar o pagamento para o provider.",
            refund: "Isso vai reembolsar o valor total para o cliente.",
            resolve: "Isso vai resolver a disputa do escrow. Especifique o resultado no motivo.",
        };

        setModal({ escrowId, actionType, title: titles[actionType], message: messages[actionType] });
    }

    async function handleAction(reason) {
        if (!modal) return;
        setActionLoading(true);

        const actionMap = {
            complete: "force_complete",
            refund: "force_refund",
            resolve: "resolve_dispute",
        };

        try {
            const res = await fetch("/api/admin/financial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: actionMap[modal.actionType],
                    type: "escrow",
                    escrowIds: [modal.escrowId],
                    reason,
                }),
            });

            const json = await res.json();

            if (json.success) {
                setModal(null);
                fetchData(statusFilter, page);
            } else {
                alert(json.error || "Erro ao executar acao");
            }
        } catch (err) {
            console.error("[Action] error:", err);
            alert("Erro de conexao");
        } finally {
            setActionLoading(false);
        }
    }

    // ── Credit adjustment ────────────────────────────────────

    async function handleCreditSubmit(e) {
        e.preventDefault();
        if (!creditUserId.trim() || !creditAmount || !creditReason.trim()) return;

        setCreditLoading(true);
        setCreditMessage(null);

        try {
            const res = await fetch("/api/admin/financial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "adjust_credits",
                    type: "adjust_credits",
                    userId: creditUserId.trim(),
                    amount: Number(creditAmount),
                    reason: creditReason.trim(),
                }),
            });

            const json = await res.json();

            if (json.success) {
                setCreditMessage({ type: "success", text: "Creditos ajustados com sucesso!" });
                setCreditUserId("");
                setCreditAmount("");
                setCreditReason("");
            } else {
                setCreditMessage({ type: "error", text: json.error || "Erro ao ajustar creditos" });
            }
        } catch (err) {
            console.error("[Credits] error:", err);
            setCreditMessage({ type: "error", text: "Erro de conexao" });
        } finally {
            setCreditLoading(false);
        }
    }

    // ── Pagination ───────────────────────────────────────────

    function goPage(p) {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    }

    // ── Computed ─────────────────────────────────────────────

    const isEmpty = !loading && escrows.length === 0;
    const totalEscrows = summary
        ? Object.values(summary).reduce((sum, s) => sum + (s.count || 0), 0)
        : 0;

    // ── Render ───────────────────────────────────────────────

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Financeiro
                    </h1>
                    {!loading && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-primary/25 bg-primary/10 text-primary">
                            {totalEscrows} escrows
                        </span>
                    )}
                </div>
                <button
                    onClick={() => fetchData(statusFilter, page)}
                    disabled={loading}
                    className="btn-secondary self-start sm:self-auto disabled:opacity-50"
                    aria-label="Atualizar lista"
                >
                    {loading ? "⏳" : "🔄"} Atualizar
                </button>
            </div>

            {/* ── KPI Summary ─────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {loading && !summary ? (
                    <>
                        <SkeletonKPI />
                        <SkeletonKPI />
                        <SkeletonKPI />
                        <SkeletonKPI />
                        <SkeletonKPI />
                    </>
                ) : (
                    KPI_CONFIG.map((kpi) => {
                        const data = summary?.[kpi.key] || { count: 0, value: 0 };
                        const isActive = statusFilter === kpi.key;
                        return (
                            <button
                                key={kpi.key}
                                onClick={() => handleStatusChange(kpi.key)}
                                className={`rounded-lg p-4 text-left transition-all duration-150 hover:-translate-y-0.5 border ${
                                    isActive
                                        ? `border-[rgba(${kpi.bgAlpha},0.3)] bg-[rgba(${kpi.bgAlpha},0.08)]`
                                        : "border-border bg-white/[0.02]"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">{kpi.emoji}</span>
                                    <span className="text-xs font-medium text-text-muted">
                                        {kpi.label}
                                    </span>
                                </div>
                                <div className={`text-xl font-bold tabular-nums ${kpi.textColor}`}>
                                    {data.count}
                                </div>
                                <div className="text-xs font-mono tabular-nums mt-0.5 text-text-muted">
                                    {formatCurrency(data.value)}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* ── Status Filter Tabs ──────────────────────────── */}
            <div className="flex gap-2 flex-wrap mb-6">
                {STATUS_TABS.map((tab) => {
                    const isActive = statusFilter === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleStatusChange(tab.key)}
                            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap border ${
                                isActive
                                    ? "border-primary/40 bg-primary/90 text-white"
                                    : "border-border text-text-muted hover:border-primary/20 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Escrow List ─────────────────────────────────── */}
            <div className="glass-card !p-0 overflow-hidden mb-6">
                {/* Loading skeletons */}
                {loading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {/* Escrow cards */}
                {!loading && escrows.map((escrow) => {
                    const actions = getRelevantActions(escrow.status);

                    return (
                        <div
                            key={escrow.id}
                            className="p-4 sm:p-5 transition-colors duration-100 border-b border-border/50 hover:bg-white/[0.02]"
                        >
                            {/* Top row: Amount + Status + Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl sm:text-2xl font-bold tabular-nums text-green-400">
                                        {formatCurrency(escrow.amount)}
                                    </span>
                                    <StatusBadge status={escrow.status} />
                                </div>

                                {/* Action buttons */}
                                {actions.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {actions.includes("complete") && (
                                            <button
                                                onClick={() => openActionModal(escrow.id, "complete")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 border border-green-500/30 bg-green-500/10 text-green-400"
                                            >
                                                ✅ Completar
                                            </button>
                                        )}
                                        {actions.includes("refund") && (
                                            <button
                                                onClick={() => openActionModal(escrow.id, "refund")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/30 bg-red-500/10 text-red-400"
                                            >
                                                ↩️ Reembolsar
                                            </button>
                                        )}
                                        {actions.includes("resolve") && (
                                            <button
                                                onClick={() => openActionModal(escrow.id, "resolve")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 border border-sky-400/30 bg-sky-400/10 text-sky-400"
                                            >
                                                🔧 Resolver Disputa
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {escrow.description && (
                                <p className="text-sm mb-3 text-text-muted">
                                    {escrow.description}
                                </p>
                            )}

                            {/* Client -> Provider */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                {/* Client */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border border-sky-400/25 bg-sky-400/15 text-sky-400">
                                        {(escrow.client?.name || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-medium truncate text-white">
                                            {escrow.client?.name || "Cliente desconhecido"}
                                            {escrow.client?.verified && (
                                                <span className="ml-1 text-[10px]" title="Verificado">✅</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] truncate text-text-muted">
                                            {escrow.client?.email || "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <span className="hidden sm:block text-sm select-none shrink-0 text-text-muted" aria-hidden="true">
                                    →
                                </span>
                                <span className="sm:hidden text-xs select-none text-text-muted" style={{ paddingLeft: "2.25rem" }} aria-hidden="true">
                                    ↓
                                </span>

                                {/* Provider */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                                        {(escrow.provider?.name || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-medium truncate text-white">
                                            {escrow.provider?.name || "Provider desconhecido"}
                                            {escrow.provider?.verified && (
                                                <span className="ml-1 text-[10px]" title="Verificado">✅</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] truncate text-text-muted">
                                            {escrow.provider?.email || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Listing info */}
                            {escrow.listing && (
                                <div className="flex items-center gap-2 mb-3" style={{ paddingLeft: "0.25rem" }}>
                                    <span className="text-xs text-text-muted">📋</span>
                                    <span className="text-xs font-medium truncate text-text-muted">
                                        {escrow.listing.title}
                                    </span>
                                    {(escrow.listing.city || escrow.listing.state) && (
                                        <span className="text-[11px] shrink-0 text-text-muted">
                                            {[escrow.listing.city, escrow.listing.state].filter(Boolean).join(", ")}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] tabular-nums text-text-muted">
                                {escrow.createdAt && (
                                    <span>
                                        <span className="text-text-muted">Criado:</span> {formatDate(escrow.createdAt)}
                                    </span>
                                )}
                                {escrow.fundedAt && (
                                    <span>
                                        <span className="text-sky-400">Funded:</span> {formatDate(escrow.fundedAt)}
                                    </span>
                                )}
                                {escrow.completedAt && (
                                    <span>
                                        <span className="text-green-400">Concluido:</span> {formatDate(escrow.completedAt)}
                                    </span>
                                )}
                                {escrow.disputedAt && (
                                    <span>
                                        <span className="text-red-400">Disputado:</span> {formatDate(escrow.disputedAt)}
                                    </span>
                                )}
                                {escrow.refundedAt && (
                                    <span>
                                        <span className="text-text-muted">Reembolsado:</span> {formatDate(escrow.refundedAt)}
                                    </span>
                                )}
                            </div>

                            {/* Dispute reason */}
                            {escrow.status === "disputed" && escrow.disputeReason && (
                                <div className="mt-3 rounded-lg px-3 py-2.5 text-xs border border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-400">
                                    <span className="font-semibold">Motivo da disputa:</span>{" "}
                                    <span className="text-yellow-200">{escrow.disputeReason}</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Empty state */}
                {isEmpty && (
                    <div className="py-16 text-center">
                        <div className="text-3xl mb-3">💰</div>
                        <p className="text-sm font-medium text-text-muted">
                            Nenhum escrow encontrado
                        </p>
                        {statusFilter !== "all" && (
                            <p className="text-xs mt-1 text-text-muted">
                                Nenhum escrow com status &quot;{statusFilter}&quot;
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => goPage(page - 1)}
                        disabled={page <= 1}
                        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Anterior
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
                        Proxima →
                    </button>
                </div>
            )}

            {/* ── Credit Adjustment ───────────────────────────── */}
            <div className="mb-8">
                <button
                    onClick={() => setCreditOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto glass-card text-text-muted"
                >
                    <span>{creditOpen ? "▾" : "▸"}</span>
                    <span>🪙 Ajustar Creditos de Usuario</span>
                </button>

                {creditOpen && (
                    <div className="mt-3 glass-card">
                        <form onSubmit={handleCreditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* User ID / Email */}
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-text-muted">
                                        User ID ou Email
                                    </label>
                                    <input
                                        type="text"
                                        value={creditUserId}
                                        onChange={(e) => setCreditUserId(e.target.value)}
                                        className="input-field w-full"
                                        placeholder="ID ou email do usuario"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-text-muted">
                                        Quantidade (positivo=add, negativo=deduct)
                                    </label>
                                    <input
                                        type="number"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(e.target.value)}
                                        className="input-field w-full"
                                        placeholder="Ex: 50 ou -20"
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5 text-text-muted">
                                    Motivo
                                </label>
                                <input
                                    type="text"
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Motivo do ajuste..."
                                />
                            </div>

                            {/* Feedback message */}
                            {creditMessage && (
                                <div
                                    className={`rounded-lg px-3 py-2.5 text-xs font-medium border ${
                                        creditMessage.type === "success"
                                            ? "border-green-500/25 bg-green-500/[0.08] text-green-400"
                                            : "border-red-500/25 bg-red-500/[0.08] text-red-400"
                                    }`}
                                >
                                    {creditMessage.text}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={creditLoading || !creditUserId.trim() || !creditAmount || !creditReason.trim()}
                                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {creditLoading ? "⏳ Processando..." : "Ajustar Creditos"}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* ── Action Modal ─────────────────────────────────── */}
            {modal && (
                <ConfirmModal
                    title={modal.title}
                    message={modal.message}
                    onConfirm={handleAction}
                    onCancel={() => setModal(null)}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}
