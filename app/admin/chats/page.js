"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

function formatTime(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function getInitial(name) {
    return (name || "?")[0].toUpperCase();
}

// ── Confirm Modal ────────────────────────────────────────────

function ConfirmModal({ isOpen, title, description, confirmLabel, onClose, onConfirm, loading }) {
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
                    {title}
                </h3>
                <p className="text-sm mb-5 text-text-muted">
                    {description}
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
                        {loading ? "Deletando..." : confirmLabel || "Deletar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Skeleton Loaders ─────────────────────────────────────────

function SkeletonConversationItem() {
    return (
        <div className="px-4 py-3.5 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
                <div className="h-3.5 w-32 rounded animate-pulse bg-white/[0.06]" />
                <div className="h-3 w-8 rounded animate-pulse bg-white/[0.04]" />
            </div>
            <div className="h-3 w-48 rounded animate-pulse bg-white/[0.04]" />
        </div>
    );
}

function SkeletonMessages() {
    return (
        <div className="flex-1 p-4 space-y-4">
            {[false, true, false, true, false].map((isRight, i) => (
                <div key={i} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                    <div
                        className={`rounded-xl px-4 py-3 animate-pulse ${isRight ? "bg-primary/15" : "bg-white/[0.04]"}`}
                        style={{ width: `${140 + Math.random() * 120}px`, height: "48px" }}
                    />
                </div>
            ))}
        </div>
    );
}

// ── Conversation List Item ───────────────────────────────────

function ConversationItem({ conversation, isSelected, onClick }) {
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    const messageCount = conversation._count?.message || conversation.messages?.length || 0;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3.5 transition-all duration-150 border-b border-border/50 ${
                isSelected
                    ? "bg-primary/[0.08] border-l-2 border-l-primary"
                    : "border-l-2 border-l-transparent hover:bg-white/[0.03]"
            }`}
        >
            {/* Names row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-primary/[0.18] text-primary">
                        {getInitial(conversation.client?.name)}
                    </div>
                    <span className="text-xs font-medium truncate text-zinc-300">
                        {conversation.client?.name || "Cliente"}
                    </span>
                    <span className="text-[10px] shrink-0 text-zinc-700">
                        &harr;
                    </span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-sky-400/15 text-sky-400">
                        {getInitial(conversation.provider?.name)}
                    </div>
                    <span className="text-xs font-medium truncate text-zinc-300">
                        {conversation.provider?.name || "Profissional"}
                    </span>
                </div>
                <span className="text-[10px] tabular-nums shrink-0 text-text-muted">
                    {timeAgo(conversation.updatedAt)}
                </span>
            </div>

            {/* Subject */}
            {conversation.subject && (
                <p className="text-[11px] font-medium truncate mb-1 text-text-muted">
                    {conversation.subject}
                </p>
            )}

            {/* Preview + count */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] truncate text-text-muted">
                    {lastMessage
                        ? `${lastMessage.senderName}: ${lastMessage.content?.substring(0, 50)}${lastMessage.content?.length > 50 ? "..." : ""}`
                        : "Sem mensagens"}
                </p>
                <span className="text-[10px] font-semibold tabular-nums shrink-0 px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted">
                    {messageCount}
                </span>
            </div>
        </button>
    );
}

// ── Chat Message Bubble ──────────────────────────────────────

function MessageBubble({ message, isClientSide, onDelete, deleting }) {
    return (
        <div className={`flex ${isClientSide ? "justify-start" : "justify-end"} group`}>
            <div className="max-w-[75%] sm:max-w-[65%]">
                {/* Sender name */}
                <p
                    className={`text-[10px] font-medium mb-1 ${isClientSide ? "text-left text-primary" : "text-right text-sky-400"}`}
                >
                    {message.senderName}
                </p>

                {/* Bubble */}
                <div
                    className={`relative rounded-xl px-3.5 py-2.5 border ${
                        isClientSide
                            ? "bg-white/[0.05] border-border rounded-bl-[4px]"
                            : "bg-primary/15 border-primary/20 rounded-br-[4px]"
                    }`}
                >
                    <p className="text-sm leading-relaxed break-words text-white">
                        {message.content}
                    </p>

                    {/* Time + delete */}
                    <div className={`flex items-center gap-2 mt-1.5 ${isClientSide ? "justify-start" : "justify-end"}`}>
                        <span className="text-[10px] tabular-nums text-text-muted">
                            {formatTime(message.createdAt)}
                        </span>
                        {message.isRead && (
                            <span className="text-[10px] text-sky-400" title="Lida">
                                &#10003;&#10003;
                            </span>
                        )}
                        <button
                            onClick={() => onDelete(message.id)}
                            disabled={deleting}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] px-1.5 py-0.5 rounded hover:bg-red-500/20 text-red-400"
                            title="Deletar mensagem"
                        >
                            &#128465;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Chat Header ──────────────────────────────────────────────

function ChatHeader({ conversation, onBack, onDeleteConversation, loading }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 shrink-0 bg-white/[0.02] border-b border-border">
            {/* Back button (mobile) */}
            <button
                onClick={onBack}
                className="md:hidden shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 bg-white/[0.04] text-zinc-300"
                aria-label="Voltar"
            >
                &#8592;
            </button>

            {/* Participants */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary/[0.18] text-primary">
                            {getInitial(conversation.client?.name)}
                        </div>
                        <span className="text-sm font-medium text-zinc-300">
                            {conversation.client?.name || "Cliente"}
                        </span>
                    </div>

                    <span className="text-xs text-zinc-700">&harr;</span>

                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-sky-400/15 text-sky-400">
                            {getInitial(conversation.provider?.name)}
                        </div>
                        <span className="text-sm font-medium text-zinc-300">
                            {conversation.provider?.name || "Profissional"}
                        </span>
                    </div>
                </div>

                {conversation.subject && (
                    <p className="text-[11px] mt-0.5 truncate text-text-muted">
                        {conversation.subject}
                    </p>
                )}
            </div>

            {/* Info + Delete */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] tabular-nums hidden sm:block text-text-muted">
                    {conversation._count?.message || 0} msgs
                </span>
                {conversation.isAnonymous && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded hidden sm:block border border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
                        Anonimo
                    </span>
                )}
                <button
                    onClick={onDeleteConversation}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 border border-red-500/25 bg-red-500/10 text-red-400"
                >
                    Deletar Conversa
                </button>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminChatsPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Delete confirm modal
    const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null });

    const messagesEndRef = useRef(null);
    const abortRef = useRef(null);

    // ── Fetch conversations ──────────────────────────────────

    const fetchConversations = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/chats", { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = await res.json();
            setConversations(json.conversations || []);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("[Chats] fetch error:", err);
                setError("Falha ao carregar conversas");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [fetchConversations]);

    // Scroll to bottom when conversation changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedId]);

    // ── Actions ──────────────────────────────────────────────

    async function handleDeleteMessage(messageId) {
        setDeleteModal({ open: true, type: "message", id: messageId });
    }

    function handleDeleteConversation(conversationId) {
        setDeleteModal({ open: true, type: "conversation", id: conversationId });
    }

    async function executeDelete() {
        const { type, id } = deleteModal;
        if (!type || !id) return;

        setActionLoading(true);

        try {
            const body =
                type === "message"
                    ? { action: "delete_message", messageId: id }
                    : { action: "delete_conversation", conversationId: id };

            const res = await fetch("/api/admin/chats", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const json = await res.json();

            if (json.success) {
                if (type === "conversation") {
                    setConversations((prev) => prev.filter((c) => c.id !== id));
                    if (selectedId === id) setSelectedId(null);
                } else {
                    setConversations((prev) =>
                        prev.map((c) => ({
                            ...c,
                            messages: c.messages.filter((m) => m.id !== id),
                            _count: {
                                ...c._count,
                                message: c.messages.filter((m) => m.id !== id).length,
                            },
                        }))
                    );
                }
                setDeleteModal({ open: false, type: null, id: null });
            }
        } catch (err) {
            console.error("[Delete] error:", err);
        } finally {
            setActionLoading(false);
        }
    }

    // ── Derived state ────────────────────────────────────────

    const filteredConversations = searchQuery.trim()
        ? conversations.filter((c) => {
              const q = searchQuery.toLowerCase();
              return (
                  c.client?.name?.toLowerCase().includes(q) ||
                  c.client?.email?.toLowerCase().includes(q) ||
                  c.provider?.name?.toLowerCase().includes(q) ||
                  c.provider?.email?.toLowerCase().includes(q) ||
                  c.subject?.toLowerCase().includes(q)
              );
          })
        : conversations;

    const selectedConversation = conversations.find((c) => c.id === selectedId);
    const showList = !selectedId; // on mobile, show list when nothing selected

    // ── Render ───────────────────────────────────────────────

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Chats
                    </h1>
                    {!loading && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-primary/25 bg-primary/10 text-primary">
                            {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <button
                    onClick={fetchConversations}
                    disabled={loading}
                    className="btn-secondary self-start sm:self-auto disabled:opacity-50"
                    aria-label="Atualizar lista"
                >
                    {loading ? "Carregando..." : "Atualizar"}
                </button>
            </div>

            {/* ── Error State ─────────────────────────────────── */}
            {error && (
                <div className="rounded-lg px-4 py-3 mb-5 text-sm border border-red-500/20 bg-red-500/[0.08] text-red-300">
                    {error}
                    <button
                        onClick={fetchConversations}
                        className="ml-3 underline text-xs font-medium text-red-400"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* ── Split Pane ──────────────────────────────────── */}
            <div
                className="glass-card !p-0 overflow-hidden flex flex-col md:flex-row"
                style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
            >
                {/* ── Left: Conversation List ─────────────────── */}
                <div
                    className={`md:w-[340px] shrink-0 flex flex-col ${showList ? "flex" : "hidden md:flex"} border-r border-border`}
                >
                    {/* Search */}
                    <div className="px-3 py-3 border-b border-border/50">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome ou email..."
                            className="input-field w-full"
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <>
                                <SkeletonConversationItem />
                                <SkeletonConversationItem />
                                <SkeletonConversationItem />
                                <SkeletonConversationItem />
                                <SkeletonConversationItem />
                            </>
                        )}

                        {!loading && filteredConversations.length === 0 && (
                            <div className="py-16 text-center">
                                <div className="text-2xl mb-2">{searchQuery ? "&#128269;" : "&#128172;"}</div>
                                <p className="text-xs font-medium text-text-muted">
                                    {searchQuery ? "Nenhum resultado" : "Nenhuma conversa"}
                                </p>
                            </div>
                        )}

                        {!loading &&
                            filteredConversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isSelected={selectedId === conv.id}
                                    onClick={() => setSelectedId(conv.id)}
                                />
                            ))}
                    </div>
                </div>

                {/* ── Right: Messages ─────────────────────────── */}
                <div className={`flex-1 flex flex-col min-w-0 ${!showList ? "flex" : "hidden md:flex"}`}>
                    {!selectedConversation && !loading && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl mb-3">&#128172;</div>
                                <p className="text-sm font-medium text-text-muted">
                                    Selecione uma conversa
                                </p>
                                <p className="text-xs mt-1 text-zinc-700">
                                    Clique em uma conversa na lista para ver as mensagens
                                </p>
                            </div>
                        </div>
                    )}

                    {loading && !selectedConversation && <SkeletonMessages />}

                    {selectedConversation && (
                        <>
                            {/* Chat header */}
                            <ChatHeader
                                conversation={selectedConversation}
                                onBack={() => setSelectedId(null)}
                                onDeleteConversation={() => handleDeleteConversation(selectedConversation.id)}
                                loading={actionLoading}
                            />

                            {/* Conversation meta */}
                            <div className="px-4 py-2 flex items-center gap-3 flex-wrap text-[10px] bg-white/[0.015] border-b border-border/50 text-text-muted">
                                <span>Criada: {formatDate(selectedConversation.createdAt)}</span>
                                <span className="text-zinc-800">|</span>
                                <span>Atualizada: {formatDate(selectedConversation.updatedAt)}</span>
                                {selectedConversation.listing && (
                                    <>
                                        <span className="text-zinc-800">|</span>
                                        <span>
                                            Anuncio:{" "}
                                            <span className="text-primary">{selectedConversation.listing.title}</span>
                                        </span>
                                    </>
                                )}
                                <span className="text-zinc-800">|</span>
                                <span>
                                    Cliente:{" "}
                                    <span className="text-text-muted">{selectedConversation.client?.email}</span>
                                </span>
                                <span className="text-zinc-800">|</span>
                                <span>
                                    Profissional:{" "}
                                    <span className="text-text-muted">{selectedConversation.provider?.email}</span>
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                {selectedConversation.messages.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center py-16">
                                        <p className="text-xs text-zinc-700">
                                            Nenhuma mensagem nesta conversa
                                        </p>
                                    </div>
                                )}

                                {selectedConversation.messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isClientSide={msg.senderId === selectedConversation.client?.id}
                                        onDelete={handleDeleteMessage}
                                        deleting={actionLoading}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Delete Modal ─────────────────────────────────── */}
            <ConfirmModal
                isOpen={deleteModal.open}
                title={
                    deleteModal.type === "conversation"
                        ? "Deletar Conversa"
                        : "Deletar Mensagem"
                }
                description={
                    deleteModal.type === "conversation"
                        ? "Essa acao e permanente. Todas as mensagens desta conversa serao removidas."
                        : "Essa acao e permanente. A mensagem sera removida do banco de dados."
                }
                confirmLabel="Deletar Permanente"
                onClose={() => setDeleteModal({ open: false, type: null, id: null })}
                onConfirm={executeDelete}
                loading={actionLoading}
            />
        </div>
    );
}
