"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { X, Send, CreditCard, ShieldCheck, User, Ghost, MessageCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

export default function AnonymousChat({ isOpen, onClose, listing, providerId }) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true); // Default to Anonymous (2 credits)
  const messagesEndRef = useRef(null);

  // 1. Fetch Conversations to see if one already exists with this provider
  const { data: convData, mutate: mutateConvs } = useSWR(
    (isOpen && session?.user?.id) ? `/api/messages/conversations?providerId=${providerId}` : null,
    fetcher
  );

  const activeConversation = convData?.conversations?.[0] || null;

  // 2. Fetch Messages if we have an active conversation
  const { data: msgData, mutate: mutateMsgs } = useSWR(
    activeConversation ? `/api/messages/${activeConversation.id}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const messages = msgData?.messages || [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setIsSending(true);

    try {
      let targetConvId = activeConversation?.id;

      // If no conversation exists, CREATE it first
      if (!targetConvId) {
        const createRes = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId,
            listingId: listing?.id,
            subject: `Inquiry via ${listing?.title || 'Profile'}`,
            isAnonymous
          })
        });

        const createData = await createRes.json();
        if (!createRes.ok) {
          alert(createData.error || "Failed to start conversation.");
          setIsSending(false);
          return;
        }
        targetConvId = createData.conversation.id;
        mutateConvs(); // Re-fetch conversations so the new UI mode kicks in
      }

      // Send the actual message
      setNewMessage(""); // Optimistic clear

      // Optimistic Update
      if (activeConversation) {
        const tempMsg = {
          id: `temp-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          senderId: session.user.id,
          isSending: true
        };
        mutateMsgs({ messages: [...messages, tempMsg] }, false);
      }

      const sendRes = await fetch(`/api/messages/${targetConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        if (sendRes.status === 402) {
          // Insufficient credits
          alert("Insufficient credits. Please Top-up your account in the dashboard.");
        } else {
          alert(sendData.error || "Failed to send message.");
        }
        setNewMessage(content); // Restore message
      } else {
        mutateMsgs();
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  // If user is NOT logged in
  if (!session?.user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md h-[400px] flex flex-col p-8 items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <User className="w-16 h-16 text-primary mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-white/50 text-sm mb-8 px-4">
            You must have an active logged-in session to protect your identity and manage your message credits.
          </p>
          <Link href="/login" className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98]">
            Login or Subscribe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-[500px] h-[80vh] sm:h-[650px] flex flex-col border border-white/10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-transform animate-in fade-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">

        {/* Ambient Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 pointer-events-none z-0"></div>

        {/* Header */}
        <div className="h-20 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">Secure Message</h3>
              <p className="text-xs text-white/40">E2E Encrypted • Private</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-transparent z-10 relative">

          {/* Identity Selection (Only show if conversation doesn't exist yet) */}
          {!activeConversation && (
            <div className="p-6 bg-white/[0.02] border-b border-white/5">
              <h4 className="text-sm font-semibold text-white mb-4">Select Messaging Mode:</h4>
              <div className="space-y-3">

                {/* Anonymous Option */}
                <label className={`flex items-start gap-4 p-4 rounded-xl border border-white/10 cursor-pointer transition-all ${isAnonymous ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/50' : 'bg-transparent hover:bg-white/5'}`}>
                  <div className="flex items-center h-5">
                    <input type="radio" checked={isAnonymous} onChange={() => setIsAnonymous(true)} className="hidden" />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isAnonymous ? 'border-primary' : 'border-white/30'}`}>
                      {isAnonymous && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${isAnonymous ? 'text-white' : 'text-white/70'}`}>Anonymous Sender</span>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">2 Credits / msg</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">The provider will only see "Anonymous Client". Your name, email, and profile avatar are 100% hidden. Privacy guaranteed.</p>
                  </div>
                </label>

                {/* Identified Option */}
                <label className={`flex items-start gap-4 p-4 rounded-xl border border-white/10 cursor-pointer transition-all ${!isAnonymous ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/50' : 'bg-transparent hover:bg-white/5'}`}>
                  <div className="flex items-center h-5">
                    <input type="radio" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} className="hidden" />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!isAnonymous ? 'border-primary' : 'border-white/30'}`}>
                      {!isAnonymous && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${!isAnonymous ? 'text-white' : 'text-white/70'}`}>Identified Sender</span>
                      <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">1 Credit / msg</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">Share your profile name ({session.user.name}) and email with the provider to build trust and potentially get better responses.</p>
                  </div>
                </label>

              </div>
            </div>
          )}

          {/* Active Status Badge */}
          {activeConversation && (
            <div className="bg-white/5 py-2 px-6 flex items-center justify-between border-b border-white/5">
              <span className="text-xs text-white/40 flex items-center gap-2">
                {activeConversation.isAnonymous ? <Ghost className="w-3.5 h-3.5 text-white/30" /> : <User className="w-3.5 h-3.5 text-white/30" />}
                Mode: {activeConversation.isAnonymous ? 'Anonymous (2 Credits/msg)' : 'Identified (1 Credit/msg)'}
              </span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 hide-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <MessageCircle className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-sm text-white/60">No messages yet. Send your first inquiry above.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === session.user.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white/10 text-white border border-white/5 rounded-tl-sm backdrop-blur-sm shadow-xl'} ${msg.isSending ? 'opacity-50' : 'opacity-100'}`}>
                      <p className="text-sm tracking-wide leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* Action / Input Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/10 backdrop-blur-xl z-20">
          <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-primary/50 focus-within:bg-white/10 transition-colors shadow-inner relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Write your message..."
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 resize-none px-4 py-4 min-h-[56px] max-h-[120px] hide-scrollbar focus:outline-none"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${newMessage.trim() && !isSending
                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--color-primary),0.4)] hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                  }`}
              >
                {isSending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                {(!activeConversation && isAnonymous) || (activeConversation?.isAnonymous) ? 'Cost: 2 Credits' : 'Cost: 1 Credit'}
              </span>
              <span className="text-[10px] text-white/30 tracking-wider">
                BALANCE: {session?.user?.credits || 0}
              </span>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}