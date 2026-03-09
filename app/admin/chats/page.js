"use client";
import { useState, useEffect } from "react";

export default function ChatsPage() {
    const [convs, setConvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [search, setSearch] = useState("");

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

    const safeConvs = Array.isArray(convs) ? convs : [];
    const filtered = safeConvs.filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return c.client?.name?.toLowerCase().includes(q) || c.provider?.name?.toLowerCase().includes(q) || c.client?.email?.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-black text-white">💬 Logs de Chat</h1>
                <p className="text-white/40 text-sm mt-0.5">Visualize todas as conversas da plataforma (somente leitura)</p>
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
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50 font-bold">
                                    {selected.id}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                                {messages.length === 0 ? (
                                    <p className="text-center text-white/20 text-sm pt-10">Nenhuma mensagem.</p>
                                ) : messages.map((m, i) => (
                                    <div key={m.id || i} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0 mt-0.5">
                                            {m.user?.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-white/50 text-[10px] font-semibold">{m.user?.name || "Desconhecido"}</span>
                                                <span className="text-white/20 text-[10px]">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
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
