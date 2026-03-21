"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── Constants ────────────────────────────────────────────────

const TARGET_OPTIONS = [
    { key: "user", label: "Usuario especifico", emoji: "👤" },
    { key: "all_providers", label: "Todas Massagistas", emoji: "💆" },
    { key: "all_clients", label: "Todos Clientes", emoji: "👥" },
    { key: "all_users", label: "Todos Usuarios", emoji: "🌐" },
];

const TYPE_OPTIONS = [
    { key: "info", label: "Info", className: "border-sky-400/30 bg-sky-400/10 text-sky-400" },
    { key: "success", label: "Sucesso", className: "border-green-500/30 bg-green-500/10 text-green-400" },
    { key: "warning", label: "Aviso", className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    { key: "error", label: "Erro", className: "border-red-500/30 bg-red-500/10 text-red-400" },
];

const TYPE_ICONS = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "🚨",
};

const QUICK_TEMPLATES = [
    {
        name: "Bem-vindo",
        emoji: "👋",
        title: "Bem-vindo ao RubRhythm!",
        body: "Estamos felizes em ter voce aqui. Explore os recursos e comece a usar a plataforma agora mesmo.",
        type: "success",
    },
    {
        name: "Verificacao pendente",
        emoji: "🪪",
        title: "Verificacao pendente",
        body: "Sua verificacao de identidade ainda esta pendente. Por favor, envie os documentos necessarios para continuar.",
        type: "warning",
    },
    {
        name: "Anuncio aprovado",
        emoji: "🎉",
        title: "Seu anuncio foi aprovado!",
        body: "Parabens! Seu anuncio foi revisado e aprovado. Ele ja esta visivel para todos os usuarios.",
        type: "success",
    },
    {
        name: "Lembrete de creditos",
        emoji: "🪙",
        title: "Seus creditos estao acabando",
        body: "Voce esta com poucos creditos. Recarregue agora para continuar utilizando todos os recursos da plataforma.",
        type: "warning",
    },
    {
        name: "Manutencao",
        emoji: "🔧",
        title: "Manutencao programada",
        body: "A plataforma passara por manutencao no dia XX/XX das XXh as XXh. Pedimos desculpas pelo inconveniente.",
        type: "info",
    },
];

const TARGET_LABELS = {
    user: "Usuario especifico",
    all_providers: "Todas Massagistas",
    all_clients: "Todos Clientes",
    all_users: "Todos Usuarios",
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

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "..." : str;
}

// ── Micro-components ─────────────────────────────────────────

function TypeBadge({ type }) {
    const opt = TYPE_OPTIONS.find((t) => t.key === type) || TYPE_OPTIONS[0];
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${opt.className}`}>
            {opt.label}
        </span>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
            <div className="h-4 w-32 rounded animate-pulse bg-white/[0.06]" />
            <div className="h-4 w-48 rounded animate-pulse flex-1 bg-white/[0.04]" />
            <div className="h-4 w-20 rounded animate-pulse bg-white/[0.04]" />
            <div className="h-4 w-16 rounded animate-pulse bg-white/[0.06]" />
        </div>
    );
}

function FeedbackMessage({ message, type, onDismiss }) {
    if (!message) return null;
    const isError = type === "error";
    return (
        <div
            className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium border ${
                isError
                    ? "border-red-500/25 bg-red-500/10 text-red-300"
                    : "border-green-500/25 bg-green-500/10 text-green-300"
            }`}
        >
            <span>{message}</span>
            <button
                onClick={onDismiss}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity duration-150"
                aria-label="Fechar mensagem"
            >
                ✕
            </button>
        </div>
    );
}

