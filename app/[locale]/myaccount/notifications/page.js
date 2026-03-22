"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const TYPE_CONFIG = {
  success: {
    cardBg: "bg-green-500/8 border-green-500/25",
    cardBgUnread: "bg-green-500/12 border-green-500/40",
    leftBar: "bg-green-400",
    iconBg: "bg-green-500/20",
    iconText: "text-green-300",
    badge: "bg-green-500/20 text-green-300 border border-green-500/30",
    badgeLabelKey: "notificationsBadgeSuccess",
    dot: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]",
    icon: "✅",
    titleColor: "text-green-50",
  },
  warning: {
    cardBg: "bg-yellow-500/8 border-yellow-500/25",
    cardBgUnread: "bg-yellow-500/12 border-yellow-500/40",
    leftBar: "bg-yellow-400",
    iconBg: "bg-yellow-500/20",
    iconText: "text-yellow-300",
    badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    badgeLabelKey: "notificationsBadgeWarning",
    dot: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]",
    icon: "⚠️",
    titleColor: "text-yellow-50",
  },
  error: {
    cardBg: "bg-red-500/8 border-red-500/25",
    cardBgUnread: "bg-red-500/12 border-red-500/40",
    leftBar: "bg-red-400",
    iconBg: "bg-red-500/20",
    iconText: "text-red-300",
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    badgeLabelKey: "notificationsBadgeUrgent",
    dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse",
    icon: "🚨",
    titleColor: "text-red-50",
  },
  info: {
    cardBg: "bg-blue-500/8 border-blue-500/25",
    cardBgUnread: "bg-blue-500/12 border-blue-500/40",
    leftBar: "bg-blue-400",
    iconBg: "bg-blue-500/20",
    iconText: "text-blue-300",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    badgeLabelKey: "notificationsBadgeInfo",
    dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
    icon: "ℹ️",
    titleColor: "text-blue-50",
  },
  general: {
    cardBg: "bg-white/4 border-white/10",
    cardBgUnread: "bg-white/8 border-white/20",
    leftBar: "bg-white/30",
    iconBg: "bg-white/10",
    iconText: "text-white/60",
    badge: "bg-white/10 text-white/50 border border-white/15",
    badgeLabelKey: "notificationsBadgeGeneral",
    dot: "bg-white/50",
    icon: "🔔",
    titleColor: "text-white",
  },
};

function formatDate(dateString, t) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return t('notificationsTimeJustNow');
  if (diff < 3600) return t('notificationsTimeMinutes', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('notificationsTimeHours', { count: Math.floor(diff / 3600) });
  if (diff < 604800) return t('notificationsTimeDays', { count: Math.floor(diff / 86400) });
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function NotifCard({ notif, onRead, onDelete, onClick, t }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
  const isUnread = !notif.isRead;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-200 group
        ${isUnread ? cfg.cardBgUnread : cfg.cardBg}
        hover:scale-[1.005] hover:shadow-lg
      `}
    >
      {/* Left color bar */}
      {isUnread && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.leftBar} rounded-l-2xl`} />
      )}

      <div className="p-4 pl-5 flex items-start gap-3">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.iconBg}`}>
          <span className="text-xl leading-none">{cfg.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: badge + time + dot */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {t(cfg.badgeLabelKey)}
            </span>
            <span className="text-white/25 text-xs">{formatDate(notif.createdAt, t)}</span>
            {isUnread && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
            )}
          </div>

          {/* Title */}
          <p className={`text-sm font-bold leading-snug mb-1 ${isUnread ? cfg.titleColor : "text-white/60"}`}>
            {notif.title}
          </p>

          {/* Body */}
          <p className={`text-xs leading-relaxed ${isUnread ? "text-white/65" : "text-white/40"}`}>
            {notif.body}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isUnread && (
            <button
              onClick={(e) => { e.stopPropagation(); onRead(notif.id); }}
              title={t('notificationsMarkAsRead')}
              className="p-1.5 rounded-lg text-white/30 hover:text-green-400 hover:bg-green-500/15 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notif.id, isUnread); }}
            title={t('notificationsDelete')}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/15 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      const url = filter === "unread"
        ? "/api/notifications?unreadOnly=true&limit=50"
        : "/api/notifications?limit=50";
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      }
    } catch { }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetchNotifications();
  }, [session, fetchNotifications]);

  const markAsRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id, wasUnread) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) await markAsRead(notif.id);

    // Smart routing
    const title = notif.title?.toLowerCase() || "";
    if (title.includes("message") || title.includes("mensagem") || title.includes("chat")) {
      router.push("/myaccount/chat");
    } else if (title.includes("listing") || title.includes("anúncio")) {
      router.push("/myaccount/listings");
    } else if (title.includes("verificaç") || title.includes("verified")) {
      router.push("/myaccount/verification");
    } else if (title.includes("crédit") || title.includes("credit") || title.includes("bitcoin") || title.includes("pagamento")) {
      router.push("/myaccount/credits");
    }
  };

  if (!session?.user?.id) {
    router.push("/login");
    return null;
  }

  // Stats by type
  const countByType = notifications.reduce((acc, n) => {
    const t = n.type || "general";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">

      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent/10 via-background to-primary/10 border-accent/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-2xl">🔔</span>
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-background shadow-lg shadow-primary/40">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{t('notificationsTitle')}</h1>
              <p className="text-text-muted text-sm mt-0.5">
                {unreadCount > 0
                  ? <span className="text-accent font-semibold">{t('notificationsUnread', { count: unreadCount })}</span>
                  : <span className="text-green-400">✓ {t('notificationsAllCaughtUp')}</span>
                }
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all"
            >
              {t('notificationsMarkAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Type Summary Pills — only show if has notifications */}
      {!loading && notifications.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const count = countByType[type] || 0;
            if (count === 0) return null;
            return (
              <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.badge}`}>
                <span>{cfg.icon}</span>
                <span>{t(cfg.badgeLabelKey)}</span>
                <span className="opacity-60">({count})</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: t('notificationsFilterAll') },
          { key: "unread", label: t('notificationsFilterUnread') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white/5 text-text-muted hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-2 bg-white/25 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : notifications.length === 0 ? (
          <div className="glass-card p-14 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-4xl">
              🔔
            </div>
            <div>
              <p className="text-white font-bold text-lg">{t('notificationsNoNotifications')}</p>
              <p className="text-text-muted text-sm mt-1">
                {filter === "unread"
                  ? t('notificationsEmptyUnread')
                  : t('notificationsEmptyAll')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Unread section */}
            {notifications.some((n) => !n.isRead) && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">{t('notificationsSectionUnread')}</p>
                {notifications
                  .filter((n) => !n.isRead)
                  .map((notif) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onRead={markAsRead}
                      onDelete={deleteNotif}
                      onClick={() => handleNotifClick(notif)}
                      t={t}
                    />
                  ))}
              </div>
            )}

            {/* Read section */}
            {notifications.some((n) => n.isRead) && (
              <div className="space-y-2 mt-4">
                {notifications.some((n) => !n.isRead) && (
                  <p className="text-xs font-bold text-white/20 uppercase tracking-widest px-1 pt-2">{t('notificationsSectionRead')}</p>
                )}
                {notifications
                  .filter((n) => n.isRead)
                  .map((notif) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onRead={markAsRead}
                      onDelete={deleteNotif}
                      onClick={() => handleNotifClick(notif)}
                      t={t}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
