"use client";
import { useState, useEffect } from "react";

export default function ChatsPage() {
    const [convs, setConvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [deletingMsgId, setDeletingMsgId] = useState(null);
    const [deletingConv, setDeletingConv] = useState(false);

    const showToast = (msg, t = "success") => {
        setToast({ msg, t });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        fetch("/api/messages/conversations")
            .then(r => r.json())
            .then(d => { setConvs(d.conversations || d || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const openConv = async (conv) => {
        setSelected(conv);
        setMsgLoading(true);
        try {
            const id = conv.id || conv.conversationId;
            const res = await fetch(`/api/messages/${id}`);
            const d = await res.json();
            setMessages(d.messages || d || []);
        } catch { setMessages([]); }
        setMsgLoading(false);
    };

    const deleteMessage = async (messageId) => {
        setDeletingMsgId(messageId);
        try {
            const res = await fetch("/api/admin/chats", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete_message", messageId }),
            });
            if (!res.ok) throw new Error();
            setMessages(prev => prev.filter(m => (m.id || m._id) !== messageId));
            showToast("Mensagem excluída com sucesso");
        } catch {
            showToast("Erro ao excluir mensagem", "error");
        }
        setDeletingMsgId(null);
    };

    const deleteConversation = async () => {
        if (!selected) return;
        if (!confirm("Tem certeza que deseja excluir toda esta conversa? Esta ação é irreversível.")) return;
        const convId = selected.id || selected.conversationId;
        setDeletingConv(true);
        try {
            const res = await fetch("/api/admin/chats", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete_conversation", conversationId: convId }),
            });
            if (!res.ok) throw new Error();
            setConvs(prev => prev.filter(c => (c.id || c.conversationId) !== convId));
            setSelected(null);
            setMessages([]);
            showToast("Conversa excluída com sucesso");
        } catch {
            showToast("Erro ao excluir conversa", "error");
        }
        setDeletingConv(false);
    };

    const safeConvs = Array.isArray(convs) ? convs : [];
    const filtered = safeConvs.filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return c.client?.name?.toLowerCase().includes(q) || c.provider?.name?.toLowerCase().includes(q) || c.client?.email?.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-4">
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

            <div>
                <h1 className="text-xl font-black text-white">💬 Logs de Chat</h1>
                <p className="text-white/40 text-sm mt-0.5">Visualize e modere conversas da plataforma</p>
            </div>

            <input id="admin-chats-search" name="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar por participante..."
                className="w-full max-w-sm bg-white/4 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/25 focus:outline-none" />

            <div className="grid grid-cols-12 gap-4">
                {/* Conv list */}
                <div className="col-span-4 space-y-1.5 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-10 text-white/20 text-sm">Carregando...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 text-white/20 text-sm">Nenhuma conversa.</div>
                    ) : filtered.map((c, i) => {
                        const id = c.id || c.conversationId || i;
                        return (
                            <button key={id} onClick={() => openConv(c)}
                                className={`w-full text-left p-3.5 rounded-xl border transition-all ${selected?.id === c.id ? "border-primary/40 bg-primary/5" : "border-white/6 bg-white/2 hover:bg-white/4"}`}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                                        {c.client?.name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-semibold truncate">
                                            {c.client?.name || c.client?.email?.split('@')[0] || "Client"}
                                            {c.isAnonymous ? " (Anônimo) " : " "}
                                            ↔
                                            {" " + (c.provider?.name || c.provider?.email?.split('@')[0] || "Provider")}
                                        </p>
                                        <p className="text-white/30 text-[10px] truncate">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : "Sem mensagens"}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Messages */}
                <div className="col-span-8 bg-white/2 border border-white/6 rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: "70vh" }}>
                    {!selected ? (
                        <div className="flex-1 flex items-center justify-center text-white/20 text-sm">Selecione uma conversa</div>
                    ) : msgLoading ? (
                        <div className="flex-1 flex items-center justify-center text-white/20 text-sm">Carregando mensagens...</div>
                    ) : (
                        <>
                            <div className="px-4 py-3 border-b border-white/6 flex justify-between items-center">
                                <p className="text-white text-sm font-semibold">
                                    {selected.client?.name || "Client"} {selected.isAnonymous ? "(Modo Anônimo)" : "(Modo Identificado)"} ↔ {selected.provider?.name || "Provider"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50 font-bold">
                                        {selected.id}
                                    </span>
                                    <button
                                        onClick={deleteConversation}
                                        disabled={deletingConv}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-40"
                                    >
                                        {deletingConv ? (
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                        Excluir Conversa
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                                {messages.length === 0 ? (
                                    <p className="text-center text-white/20 text-sm pt-10">Nenhuma mensagem.</p>
                                ) : messages.map((m, i) => (
                                    <div key={m.id || i} className="group flex gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0 mt-0.5">
                                            {m.user?.name?.charAt(0) || "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-white/50 text-[10px] font-semibold">{m.user?.name || "Desconhecido"}</span>
                                                <span className="text-white/20 text-[10px]">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                                                <button
                                                    onClick={() => deleteMessage(m.id || m._id)}
                                                    disabled={deletingMsgId === (m.id || m._id)}
                                                    title="Excluir mensagem"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/15 disabled:opacity-30"
                                                >
                                                    {deletingMsgId === (m.id || m._id) ? (
                                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="bg-white/5 border border-white/6 rounded-xl px-3 py-2 text-sm text-white/80 max-w-sm whitespace-pre-wrap">
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
