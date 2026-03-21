'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { analytics } from '@/lib/analytics';

export default function AnonymousMessaging({ providerId, listingId }) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationSubject, setNewConversationSubject] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session, providerId]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const params = new URLSearchParams();
      if (providerId) params.append('providerId', providerId);
      if (listingId) params.append('listingId', listingId);
      
      const response = await fetch(`/api/messages/conversations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConversation) {
          setActiveConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        analytics.sendMessage(listingId);
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        // Update conversation last message time
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversation.id
              ? { ...conv, lastMessageAt: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async () => {
    if (!newConversationSubject.trim() || !providerId) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          listingId,
          subject: newConversationSubject.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversation(data.conversation);
        setNewConversationSubject('');
        setShowNewConversation(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-gray-400 mb-4">Sign in to start a conversation</p>
        <button className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Anonymous Messages
          </h3>
          <button
            onClick={() => setShowNewConversation(!showNewConversation)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            New Message
          </button>
        </div>
        
        {showNewConversation && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <input
              type="text"
              value={newConversationSubject}
              onChange={(e) => setNewConversationSubject(e.target.value)}
              placeholder="Message subject..."
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={startNewConversation}
                disabled={!newConversationSubject.trim() || sending}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Start Conversation
              </button>
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setNewConversationSubject('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row h-96 border border-gray-600/30 rounded-xl overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-600/30 bg-gray-800/10">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Conversations</h4>
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeConversation?.id === conversation.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text truncate">
                        {conversation.subject}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatTime(conversation.lastMessageAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-900/20">
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-600/30 bg-gray-800/20">
                <h5 className="font-medium text-text">{activeConversation.subject}</h5>
                <p className="text-xs text-gray-400">Started {formatTime(activeConversation.createdAt)}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-transparent to-gray-900/10">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwn = message.senderId === session.user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl shadow-sm ${
                            isOwn
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-gray-700/80 text-gray-100 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100/70' : 'text-gray-400'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-600/30 bg-gray-800/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}