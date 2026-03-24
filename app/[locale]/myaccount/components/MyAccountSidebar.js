"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import NotificationManager from "@/components/NotificationManager";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Icons as clean SVG components
const Icons = {
  bell: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
  dashboard: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  heart: <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  listing: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  credits: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  verified: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
  chat: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  boost: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  gift: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />,
  block: <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />,
  logout: <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
};

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    {path}
  </svg>
);

export default function MyAccountSidebar({ sidebarOpen, setSidebarOpen, currentPath, userCredits }) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isProvider = session?.user?.role === "provider";
  const isActive = (href) => href === "/myaccount" ? currentPath === "/myaccount" : currentPath.startsWith(href);

  // Fetch conversations to calculate unread message count
  const { data: convData } = useSWR(
    session?.user?.id ? "/api/messages/conversations" : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const totalUnread = useMemo(() => {
    if (!convData?.conversations) return 0;
    return convData.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }, [convData]);

  // Menu items vary by role
  const providerMenu = [
    { id: "dashboard", label: t("dashboardLabel"), href: "/myaccount", icon: Icons.dashboard },
    {
      id: "listings", label: t("myListingsAction"), href: "/myaccount/listings", icon: Icons.listing,
      submenu: [
        { label: t("allListings"), href: "/myaccount/listings" },
        { label: `🟢 ${t("availableNowMenu")}`, href: "/myaccount/listings/available-now" },
        { label: `⚡ ${t("bumpUpMenu")}`, href: "/myaccount/listings/bump-up" },
        { label: `✨ ${t("highlightMenu")}`, href: "/myaccount/listings/highlight" },
        { label: `⭐ ${t("featureMenu")}`, href: "/myaccount/listings/feature" },
      ]
    },
    {
      id: "credits", label: t("creditsAction"), href: "/myaccount/credits", icon: Icons.credits,
      submenu: [
        { label: t("myCreditsMenu"), href: "/myaccount/credits" },
        { label: t("buyCreditsMenu"), href: "/myaccount/credits/buy" },
        { label: t("historyMenu"), href: "/myaccount/credits/history" },
      ]
    },
    { id: "services", label: t("boostServicesMenu"), href: "/myaccount/services", icon: Icons.boost },
    { id: "verified", label: t("getVerifiedMenu"), href: "/myaccount/verification", icon: Icons.verified },
    { id: "referral", label: t("referFriendsMenu"), href: "/myaccount/referral", icon: Icons.gift },
    { id: "chat", label: t("messagesAction"), href: "/myaccount/chat", icon: Icons.chat },
    { id: "notifications", label: t("notificationsMenu"), href: "/myaccount/notifications", icon: Icons.bell },
    { id: "blocklist", label: t("blockListMenu"), href: "/myaccount/blocklist", icon: Icons.block },
  ];

  const clientMenu = [
    { id: "dashboard", label: t("dashboardLabel"), href: "/myaccount", icon: Icons.dashboard },
    { id: "favorites", label: t("savedProfilesMenu"), href: "/myaccount/favorites", icon: Icons.heart },
    { id: "chat", label: t("myChatsMenu"), href: "/myaccount/chat", icon: Icons.chat },
    { id: "notifications", label: t("notificationsMenu"), href: "/myaccount/notifications", icon: Icons.bell },
  ];

  const adminMenu = [
    { id: "dashboard", label: t("dashboardLabel"), href: "/myaccount", icon: Icons.dashboard },
    { id: "admin-panel", label: `🔑 ${t("portalAdmin")}`, href: "/admin", icon: Icons.boost },
    {
      id: "listings", label: t("myListingsAction"), href: "/myaccount/listings", icon: Icons.listing,
      submenu: [
        { label: t("allListings"), href: "/myaccount/listings" },
        { label: `🟢 ${t("availableNowMenu")}`, href: "/myaccount/listings/available-now" },
        { label: `⚡ ${t("bumpUpMenu")}`, href: "/myaccount/listings/bump-up" },
        { label: `✨ ${t("highlightMenu")}`, href: "/myaccount/listings/highlight" },
        { label: `⭐ ${t("featureMenu")}`, href: "/myaccount/listings/feature" },
      ]
    },
    {
      id: "credits", label: t("creditsAction"), href: "/myaccount/credits", icon: Icons.credits,
      submenu: [
        { label: t("myCreditsMenu"), href: "/myaccount/credits" },
        { label: t("buyCreditsMenu"), href: "/myaccount/credits/buy" },
        { label: t("historyMenu"), href: "/myaccount/credits/history" },
      ]
    },
    { id: "services", label: t("boostServicesMenu"), href: "/myaccount/services", icon: Icons.boost },
    { id: "favorites", label: t("savedProfilesMenu"), href: "/myaccount/favorites", icon: Icons.heart },
    { id: "chat", label: t("messagesAction"), href: "/myaccount/chat", icon: Icons.chat },
    { id: "notifications", label: t("notificationsMenu"), href: "/myaccount/notifications", icon: Icons.bell },
    { id: "blocklist", label: t("blockListMenu"), href: "/myaccount/blocklist", icon: Icons.block },
  ];

  const isAdmin = session?.user?.role === "admin";
  const menuItems = isAdmin ? adminMenu : (isProvider ? providerMenu : clientMenu);

  // Bottom nav items for mobile (max 5)
  const bottomNavItems = isProvider
    ? [
      { label: t("homeNav"), href: "/myaccount", icon: Icons.dashboard },
      { label: t("listingsNav"), href: "/myaccount/listings", icon: Icons.listing },
      { label: t("servicesNav"), href: "/myaccount/services", icon: Icons.boost },
      { label: t("creditsNav"), href: "/myaccount/credits", icon: Icons.credits },
      { label: t("verifiedNav"), href: "/myaccount/verification", icon: Icons.verified },
    ]
    : [
      { label: t("homeNav"), href: "/myaccount", icon: Icons.dashboard },
      { label: t("savedNav"), href: "/myaccount/favorites", icon: Icons.heart },
      { label: t("chatsNav"), href: "/myaccount/chat", icon: Icons.chat },
    ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
    setShowLogoutConfirm(false);
  };

  const NavLink = ({ item }) => (
    <div>
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive(item.href)
          ? "bg-primary/15 text-primary border border-primary/20"
          : "text-text-muted hover:text-white hover:bg-white/5"
          }`}
      >
        <span className={`${isActive(item.href) ? "text-primary" : "text-text-muted group-hover:text-white"} transition-colors`}>
          <Icon path={item.icon} />
        </span>
        <span className="font-medium text-sm flex-1">{item.label}</span>

        {/* Unread Badge for Chat */}
        {item.id === "chat" && totalUnread > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-red-500/20">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}

        {isActive(item.href) && item.id !== "chat" && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
        )}
      </Link>

      {/* Submenu */}
      {item.submenu && isActive(item.href) && (
        <div className="ml-8 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {item.submenu.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              onClick={() => setSidebarOpen(false)}
              className={`block py-1.5 px-2 text-xs rounded-lg transition-colors ${currentPath === sub.href
                ? "text-primary font-semibold"
                : "text-text-muted hover:text-white"
                }`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Desktop Sidebar ── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 flex-col
        bg-background/95 backdrop-blur-xl
        border-r border-white/8
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:flex lg:static lg:inset-0 lg:h-full lg:min-h-full
        ${sidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden"}
      `}>
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg shadow-primary/20 relative">
                  <Image src={session.user.image} alt={session.user.name || "User"} width={36} height={36} unoptimized className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                  <span className="text-white font-black text-sm">
                    {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "RR"}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-bold text-sm leading-tight truncate max-w-[130px]">
                  {session?.user?.name || "My Account"}
                </p>
                <p className="text-text-muted text-xs">
                  {isAdmin ? "Administrador" : (isProvider ? "Massagista" : "Cliente")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:block relative z-[60]">
                <NotificationManager align="left" />
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Credits card (providers only) */}
          {isProvider && (
            <div className="p-4 border-b border-white/8">
              <div className="bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">{t("availableCreditsLabel")}</p>
                    <p className="text-xl font-black text-white mt-0.5">
                      {typeof userCredits === "number" ? userCredits.toFixed(0) : "0"}
                      <span className="text-xs text-text-muted font-normal ml-1">{t("creditsUnit")}</span>
                    </p>
                  </div>
                  <Link
                    href="/myaccount/credits/buy"
                    className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                  >
                    {t("buyShort")}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Navigation and Footer Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
            </nav>

            {/* Language + Footer Items */}
            <div className="mt-4 pt-4 border-t border-white/8 space-y-2 mb-4">
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">{t("backToSite")}</span>
              </Link>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-text-muted hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all text-sm"
              >
                <Icon path={Icons.logout} />
                <span className="font-medium">{t("signOutBtn")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const active = item.href === "/myaccount"
              ? currentPath === "/myaccount"
              : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${active ? "text-primary" : "text-text-muted"
                  }`}
              >
                <span className={`transition-transform ${active ? "scale-110" : ""}`}>
                  <Icon path={item.icon} className="w-5 h-5" />

                  {/* Unread Badge for Mobile Bottom Nav */}
                  {item.href === "/myaccount/chat" && totalUnread > 0 && (
                    <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#0a0a0a] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">{t("signOutConfirm")}</h3>
            <p className="text-text-muted text-sm mb-6">{t("signOutDesc")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-secondary"
              >
                {t("cancelBtn")}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-2.5 px-4 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                {t("signOutBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}