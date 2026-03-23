"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Constants ────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_TABS = [
    { key: "pending", label: "Pendentes" },
    { key: "approved", label: "Aprovadas" },
    { key: "rejected", label: "Rejeitadas" },
];

const STATUS_MAP = {
    pending: { className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400", label: "Pendente" },
    approved: { className: "border-green-500/30 bg-green-500/10 text-green-400", label: "Aprovado" },
    rejected: { className: "border-red-500/30 bg-red-500/10 text-red-400", label: "Rejeitado" },
    needs_review: { className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400", label: "Em revisao" },
};

// ── Helpers ──────────────────────────────────────────────────

function timeAgo(dateStr) {
    if (!dateStr) return "--";
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atras`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atras`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d atras`;
    return new Date(dateStr).toLocaleDateString("pt-BR");
}

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

// ── Micro-components ─────────────────────────────────────────

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] || STATUS_MAP.pending;
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${s.className}`}>
            {s.label}
        </span>
    );
}

function LegacyBadge() {
    return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap border border-orange-400/30 bg-orange-400/10 text-orange-400">
            Arquivo legacy
        </span>
    );
}

function StatCard({ label, value, colorKey }) {
    const colorMap = {
        yellow: "border-yellow-500/20 bg-yellow-500/[0.08] text-yellow-400",
        green: "border-green-500/20 bg-green-500/[0.08] text-green-400",
        red: "border-red-500/20 bg-red-500/[0.08] text-red-400",
        gray: "border-border bg-white/[0.03] text-text-muted",
    };
    const cls = colorMap[colorKey] || colorMap.gray;

    return (
        <div className={`rounded-lg p-4 transition-all duration-200 border ${cls}`}>
            <div className="text-xs mb-1 text-text-muted">{label}</div>
            <div className="text-2xl font-bold tabular-nums">{value}</div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="glass-card !p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full animate-pulse bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 rounded animate-pulse bg-white/[0.06]" />
                    <div className="h-3 w-48 rounded animate-pulse bg-white/[0.04]" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-48 rounded-lg animate-pulse bg-white/[0.04]" />
                <div className="h-48 rounded-lg animate-pulse bg-white/[0.04]" />
            </div>
            <div className="flex gap-2">
                <div className="h-9 w-24 rounded-lg animate-pulse bg-white/[0.04]" />
                <div className="h-9 w-24 rounded-lg animate-pulse bg-white/[0.04]" />
            </div>
        </div>
    );
}