function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
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
                className="w-full max-w-sm rounded-xl p-6 bg-[#111118] border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-base font-semibold mb-2 text-white">{title}</h3>
                <p className="text-sm mb-5 text-text-muted">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="btn-secondary">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 bg-red-600"
                    >
                        {loading ? "Excluindo..." : "Excluir"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Notification Preview ─────────────────────────────────────

function NotificationPreview({ title, body, type }) {
    const opt = TYPE_OPTIONS.find((t) => t.key === type) || TYPE_OPTIONS[0];
    const hasContent = title || body;

    return (
        <div className={`glass-card !p-0 overflow-hidden ${hasContent ? `!border-${type === "info" ? "sky-400" : type === "success" ? "green-500" : type === "warning" ? "yellow-500" : "red-500"}/30` : ""}`}>
            <div className={`px-4 py-2 flex items-center gap-2 border-b border-border/50 ${hasContent ? `bg-${type === "info" ? "sky-400" : type === "success" ? "green-500" : type === "warning" ? "yellow-500" : "red-500"}/10` : "bg-white/[0.02]"}`}>
                <span className="text-sm">{TYPE_ICONS[type] || "ℹ️"}</span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                    type === "info" ? "text-sky-400" : type === "success" ? "text-green-400" : type === "warning" ? "text-yellow-400" : "text-red-400"
                }`}>
                    Preview
                </span>
            </div>
            <div className="px-4 py-3">
                {hasContent ? (
                    <>
                        <p className="text-sm font-semibold mb-1 text-white">
                            {title || "Sem titulo"}
                        </p>
                        <p className="text-xs leading-relaxed text-text-muted">
                            {body || "Sem mensagem"}
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-center py-2 text-text-muted">
                        Preencha o titulo e mensagem para ver o preview
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminComunicacaoPage() {
    // Form state
    const [target, setTarget] = useState("all_users");
    const [userId, setUserId] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [type, setType] = useState("info");
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const abortRef = useRef(null);

    // ── Fetch history ────────────────────────────────────────

    const fetchHistory = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setHistoryLoading(true);

        try {
            const res = await fetch("/api/admin/notifications/history", {
                signal: controller.signal,
            });
            if (!res.ok) throw new Error("Fetch failed");
            const json = await res.json();
            setHistory(Array.isArray(json) ? json : json.data || []);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("[Comunicacao] history fetch error:", err);
            }
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [fetchHistory]);

    // ── Send notification ────────────────────────────────────

    async function handleSend(e) {
        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            setFeedback({ message: "Preencha titulo e mensagem.", type: "error" });
            return;
        }

        if (target === "user" && !userId.trim()) {
            setFeedback({ message: "Informe o ID do usuario.", type: "error" });
            return;
        }

        setSending(true);
        setFeedback(null);

        try {
            const payload = { target, title: title.trim(), body: body.trim(), type };
            if (target === "user") payload.userId = userId.trim();

            const res = await fetch("/api/admin/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.success) {
                setFeedback({
                    message: json.message || `Notificacao enviada para ${json.sent || 0} usuario(s).`,
                    type: "success",
                });
                setTitle("");
                setBody("");
                setUserId("");
                fetchHistory();
            } else {
                setFeedback({
                    message: json.error || json.message || "Erro ao enviar notificacao.",
                    type: "error",
                });
            }
        } catch (err) {
            console.error("[Comunicacao] send error:", err);
            setFeedback({ message: "Erro de rede. Tente novamente.", type: "error" });
        } finally {
            setSending(false);
        }
    }

    // ── Delete broadcast ─────────────────────────────────────

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleteLoading(true);

        try {
            const res = await fetch("/api/admin/notifications/delete-broadcast", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ broadcastId: deleteTarget }),
            });

            const json = await res.json();

            if (json.success) {
                setHistory((prev) => prev.filter((h) => h.id !== deleteTarget));
                setFeedback({ message: "Broadcast excluido.", type: "success" });
            } else {
                setFeedback({ message: json.error || "Erro ao excluir.", type: "error" });
            }
        } catch (err) {
            console.error("[Comunicacao] delete error:", err);
            setFeedback({ message: "Erro de rede.", type: "error" });
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    }

    // ── Apply template ───────────────────────────────────────

    function applyTemplate(tpl) {
        setTitle(tpl.title);
        setBody(tpl.body);
        setType(tpl.type);
    }

    // ── Render ───────────────────────────────────────────────

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">

            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Comunicacao
                </h1>
            </div>

            {/* ── Feedback ────────────────────────────────────── */}
            {feedback && (
                <div className="mb-6">
                    <FeedbackMessage
                        message={feedback.message}
                        type={feedback.type}
                        onDismiss={() => setFeedback(null)}
                    />
                </div>
            )}

            {/* ── Send Form + Preview ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

                {/* Form (3 cols) */}
                <form
                    onSubmit={handleSend}
                    className="lg:col-span-3 glass-card space-y-5"
                >
                    <h2 className="text-base font-semibold text-white">
                        Enviar Notificacao
                    </h2>

                    {/* Target selector */}
                    <div>
                        <label className="block text-xs font-medium mb-2 text-text-muted">
                            Destinatario
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TARGET_OPTIONS.map((opt) => {
                                const isActive = target === opt.key;
                                return (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setTarget(opt.key)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border ${
                                            isActive
                                                ? "border-primary/35 bg-primary/10 text-primary"
                                                : "border-border text-text-muted hover:border-primary/20 hover:text-white"
                                        }`}
                                    >
                                        <span className="mr-1.5">{opt.emoji}</span>
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* User ID (conditional) */}
                    {target === "user" && (
                        <div>
                            <label htmlFor="notif-user-id" className="block text-xs font-medium mb-2 text-text-muted">
                                ID do Usuario
                            </label>
                            <input
                                id="notif-user-id"
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="ID ou email do usuario"
                                className="input-field w-full"
                            />
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="notif-title" className="block text-xs font-medium mb-2 text-text-muted">
                            Titulo
                        </label>
                        <input
                            id="notif-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titulo da notificacao"
                            maxLength={120}
                            className="input-field w-full"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label htmlFor="notif-body" className="block text-xs font-medium mb-2 text-text-muted">
                            Mensagem
                        </label>
                        <textarea
                            id="notif-body"
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Corpo da notificacao..."
                            maxLength={500}
                            className="input-field w-full resize-none"
                        />
                        <div className="text-right mt-1">
                            <span className="text-[11px] tabular-nums text-text-muted">
                                {body.length}/500
                            </span>
                        </div>
                    </div>

                    {/* Type selector */}
                    <div>
                        <label className="block text-xs font-medium mb-2 text-text-muted">
                            Tipo
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TYPE_OPTIONS.map((opt) => {
                                const isActive = type === opt.key;
                                return (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setType(opt.key)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border ${
                                            isActive
                                                ? opt.className
                                                : "border-border text-text-muted hover:border-primary/20 hover:text-white"
                                        }`}
                                    >
                                        <span className="mr-1.5">{TYPE_ICONS[opt.key]}</span>
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Send button */}
                    <button
                        type="submit"
                        disabled={sending || !title.trim() || !body.trim()}
                        className="btn-primary w-full sm:w-auto disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </span>
                        ) : (
                            "Enviar Notificacao"
                        )}
                    </button>
                </form>

                {/* Preview + Templates (2 cols) */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Live Preview */}
                    <div>
                        <h3 className="text-xs font-medium mb-3 uppercase tracking-wider text-text-muted">
                            Preview
                        </h3>
                        <NotificationPreview title={title} body={body} type={type} />
                    </div>

                    {/* Quick Templates */}
                    <div>
                        <h3 className="text-xs font-medium mb-3 uppercase tracking-wider text-text-muted">
                            Templates Rapidos
                        </h3>
                        <div className="space-y-2">
                            {QUICK_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.name}
                                    type="button"
                                    onClick={() => applyTemplate(tpl)}
                                    className="w-full text-left glass-card transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 group"
                                >
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm">{tpl.emoji}</span>
                                        <span className="text-xs font-semibold group-hover:text-white transition-colors duration-150 text-zinc-300">
                                            {tpl.name}
                                        </span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed pl-6 text-text-muted">
                                        {truncate(tpl.body, 70)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Broadcast History ────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">
                        Historico de Broadcasts
                    </h2>
                    <button
                        onClick={fetchHistory}
                        disabled={historyLoading}
                        className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-50"
                        aria-label="Atualizar historico"
                    >
                        Atualizar
                    </button>
                </div>

                <div className="glass-card !p-0 overflow-hidden">
                    {/* Table header (desktop) */}
                    <div className="hidden sm:grid grid-cols-[1fr_2fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 text-xs font-medium text-text-muted border-b border-border">
                        <span>Titulo</span>
                        <span>Mensagem</span>
                        <span>Destinatario</span>
                        <span>Enviados</span>
                        <span>Data</span>
                        <span />
                    </div>

                    {/* Loading */}
                    {historyLoading && (
                        <div>
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </div>
                    )}

                    {/* Empty */}
                    {!historyLoading && history.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="text-3xl mb-2">📭</div>
                            <p className="text-sm text-text-muted">
                                Nenhum broadcast enviado ainda.
                            </p>
                        </div>
                    )}

                    {/* Rows */}
                    {!historyLoading && history.length > 0 && history.map((item) => (
                        <div
                            key={item.id}
                            className="group border-b border-border/50"
                        >
                            {/* Desktop row */}
                            <div className="hidden sm:grid grid-cols-[1fr_2fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 transition-colors duration-150 hover:bg-white/[0.02]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <TypeBadge type={item.type} />
                                    <span className="text-sm font-medium truncate text-zinc-300">
                                        {item.title}
                                    </span>
                                </div>
                                <span className="text-xs truncate text-text-muted">
                                    {truncate(item.body, 80)}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap border border-border bg-white/[0.04] text-text-muted">
                                    {TARGET_LABELS[item.target] || item.target}
                                </span>
                                <span className="text-xs tabular-nums font-medium text-zinc-300">
                                    {item.sent ?? "--"}
                                </span>
                                <span className="text-xs tabular-nums whitespace-nowrap text-text-muted">
                                    {formatDate(item.createdAt || item.sentAt)}
                                </span>
                                <button
                                    onClick={() => setDeleteTarget(item.id)}
                                    className="px-2 py-1 rounded text-xs font-medium transition-all duration-150 opacity-0 group-hover:opacity-100 text-red-400"
                                    aria-label={`Excluir broadcast "${item.title}"`}
                                >
                                    Excluir
                                </button>
                            </div>

                            {/* Mobile card */}
                            <div className="sm:hidden px-4 py-3.5 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <TypeBadge type={item.type} />
                                        <span className="text-sm font-medium truncate text-zinc-300">
                                            {item.title}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setDeleteTarget(item.id)}
                                        className="shrink-0 px-2 py-1 rounded text-xs font-medium text-red-400"
                                        aria-label={`Excluir broadcast "${item.title}"`}
                                    >
                                        Excluir
                                    </button>
                                </div>
                                <p className="text-xs leading-relaxed text-text-muted">
                                    {truncate(item.body, 100)}
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium border border-border bg-white/[0.04] text-text-muted">
                                        {TARGET_LABELS[item.target] || item.target}
                                    </span>
                                    <span className="text-[11px] tabular-nums text-text-muted">
                                        {item.sent ?? "--"} enviados
                                    </span>
                                    <span className="text-[11px] tabular-nums text-text-muted">
                                        {formatDate(item.createdAt || item.sentAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Delete Confirm Modal ─────────────────────────── */}
            {deleteTarget && (
                <ConfirmModal
                    title="Excluir broadcast"
                    message="Tem certeza? Esta acao nao pode ser desfeita."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
}
