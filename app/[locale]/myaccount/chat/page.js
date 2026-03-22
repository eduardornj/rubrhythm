"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import useSWR, { mutate } from "swr";
import { MessageCircle, Send, Check, CheckCheck, User, Search, Clock, ShieldCheck, Ghost, AlertCircle } from "lucide-react";
import { analytics } from "@/lib/analytics";

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

export default function ProviderChatDashboard() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // List Conversations (Real-time polling every 5s)
  const { data: convData, error: convError, mutate: mutateConvs } = useSWR(
    session?.user?.id ? "/api/messages/conversations" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // List Messages for Selected Conversation (Real-time polling every 3s)
  const { data: msgData, mutate: mutateMsgs } = useSWR(
    selectedConvId ? `/api/messages/${selectedConvId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const conversations = convData?.conversations || [];
  const messages = msgData?.messages || [];

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  // Filter conversations by search
  const filteredConvs = conversations.filter(c => {
    if (!searchQuery) return true;
    return c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      // Optimistic Update (UI Only)
      const tempMsg = {
        id: `temp-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        senderId: session.user.id,
        isSending: true
      };
      mutateMsgs({ messages: [...messages, tempMsg] }, false);

      const res = await fetch(`/api/messages/${selectedConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        analytics.sendMessage(selectedConv?.listingId || selectedConvId);
        mutateMsgs();
        mutateConvs();
        mutate(`/api/credits?userId=${session.user.id}`);
      } else {
        setNewMessage(content); // Restore on error
        alert(t('failedToSendMessage'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (convError) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500/50 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{t('errorLoadingChats')}</h2>
        <p className="text-white/40 text-sm">{t('errorLoadingChatsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] max-h-[900px] w-full max-w-[1400px] mx-auto bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex shadow-2xl relative">

      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none"></div>

      {/* Sidebar (Conversations List) */}
      <div className={`w-full md:w-[350px] flex-shrink-0 border-r border-white/5 bg-white/[0.02] flex flex-col z-10 ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>

        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            {t('inbox')}
          </h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder={t('searchMessages')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1">
          {!convData ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Ghost className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">{t('noConversations')}</p>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-start gap-3 relative group
                                    ${selectedConvId === conv.id
                    ? 'bg-primary/10 border-primary/20 border shadow-[0_0_20px_rgba(var(--color-primary),0.05)]'
                    : 'bg-transparent border border-transparent hover:bg-white/5'
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conv.isAnonymous ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                      <Ghost className="w-5 h-5 text-white/40" />
                    </div>
                  ) : conv.otherUser?.image ? (
                    <img src={conv.otherUser.image} alt="User" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#0a0a0a]"></span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-sm font-semibold truncate pr-2 ${selectedConvId === conv.id ? 'text-primary' : 'text-white'}`}>
                      {conv.isAnonymous ? t('anonymousClient') : (conv.otherUser?.name || conv.otherUser?.email?.split('@')[0] || t('client'))}
                    </span>
                    <span className="text-[10px] text-white/30 whitespace-nowrap">
                      {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                    {conv.subject}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col z-10 ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-white/2 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
              <MessageCircle className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('yourMessages')}</h2>
            <p className="text-white/40 max-w-sm">
              {t('yourMessagesDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 flex-shrink-0 border-b border-white/5 bg-white/[0.01] backdrop-blur-md flex items-center px-6 justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="md:hidden w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-white"
                  onClick={() => setSelectedConvId(null)}
                >
                  ←
                </button>
                <div>
                  <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    {selectedConv.isAnonymous ? t('anonymousClient') : (selectedConv.otherUser?.name || t('client'))}
                    {!selectedConv.isAnonymous && selectedConv.otherUser?.verified && <ShieldCheck className="w-4 h-4 text-primary" />}
                  </h2>
                  <p className="text-xs text-white/40 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    {t('inquiryVia', { listing: selectedConv.listing?.title || 'Profile' })}
                  </p>
                  {!selectedConv.isAnonymous && selectedConv.otherUser?.email && (
                    <p className="text-xs text-primary mt-1 flex flex-col">
                      <span>Email: {selectedConv.otherUser.email}</span>
                      {selectedConv.otherUser.phone && <span>Phone: {selectedConv.otherUser.phone}</span>}
                    </p>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary shadow-sm">{t('secureChat')}</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 hide-scrollbar relative">
              {/* Protection Banner */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md text-center">
                  <ShieldCheck className="w-6 h-6 text-primary mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white mb-1">{t('endToEndEncryption')}</h4>
                  <p className="text-xs text-white/40">
                    {t('encryptionWarning')}
                  </p>
                </div>
              </div>

              {!msgData ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white/30 text-sm">{t('noMessagesYet')}</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === session?.user?.id;
                  const isLast = idx === messages.length - 1;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>

                        <div className={`relative px-4 py-2.5 shadow-lg
                                                    ${isMe
                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white/10 border border-white/10 text-white/90 rounded-2xl rounded-tl-sm backdrop-blur-md'}
                                                    ${msg.isSending ? 'opacity-70' : 'opacity-100'}
                                                `}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>

                        <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-white/30 font-medium">{time}</span>
                          {isMe && !msg.isSending && (
                            <CheckCheck className="w-3 h-3 text-primary" />
                          )}
                          {isMe && msg.isSending && (
                            <Clock className="w-3 h-3 text-white/30" />
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-white/[0.02] border-t border-white/5 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative bg-white/5 border border-white/10 rounded-2xl focus-within:border-primary/50 focus-within:bg-white/10 transition-all shadow-inner">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={t('messagePlaceholder')}
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 resize-none py-3.5 px-4 max-h-[120px] focus:outline-none hide-scrollbar"
                    rows={1}
                    style={{ minHeight: "52px" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                                        ${newMessage.trim() && !sending
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--color-primary),0.4)] hover:scale-105 active:scale-95'
                      : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}
                                    `}
                >
                  <Send className={`w-5 h-5 ${newMessage.trim() && !sending ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                </button>
              </form>
              <p className="text-center text-[10px] text-white/20 mt-3 font-medium tracking-wide">
                {t('pressEnterToSend')} • {t('repliesFree')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}