function ImageModal({ src, alt, onClose }) {
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Imagem ampliada"}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-opacity duration-150 hover:opacity-80 bg-white/10 text-white"
                aria-label="Fechar"
            >
                X
            </button>
            <Image
                src={src}
                alt={alt || "Documento"}
                width={800}
                height={600}
                unoptimized
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

function PromptModal({ title, placeholder, onConfirm, onCancel }) {
    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onCancel();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="w-full max-w-md rounded-xl p-6 bg-[#111118] border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
                <textarea
                    ref={inputRef}
                    rows={3}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input-field w-full resize-none"
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { if (value.trim()) onConfirm(value.trim()); }}
                        disabled={!value.trim()}
                        className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Verification Card ────────────────────────────────────────

function VerificationCard({ verification, onAction, actionLoading }) {
    const [modalImage, setModalImage] = useState(null);
    const [prompt, setPrompt] = useState(null);

    const idDoc = verification.documents?.find((d) => d.type === "id");
    const selfieDoc = verification.documents?.find((d) => d.type === "selfie");
    const isPending = verification.status === "pending";
    const isApproved = verification.status === "approved";
    const isRejected = verification.status === "rejected";

    function handleApprove() {
        onAction(verification.id, "approve");
    }

    function handleReject() {
        setPrompt({
            title: "Motivo da rejeicao",
            placeholder: "Descreva o motivo da rejeicao...",
            action: "reject",
        });
    }

    function handleRequestReview() {
        setPrompt({
            title: "Mensagem de revisao",
            placeholder: "Descreva o que precisa ser corrigido...",
            action: "review",
        });
    }

    function handlePromptConfirm(text) {
        if (prompt.action === "reject") {
            onAction(verification.id, "reject", text);
        } else {
            onAction(verification.id, "review", text);
        }
        setPrompt(null);
    }

    const isThisLoading = actionLoading === verification.id;

    return (
        <>
            <div className="glass-card !p-0 overflow-hidden">
                {/* User Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                            {(verification.userName || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate text-white">
                                {verification.userName}
                            </div>
                            <div className="text-xs truncate text-text-muted">
                                {verification.userEmail}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-xs text-text-muted">
                            {formatDate(verification.submittedAt)}
                        </span>
                        <StatusBadge status={verification.status} />
                    </div>
                </div>

                {/* Document Images */}
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* ID Document */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-zinc-300">
                                    Documento de Identidade
                                </span>
                                {idDoc?.isLegacy && <LegacyBadge />}
                            </div>
                            {idDoc?.url ? (
                                <button
                                    onClick={() => setModalImage({ src: idDoc.url, alt: "Documento de Identidade" })}
                                    className="w-full rounded-lg overflow-hidden transition-opacity duration-150 hover:opacity-80 cursor-zoom-in border border-border"
                                    aria-label="Ampliar documento de identidade"
                                >
                                    <Image
                                        src={idDoc.url}
                                        alt="Documento de Identidade"
                                        width={600}
                                        height={400}
                                        unoptimized
                                        className="w-full max-h-64 object-contain rounded-lg bg-black/30"
                                    />
                                </button>
                            ) : (
                                <div className="w-full h-48 rounded-lg flex items-center justify-center glass-card">
                                    <span className="text-xs text-text-muted">Sem documento</span>
                                </div>
                            )}
                        </div>

                        {/* Selfie */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-zinc-300">
                                    Selfie com Documento
                                </span>
                                {selfieDoc?.isLegacy && <LegacyBadge />}
                            </div>
                            {selfieDoc?.url ? (
                                <button
                                    onClick={() => setModalImage({ src: selfieDoc.url, alt: "Selfie com Documento" })}
                                    className="w-full rounded-lg overflow-hidden transition-opacity duration-150 hover:opacity-80 cursor-zoom-in border border-border"
                                    aria-label="Ampliar selfie com documento"
                                >
                                    <Image
                                        src={selfieDoc.url}
                                        alt="Selfie com Documento"
                                        width={600}
                                        height={400}
                                        unoptimized
                                        className="w-full max-h-64 object-contain rounded-lg bg-black/30"
                                    />
                                </button>
                            ) : (
                                <div className="w-full h-48 rounded-lg flex items-center justify-center glass-card">
                                    <span className="text-xs text-text-muted">Sem selfie</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rejection Reason (for rejected items) */}
                    {isRejected && verification.notes && (
                        <div className="rounded-lg px-4 py-3 mb-4 bg-red-500/[0.06] border border-red-500/15">
                            <span className="text-xs font-semibold text-red-400">Motivo: </span>
                            <span className="text-xs text-red-300">{verification.notes}</span>
                        </div>
                    )}

                    {/* Action Buttons (only for pending) */}
                    {isPending && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleApprove}
                                disabled={isThisLoading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 bg-green-600"
                            >
                                {isThisLoading ? "..." : "Aprovar"}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isThisLoading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 bg-red-600"
                            >
                                Rejeitar
                            </button>
                            <button
                                onClick={handleRequestReview}
                                disabled={isThisLoading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 border border-yellow-500/30 bg-yellow-500/15 text-yellow-400"
                            >
                                Pedir revisao
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {modalImage && (
                <ImageModal
                    src={modalImage.src}
                    alt={modalImage.alt}
                    onClose={() => setModalImage(null)}
                />
            )}

            {/* Prompt Modal */}
            {prompt && (
                <PromptModal
                    title={prompt.title}
                    placeholder={prompt.placeholder}
                    onConfirm={handlePromptConfirm}
                    onCancel={() => setPrompt(null)}
                />
            )}
        </>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminVerificacaoPage() {
    const [verifications, setVerifications] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const abortRef = useRef(null);

    // ── Fetch verifications ──────────────────────────────────

    const fetchVerifications = useCallback(async (status, currentPage) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        try {
            const params = new URLSearchParams({
                status,
                page: String(currentPage),
                limit: String(PAGE_SIZE),
            });

            const res = await fetch(`/api/admin/verifications?${params.toString()}`, {
                signal: controller.signal,
            });

            if (!res.ok) throw new Error("Fetch failed");

            const json = await res.json();

            if (json.success) {
                setVerifications(json.data?.verifications || []);
                setStats(json.data?.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
                const pagination = json.metadata?.pagination || {};
                setTotalPages(pagination.pages || 1);
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("[Verificacao] fetch error:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Effects ──────────────────────────────────────────────

    useEffect(() => {
        fetchVerifications(activeTab, page);
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [activeTab, page, fetchVerifications]);

    // ── Actions ──────────────────────────────────────────────

    async function handleAction(verificationId, action, text) {
        setActionLoading(verificationId);

        try {
            let res;

            if (action === "approve" || action === "reject") {
                const body = { verificationId, action };
                if (action === "reject") body.rejectionReason = text;

                res = await fetch("/api/admin/verifications", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            } else if (action === "review") {
                res = await fetch("/api/admin/verifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ verificationId, message: text }),
                });
            }

            const json = await res.json();

            if (json.success) {
                // Refetch to get updated data and stats
                fetchVerifications(activeTab, page);
            }
        } catch (err) {
            console.error("[Verificacao] action error:", err);
        } finally {
            setActionLoading(null);
        }
    }

    // ── Tab change ───────────────────────────────────────────

    function handleTabChange(tab) {
        setActiveTab(tab);
        setPage(1);
    }

    // ── Pagination ───────────────────────────────────────────

    function goPage(p) {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    }

    // ── Render ───────────────────────────────────────────────

    const isEmpty = !loading && verifications.length === 0;

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">

            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Verificacoes
                    </h1>
                    {stats.pending > 0 && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                            {stats.pending} pendente{stats.pending !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => fetchVerifications(activeTab, page)}
                    disabled={loading}
                    className="btn-secondary self-start sm:self-auto disabled:opacity-50"
                    aria-label="Atualizar lista"
                >
                    Atualizar
                </button>
            </div>

            {/* ── Stats Row ───────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Pendentes" value={stats.pending} colorKey="yellow" />
                <StatCard label="Aprovadas" value={stats.approved} colorKey="green" />
                <StatCard label="Rejeitadas" value={stats.rejected} colorKey="red" />
                <StatCard label="Total" value={stats.total} colorKey="gray" />
            </div>

            {/* ── Status Filter Tabs ──────────────────────────── */}
            <div className="flex gap-1 mb-6 overflow-x-auto" role="tablist" aria-label="Filtrar por status">
                {STATUS_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap relative ${
                                isActive ? "text-white" : "text-text-muted"
                            }`}
                        >
                            {tab.label}
                            {isActive && (
                                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Loading Skeletons ───────────────────────────── */}
            {loading && (
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {/* ── Verification Cards ─────────────────────────── */}
            {!loading && verifications.length > 0 && (
                <div className="space-y-4">
                    {verifications.map((v) => (
                        <VerificationCard
                            key={v.id}
                            verification={v}
                            onAction={handleAction}
                            actionLoading={actionLoading}
                        />
                    ))}
                </div>
            )}

            {/* ── Empty State ─────────────────────────────────── */}
            {isEmpty && (
                <div className="glass-card py-16 text-center">
                    <div className="text-4xl mb-3">
                        {activeTab === "pending" ? "🪪" : activeTab === "approved" ? "✅" : "❌"}
                    </div>
                    <p className="text-sm font-medium text-text-muted">
                        {activeTab === "pending"
                            ? "Nenhuma verificacao pendente"
                            : activeTab === "approved"
                            ? "Nenhuma verificacao aprovada"
                            : "Nenhuma verificacao rejeitada"}
                    </p>
                </div>
            )}

            {/* ── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-between gap-4 mt-8 mb-8">
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
        </div>
    );
}
