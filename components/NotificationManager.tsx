'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

const NotificationManager: React.FC<{ align?: 'left' | 'right' }> = ({ align = 'right' }) => {
  const t = useTranslations('notifications');
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else if (response.status === 401) {
        // User not authenticated, clear notifications
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show error to user for network issues
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Failed to mark notification as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      } else {
        console.error('Failed to mark all notifications as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        console.error('Failed to delete notification:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US');
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifications();

    // Poll every 30s when tab is visible, pause when hidden
    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(fetchNotifications, 30000);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchNotifications();
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [session?.user?.id, fetchNotifications]);

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell (Fitts Law complied - min 44px) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-text-muted hover:text-white transition-colors bg-surface-hover rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/5 hover:border-white/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface shadow-lg shadow-primary/20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-3 w-80 lg:w-96 glass-card shadow-2xl z-50 overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface/50">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {t('title')}
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-accent hover:text-accent-hover transition-colors px-2 py-1 hover:bg-white/5 rounded"
                >
                  {t('markAllRead')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-surface/30">
            {loading ? (
              <div className="p-8 text-center text-text-muted flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-text-muted flex flex-col items-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm">{t('noNotifications')}</p>
              </div>
            ) : (
              notifications.map((notification) => {
                // Determine navigation target from notification type/data
                const getNotifHref = () => {
                  if (notification.data) {
                    try {
                      const d = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
                      if (d?.url) return d.url;
                      if (d?.listingId) return `/listing/${d.listingId}`;
                      if (d?.conversationId) return `/myaccount/chat?conversation=${d.conversationId}`;
                    } catch { }
                  }
                  const t = notification.type?.toLowerCase() || '';
                  const title = notification.title?.toLowerCase() || '';
                  if (t === 'message' || title.includes('message') || title.includes('mensagem')) return '/myaccount/chat';
                  if (title.includes('listing') || title.includes('anúncio')) return '/myaccount/listings';
                  if (title.includes('verificaç') || title.includes('verified')) return '/myaccount/verification';
                  if (title.includes('crédit') || title.includes('credit') || title.includes('bitcoin') || title.includes('pagamento')) return '/myaccount/credits';
                  return '/myaccount/notifications';
                };

                const href = getNotifHref();
                const handleClick = async () => {
                  if (!notification.isRead) await markAsRead(notification.id);
                  setIsOpen(false);
                  router.push(href);
                };

                return (
                <div
                  key={notification.id}
                  onClick={handleClick}
                  className={`p-4 border-b border-white/5 transition-colors group cursor-pointer ${!notification.isRead ? 'bg-accent/5 hover:bg-accent/10 border-l-2 border-l-accent' : 'hover:bg-white/5 border-l-2 border-l-transparent'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
                        )}
                      </div>
                      <p className={`text-sm ${!notification.isRead ? 'text-gray-300' : 'text-text-muted'} leading-snug`}>
                        {notification.body}
                      </p>
                      <p className="text-xs text-text-muted/60 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                          className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>

          {/* Footer with primary CTA (Von Restorff) */}
          <div className="p-3 border-t border-white/10 bg-surface/80">
            <Link
              href="/myaccount/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-medium btn-primary block py-2"
            >
              Ver Central de Notificações
            </Link>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationManager;