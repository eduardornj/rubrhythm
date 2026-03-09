"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Stat Card component
function StatCard({ icon, label, value, sub, href, color = "primary" }) {
  const colorMap = {
    primary: "from-primary/15 to-primary/5 border-primary/20 text-primary",
    accent: "from-accent/15 to-accent/5 border-accent/20 text-accent",
    green: "from-green-500/15 to-green-500/5 border-green-500/20 text-green-400",
    yellow: "from-yellow-500/15 to-yellow-500/5 border-yellow-500/20 text-yellow-400",
  };
  return (
    <Link href={href} className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} hover:scale-[1.02] transition-all block`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1 opacity-70">{sub}</p>}
    </Link>
  );
}

// Action Card component
function ActionCard({ icon, title, description, href, highlight = false }) {
  return (
    <Link
      href={href}
      className={`glass-card p-4 flex items-center gap-4 hover:border-white/20 transition-all ${highlight ? "border-primary/30 bg-primary/5" : ""
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight ? "bg-primary text-white" : "bg-white/5 text-text-muted"
        }`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm truncate">{title}</p>
        <p className="text-text-muted text-xs truncate">{description}</p>
      </div>
    </Link>
  );
}

// Provider Dashboard View
function ProviderDashboard({ session, stats, userData, alerts }) {
  const isVerified = userData?.verified;
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <span className="text-white font-black text-xl">{session?.user?.name?.charAt(0)?.toUpperCase() || "P"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white truncate">
                Welcome, {session?.user?.name?.split(" ")[0]}!
              </h1>
              {isVerified ? (
                <span className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              ) : (
                <Link
                  href="/myaccount/verification"
                  className="flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full hover:bg-yellow-500/25 transition-colors"
                >
                  ⚠ Get Verified
                </Link>
              )}
            </div>
            <p className="text-text-muted text-sm">Provider Account · {session?.user?.email}</p>
            <AlertBanner {...alerts} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-white font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📋" label="Listings" value={stats.totalListings} sub={`${stats.activeListings} approved`} href="/myaccount/listings" color="primary" />
          <StatCard icon="⭐" label="Credits" value={stats.creditsBalance} sub="available to use" href="/myaccount/credits" color="accent" />
          <StatCard icon="★" label="Reviews" value={stats.totalReviews || 0} sub={stats.averageRating > 0 ? `${stats.averageRating}/5 average` : "No reviews yet"} href="/myaccount/reviews" color="yellow" />
          <StatCard icon="🔵" label="Verified" value={isVerified ? "Yes" : "No"} sub={isVerified ? "Badge active" : "Free"} href="/myaccount/verification" color={isVerified ? "green" : "yellow"} />
        </div>
      </div>

      {/* Promo Banner */}
      {!isVerified && (
        <div className="glass-card p-5 border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-4">
            <span className="text-3xl flex-shrink-0">🔵</span>
            <div className="flex-1">
              <p className="text-white font-bold">Get your Verified Badge</p>
              <p className="text-text-muted text-sm">Verified profiles receive up to 3x more contact requests. Submit your documents for review.</p>
            </div>
            <Link href="/myaccount/verification" className="btn-primary flex-shrink-0 text-sm py-2 px-4">
              Verify Now
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard icon="➕" title="Create New Listing" description="Post in a new city" href="/myaccount/listings/add-listing" highlight />
          <ActionCard icon="⚡" title="Bump Up Listing" description="5 credits · Move to top for 24h" href="/myaccount/listings/bump-up" />
          <ActionCard icon="✨" title="Highlight Listing" description="10 credits · Colored border for 7 days" href="/myaccount/listings/highlight" />
          <ActionCard icon="🌟" title="Feature Listing" description="25 credits · Premium badge 30 days" href="/myaccount/listings/feature" />
          <ActionCard icon="💳" title="Buy Credits" description="Power up your visibility" href="/myaccount/credits/buy" />
          <ActionCard icon="★" title="My Reviews" description={`${stats.totalReviews} reviews · ${stats.averageRating > 0 ? stats.averageRating + "/5" : "See feedback"}`} href="/myaccount/reviews" />
          <ActionCard icon="🔵" title="Get Verified" description="Free · Trust badge" href="/myaccount/verification" />
        </div>
      </div>

      {/* Credits Info */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-3">How Credits Work</h3>
        <div className="space-y-2">
          {[
            { icon: "⚡", action: "Bump Up", cost: "5 credits", desc: "Move listing to top of search for 24h" },
            { icon: "✨", action: "Highlight", cost: "10 credits", desc: "Colored border, stand out for 7 days" },
            { icon: "🌟", action: "Feature", cost: "25 credits", desc: "Premium badge + search priority for 30 days" },
            { icon: "🔵", action: "Verification", cost: "Free", desc: "Blue verified badge, boosts trust & clicks" },
          ].map((item) => (
            <div key={item.action} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm font-medium">{item.action}</span>
                <span className="text-text-muted text-xs ml-2">— {item.desc}</span>
              </div>
              <span className="text-primary text-xs font-bold flex-shrink-0">{item.cost}</span>
            </div>
          ))}
        </div>
        <Link href="/myaccount/credits/buy" className="btn-primary w-full mt-4 text-center block py-2.5 text-sm">
          Buy Credits — 1 credit = $1
        </Link>
      </div>
    </div>
  );
}

// Client Dashboard View
function ClientDashboard({ session, stats, alerts }) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-blue-500/10 via-background to-teal-500/10 border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">{session?.user?.name?.charAt(0)?.toUpperCase() || "C"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">Hello, {session?.user?.name?.split(" ")[0]}!</h1>
            <p className="text-text-muted text-sm">{session?.user?.email}</p>
            <AlertBanner {...alerts} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="❤️" label="Favorites" value={stats?.totalFavorites || 0} sub="Saved profiles" href="/myaccount/favorites" color="accent" />
        <StatCard icon="💬" label="Messages" value="Inbox" sub="Chat with providers" href="/myaccount/chat" color="primary" />
        <StatCard icon="⭐" label="Credits" value={stats?.creditsBalance || 0} sub="For prepaid messages" href="/myaccount/credits" color="yellow" />
        <StatCard icon="⚙️" label="Settings" value="Profile" sub="Manage account" href="/myaccount/settings" color="green" />
      </div>
    </div>
  );
}

// Admin Dashboard View
function AdminDashboard({ session, alerts }) {
  const [sysData, setSysData] = useState(null);
  const [sysLoading, setSysLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/system")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSysData(d.data); })
      .catch(() => { })
      .finally(() => setSysLoading(false));
  }, []);

  const ov = sysData?.overview;
  const aq = sysData?.actionQueue;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
              <span className="text-white font-black text-xl">👑</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hello, {session?.user?.name?.split(" ")[0]}!</h1>
              <p className="text-yellow-400/80 text-sm font-semibold flex items-center gap-1.5 flex-wrap">
                <span>System Administrator</span>
                <span className="w-1 h-1 rounded-full bg-yellow-400/40"></span>
                <span className="text-text-muted font-normal">{session?.user?.email}</span>
              </p>
              <AlertBanner {...alerts} />
            </div>
          </div>
          <Link href="/admin" className="btn-primary px-5 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 shrink-0">
            Portal Admin →
          </Link>
        </div>
      </div>

      {/* Real-time Stats */}
      <div>
        <h2 className="text-white font-semibold mb-4">System Overview</h2>
        {sysLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 glass-card rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="glass-card p-5 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-blue-500/20 hover:scale-[1.02] transition-all block">
              <p className="text-2xl font-black text-white">{ov?.users?.total ?? "—"}</p>
              <p className="text-sm text-text-muted mt-1">Users</p>
              <p className="text-xs text-blue-400 mt-0.5">{ov?.users?.providers ?? 0} active providers</p>
            </Link>
            <Link href="/admin/listings" className="glass-card p-5 bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/20 hover:scale-[1.02] transition-all block">
              <p className="text-2xl font-black text-white">{ov?.listings?.active ?? "—"}</p>
              <p className="text-sm text-text-muted mt-1">Active Listings</p>
              <p className="text-xs text-yellow-400 mt-0.5">{ov?.listings?.pending ?? 0} pending approval</p>
            </Link>
            <Link href="/admin/verificacao" className="glass-card p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 border-yellow-500/20 hover:scale-[1.02] transition-all block">
              <p className="text-2xl font-black text-white">{aq?.pendingVerificationsCount ?? "—"}</p>
              <p className="text-sm text-text-muted mt-1">Pending Verifications</p>
              <p className="text-xs text-yellow-400 mt-0.5">{aq?.pendingReviewsCount ?? 0} pending reviews</p>
            </Link>
            <Link href="/admin/financeiro" className="glass-card p-5 bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20 hover:scale-[1.02] transition-all block">
              <p className="text-2xl font-black text-white">{ov?.financial?.totalCreditsInSystem ?? "—"}</p>
              <p className="text-sm text-text-muted mt-1">Credits in System</p>
              <p className="text-xs text-primary mt-0.5">${(ov?.financial?.totalRevenue ?? 0).toFixed(2)} total revenue</p>
            </Link>
          </div>
        )}
      </div>

      {/* Action Queue — only show if there's pending work */}
      {!sysLoading && ((aq?.pendingVerificationsCount ?? 0) > 0 || (aq?.pendingReviewsCount ?? 0) > 0) && (
        <div className="glass-card p-5 border-yellow-500/20 bg-yellow-500/5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-yellow-400">⚡</span> Action Required
          </h3>
          <div className="space-y-2">
            {(aq?.pendingVerificationsCount ?? 0) > 0 && (
              <Link href="/admin/verificacao" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <span className="text-white/80 text-sm">Verifications awaiting approval</span>
                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full">{aq.pendingVerificationsCount}</span>
              </Link>
            )}
            {(aq?.pendingReviewsCount ?? 0) > 0 && (
              <Link href="/admin/reviews" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <span className="text-white/80 text-sm">Reviews awaiting moderation</span>
                <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{aq.pendingReviewsCount}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-white font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard icon="👥" title="User Management" description="Manage providers and clients" href="/admin/users" />
          <ActionCard icon="📋" title="Listings" description="Approve and moderate listings" href="/admin/listings" />
          <ActionCard icon="💰" title="Financial" description="Credits, transactions and escrow" href="/admin/financeiro" />
          <ActionCard icon="📧" title="Communication" description="Send notifications to users" href="/admin/comunicacao" />
        </div>
      </div>
    </div>
  );
}

function AlertBanner({ urgentNotifs, totalNotifs }) {
  if (urgentNotifs === 0 && totalNotifs === 0) return null;

  const hasUrgent = urgentNotifs > 0;

  return (
    <Link
      href="/myaccount/notifications"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mt-3 transition-all hover:scale-[1.01] ${
        hasUrgent
          ? "bg-red-500/10 border-red-500/30 text-red-300"
          : "bg-accent/8 border-accent/20 text-white/80"
      }`}
    >
      <span className={`text-base flex-shrink-0 ${hasUrgent ? "animate-pulse" : ""}`}>
        {hasUrgent ? "🚨" : "🔔"}
      </span>
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span>You have</span>
        {hasUrgent && (
          <span className="font-bold text-red-300">
            {urgentNotifs} urgent notification{urgentNotifs > 1 ? "s" : ""} requiring immediate attention
          </span>
        )}
        {!hasUrgent && (
          <span className="font-bold text-white">
            {totalNotifs} unread notification{totalNotifs > 1 ? "s" : ""}
          </span>
        )}
        <span className="opacity-60">— click to view</span>
      </p>
      <svg className="w-4 h-4 opacity-50 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default function MyAccountDashboard() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalFavorites: 0,
    creditsBalance: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState({ urgentNotifs: 0, totalNotifs: 0 });

  const isProvider = session?.user?.role === "provider";

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [userRes, creditsRes, listingsRes, favRes, notifsRes, reviewsRes] = await Promise.allSettled([
        fetch(`/api/user/${session.user.id}`),
        fetch(`/api/credits?userId=${session.user.id}`),
        fetch("/myaccount/api/listings"),
        fetch("/myaccount/api/favorites"),
        fetch("/api/notifications?limit=50"),
        fetch("/myaccount/api/reviews"),
      ]);

      if (userRes.status === "fulfilled" && userRes.value.ok) {
        const d = await userRes.value.json();
        setUserData(d.user);
      }
      if (creditsRes.status === "fulfilled" && creditsRes.value.ok) {
        const d = await creditsRes.value.json();
        setStats((p) => ({ ...p, creditsBalance: d.balance || 0 }));
      }
      if (listingsRes.status === "fulfilled" && listingsRes.value.ok) {
        const d = await listingsRes.value.json();
        const listings = d.listings || [];
        setStats((p) => ({
          ...p,
          totalListings: listings.length,
          activeListings: listings.filter((l) => l.isApproved).length,
        }));
      }
      if (favRes.status === "fulfilled" && favRes.value.ok) {
        const d = await favRes.value.json();
        setStats((p) => ({ ...p, totalFavorites: d.favorites?.length || 0 }));
      }
      if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
        const d = await reviewsRes.value.json();
        setStats((p) => ({
          ...p,
          totalReviews: d.stats?.total || 0,
          averageRating: d.stats?.averageRating || 0,
        }));
      }

      // Alerts: unread notifications
      let urgentNotifs = 0, totalNotifs = 0;
      if (notifsRes.status === "fulfilled" && notifsRes.value.ok) {
        const d = await notifsRes.value.json();
        totalNotifs = d.unreadCount || 0;
        urgentNotifs = (d.notifications || []).filter(n => !n.isRead && n.type === "error").length;
      }
      setAlerts({ urgentNotifs, totalNotifs });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]); // Safely depend on ID

  useEffect(() => {
    if (session?.user?.role === "admin") {
      setLoading(false);
      // Fetch alerts for admin too
      fetch("/api/notifications?limit=50")
        .then(r => r.json())
        .then(d => {
          const totalNotifs = d.unreadCount || 0;
          const urgentNotifs = (d.notifications || []).filter(n => !n.isRead && n.type === "error").length;
          setAlerts({ urgentNotifs, totalNotifs });
        })
        .catch(() => {});
      return;
    }
    if (session?.user?.id) {
      fetchDashboardData();
    } else if (session === null) {
      // Session loaded but no user — unauthenticated, stop loading
      setLoading(false);
    }
  }, [session, fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 glass-card rounded-2xl bg-white/5"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 glass-card rounded-2xl bg-white/5"></div>
          ))}
        </div>
        <div className="h-40 glass-card rounded-2xl bg-white/5"></div>
      </div>
    );
  }

  if (session?.user?.role === "admin") {
    return <AdminDashboard session={session} alerts={alerts} />;
  }

  return isProvider ? (
    <ProviderDashboard session={session} stats={stats} userData={userData} alerts={alerts} />
  ) : (
    <ClientDashboard session={session} stats={stats} alerts={alerts} />
  );
}