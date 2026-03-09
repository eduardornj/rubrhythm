"use client";
import { useState, useEffect, useCallback } from "react";

const QUICK_TEMPLATES = [
    {
        label: "✅ Anúncio Aprovado",
        title: "Seu anúncio foi aprovado!",
        body: "Ótimas notícias! Seu anúncio foi aprovado e já está visível no diretório RubRhythm. Clientes já podem te encontrar.",
        type: "success",
    },
    {
        label: "❌ Anúncio Rejeitado",
        title: "Seu anúncio precisa de ajustes",
        body: "Seu anúncio foi rejeitado pela nossa equipe de moderação. Por favor, revise as regras da plataforma e reenvie com as correções necessárias.",
        type: "warning",
    },
    {
        label: "🔵 Verificação Aprovada",
        title: "Parabéns! Você foi verificado",
        body: "Seu perfil agora possui o badge de Verificado. Isso aumenta sua credibilidade e visibilidade no diretório.",
        type: "success",
    },
    {
        label: "⚠️ Aviso de Política",
        title: "Aviso importante da plataforma",
        body: "Detectamos uma violação das nossas políticas de uso. Por favor, revise os Termos de Serviço para evitar suspensão da conta.",
        type: "warning",
    },
    {
        label: "🎉 Bem-vindo",
        title: "Bem-vindo ao RubRhythm!",
        body: "Sua conta foi criada com sucesso. Complete seu perfil e crie seu primeiro anúncio para começar a receber clientes.",
        type: "info",
    },
];

const TYPE_STYLES = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
};

const TYPE_ICONS = { info: "ℹ️", success: "✅", warning: "⚠️", error: "🚨" };
const TARGET_LABELS = {
    user: "Usuário específico",
    all_providers: "Todos os Providers",
    all_clients: "Todos os Clientes",
    all_users: "Todos os Usuários",
};

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Agora mesmo";
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ComunicacaoPage() {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Form state
    const [target, setTarget] = useState("all_providers");
    const [userId, setUserId] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [type, setType] = useState("info");
    const [sending, setSending] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = (msg, t = "success") => {
        setToast({ msg, t });
        setTimeout(() => setToast(null), 4000);
    };

    // Persistent history from DB
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [deletingIdx, setDeletingIdx] = useState(null);

    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        const res = await fetch("/api/admin/users");
        const d = await res.json();
        setUsers((d.data || []).filter((u) => u.role !== "admin"));
        setLoadingUsers(false);
    }, []);

    const loadHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch("/api/admin/notifications/history?limit=30");
            const d = await res.json();
            setHistory(d.history || []);
        } catch { }
        setLoadingHistory(false);
    }, []);

    const deleteBroadcast = async (entry, idx) => {
        if (!confirm(`Excluir "${entry.title}" de ${entry.recipientCount} usuário(s)?`)) return;
        setDeletingIdx(idx);
        try {
            const res = await fetch("/api/admin/notifications/delete-broadcast", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: entry.title, body: entry.body, type: entry.type }),
            });
            const d = await res.json();
            if (res.ok) {
                showToast(d.message || "Excluído!");
                loadHistory();
            } else {
                showToast(d.error || "Erro ao excluir.", "error");
            }
        } catch {
            showToast("Erro de rede.", "error");
        }
        setDeletingIdx(null);
    };

    useEffect(() => { loadUsers(); loadHistory(); }, [loadUsers, loadHistory]);

    const applyTemplate = (tpl) => {
        setTitle(tpl.title);
        setBody(tpl.body);
        setType(tpl.type);
    };

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            showToast("Preencha o título e a mensagem.", "error");
            return;
        }
        if (target === "user" && !userId) {
            showToast("Selecione um usuário.", "error");
            return;
        }

        setSending(true);
        try {
            const res = await fetch("/api/admin/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target, userId: target === "user" ? userId : undefined, title, body, type }),
            });
            const d = await res.json();
            if (res.ok) {
                showToast(d.message || "Notificação enviada!");
                // Reset form
                setTitle("");
                setBody("");
                setType("info");
                setUserId("");
                // Reload history from DB
                loadHistory();
            } else {
                showToast(d.error || "Erro ao enviar.", "error");
            }
        } catch {
            showToast("Erro de rede.", "error");
        }
        setSending(false);
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-[999] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border transition-all ${toast.t === "success"
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-red-500/20 border-red-500/30 text-red-400"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-xl font-black text-white">📣 Central de Comunicação</h1>
                <p className="text-white/40 text-sm mt-0.5">
                    Envie notificações in-app para providers, clientes ou usuários específicos.
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* ── Form ── */}
                <div className="col-span-7 space-y-4">
                    {/* Quick Templates */}
                    <div className="bg-white/2 border border-white/6 rounded-2xl p-4">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                            Templates Rápidos
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.label}
                                    onClick={() => applyTemplate(tpl)}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/3 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/6 transition-all"
                                >
                                    {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compose Form */}
                    <div className="bg-white/2 border border-white/6 rounded-2xl p-5 space-y-4">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                            Compor Mensagem
                        </p>

                        {/* Target */}
                        <div>
                            <label className="text-xs text-white/40 mb-1.5 block">Destinatário</label>
                            <select
                                id="notif-target"
                                name="target"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full bg-[#0d0d15] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
                            >
                                <option value="all_providers">🧖 Todos os Providers (massagistas)</option>
                                <option value="all_clients">🧑 Todos os Clientes</option>
                                <option value="all_users">👥 Todos os Usuários</option>
                                <option value="user">🎯 Usuário Específico</option>
                            </select>
                        </div>

                        {/* Specific user selector */}
                        {target === "user" && (
                            <div>
                                <label className="text-xs text-white/40 mb-1.5 block">Selecionar Usuário</label>
                                <select
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="w-full bg-[#0d0d15] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="">— Selecione um usuário —</option>
                                    {loadingUsers ? (
                                        <option disabled>Carregando...</option>
                                    ) : (
                                        users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name || u.email} ({u.role === "provider" ? "Massagista" : "Cliente"})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Type */}
                        <div>
                            <label className="text-xs text-white/40 mb-1.5 block">Tipo</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(TYPE_ICONS).map(([t, icon]) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${type === t ? TYPE_STYLES[t] : "border-white/8 text-white/30 hover:bg-white/5"
                                            }`}
                                    >
                                        {icon} {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-xs text-white/40 mb-1.5 block">Título</label>
                            <input
                                id="notif-title"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                placeholder="Ex: Seu anúncio foi aprovado!"
                                className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="text-xs text-white/40 mb-1.5 block">Mensagem</label>
                            <textarea
                                id="notif-body"
                                name="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Escreva a mensagem que os usuários vão receber..."
                                className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 resize-none"
                            />
                            <p className="text-right text-xs text-white/20 mt-1">{body.length}/500</p>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={sending || !title.trim() || !body.trim()}
                            className="w-full py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {sending ? "Enviando..." : "📤 Enviar Notificação"}
                        </button>
                    </div>
                </div>

                {/* ── Preview + History ── */}
                <div className="col-span-5 space-y-4">
                    {/* Preview */}
                    <div className="bg-white/2 border border-white/6 rounded-2xl p-4">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                            Preview
                        </p>
                        {title || body ? (
                            <div className={`p-4 rounded-xl border ${TYPE_STYLES[type]} space-y-1`}>
                                <div className="flex items-center gap-2">
                                    <span>{TYPE_ICONS[type]}</span>
                                    <p className="text-white font-bold text-sm">{title || "Título da notificação"}</p>
                                </div>
                                <p className="text-sm text-white/70 pl-6 leading-snug">
                                    {body || "Sua mensagem aparece aqui..."}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-24 text-white/20 text-sm text-center">
                                Preencha o formulário para ver o preview
                            </div>
                        )}
                    </div>

                    {/* Sent History — persistent from DB */}
                    <div className="bg-white/2 border border-white/6 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                                Histórico de Envios
                            </p>
                            <button
                                onClick={loadHistory}
                                className="text-white/20 hover:text-white/50 transition-colors text-xs"
                                title="Atualizar"
                            >
                                ↻
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-14 rounded-xl bg-white/3 animate-pulse" />
                                ))}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center text-white/20 text-sm py-6">
                                Nenhuma notificação enviada ainda.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                {history.map((s, i) => (
                                    <div key={i} className="p-3 bg-white/3 border border-white/6 rounded-xl hover:bg-white/4 transition-colors group">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-semibold truncate">
                                                    {TYPE_ICONS[s.type] || "🔔"} {s.title}
                                                </p>
                                                <p className="text-white/40 text-[10px] mt-0.5 line-clamp-2 leading-relaxed">{s.body}</p>
                                            </div>
                                            <div className="flex items-start gap-2 flex-shrink-0">
                                                <div className="text-right space-y-0.5">
                                                    <p className="text-green-400 text-[10px] font-bold whitespace-nowrap">
                                                        ✓ {s.recipientCount} {s.recipientCount === 1 ? "usuário" : "usuários"}
                                                    </p>
                                                    <p className="text-white/20 text-[10px] whitespace-nowrap">
                                                        {formatDate(s.sentAt)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteBroadcast(s, i)}
                                                    disabled={deletingIdx === i}
                                                    title="Excluir este envio"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/15 disabled:opacity-30"
                                                >
                                                    {deletingIdx === i ? (
                                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
