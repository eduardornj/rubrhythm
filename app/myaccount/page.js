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

// Boost Service Card with CTA
function BoostCard({ icon, title, subtitle, impact, cost, costLabel, href, gradient, popular = false }) {
  return (
    <Link href={href} className={`relative glass-card p-5 bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-all block group overflow-hidden`}>
      {popular && (
        <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-base">{title}</h4>
          <p className="text-white/60 text-xs mt-0.5">{subtitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span className="text-green-400 text-xs font-semibold">{impact}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <div>
          <span className="text-white font-black text-lg">{cost}</span>
          <span className="text-white/40 text-xs ml-1">{costLabel}</span>
        </div>
        <span className="bg-white/10 group-hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
          Activate Now
        </span>
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
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              ) : (
                <Link
                  href="/myaccount/verification"
                  className="flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full hover:bg-yellow-500/25 transition-colors animate-pulse"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  Get Verified — Free
                </Link>
              )}
            </div>
            <p className="text-text-muted text-sm">Provider Account · {session?.user?.email}</p>
            <AlertBanner {...alerts} />
          </div>
        </div>
      </div>

      {/* Welcome Bonus Banner — shows when provider has credits but no listings */}
      {stats.totalListings === 0 && stats.creditsBalance >= 10 && (
        <Link href="/myaccount/listings/add-listing" className="glass-card p-5 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 flex items-center gap-4 hover:border-green-500/50 transition-all block animate-fade-in">
          <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎁</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">You have ${stats.creditsBalance} in free credits!</p>
            <p className="text-green-300/70 text-sm">Your welcome bonus is ready. Create your first listing for just 10 credits and start connecting with clients today.</p>
          </div>
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex-shrink-0 shadow-lg shadow-green-500/20">
            Create Listing
          </span>
        </Link>
      )}

      {/* Stats Grid */}
      <div>
        <h2 className="text-white font-semibold mb-4">Your Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📋" label="My Listings" value={stats.totalListings} sub={`${stats.activeListings} live & approved`} href="/myaccount/listings" color="primary" />
          <StatCard
            icon="💰"
            label="Credit Balance"
            value={stats.creditsBalance}
            sub={stats.creditsBalance < 5 ? "Low balance!" : "Ready to boost"}
            href="/myaccount/credits"
            color={stats.creditsBalance < 5 ? "yellow" : "accent"}
          />
          <StatCard icon="⭐" label="Reviews" value={stats.totalReviews || 0} sub={stats.averageRating > 0 ? `${stats.averageRating}/5 average` : "Ask clients for reviews"} href="/myaccount/reviews" color="yellow" />
          <StatCard
            icon="👁️"
            label="Profile Views"
            value={stats.totalViews || 0}
            sub="Total views across all listings"
            href="/myaccount/listings"
            color="green"
          />
        </div>
      </div>

      {/* Low Credits Warning */}
      {stats.creditsBalance < 10 && (
        <Link href="/myaccount/credits/buy" className="glass-card p-5 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex items-center gap-4 hover:border-amber-500/50 transition-all block">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">Your credit balance is low</p>
            <p className="text-amber-300/70 text-sm">Top up now to keep your listings visible. Credits never expire.</p>
          </div>
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex-shrink-0 shadow-lg shadow-amber-500/20">
            Buy Credits
          </span>
        </Link>
      )}

      {/* Verification CTA */}
      {!isVerified && (
        <Link href="/myaccount/verification" className="glass-card p-5 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 flex items-center gap-4 hover:border-blue-500/50 transition-all block">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">Get Verified — It&apos;s Free</p>
            <p className="text-blue-300/70 text-sm">Verified providers get <span className="text-blue-300 font-semibold">3x more contact requests</span> and appear higher in search results.</p>
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex-shrink-0 shadow-lg shadow-blue-500/20">
            Verify Now
          </span>
        </Link>
      )}

      {/* Boost Services — Main Revenue CTAs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Boost Your Visibility</h2>
          <Link href="/myaccount/credits" className="text-primary text-xs font-semibold hover:text-primary/80 transition-colors">
            {stats.creditsBalance} credits available →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BoostCard
            icon={<svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            title="Bump Up"
            subtitle="Jump to the top of search results instantly"
            impact="Up to 5x more profile views in 24 hours"
            cost="5"
            costLabel="credits"
            href="/myaccount/listings/bump-up"
            gradient="from-violet-500/10 to-purple-500/5 border-violet-500/20"
          />
          <BoostCard
            icon={<svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
            title="Highlight"
            subtitle="Stand out with a glowing colored border"
            impact="2x more clicks than standard listings"
            cost="10"
            costLabel="credits / 7 days"
            href="/myaccount/listings/highlight"
            gradient="from-yellow-500/10 to-amber-500/5 border-yellow-500/20"
          />
          <BoostCard
            icon={<svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            title="Feature Your Listing"
            subtitle="Premium badge + priority in all searches"
            impact="10x more visibility — top of every page"
            cost="25"
            costLabel="credits / 30 days"
            href="/myaccount/listings/feature"
            gradient="from-amber-500/10 to-orange-500/5 border-amber-500/20"
            popular
          />
          <BoostCard
            icon={<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Available Now"
            subtitle="Show clients you&apos;re ready right now"
            impact="Pulsing green badge — urgent visibility boost"
            cost="Free"
            costLabel="2h active"
            href="/myaccount/listings"
            gradient="from-green-500/10 to-emerald-500/5 border-green-500/20"
          />
        </div>
      </div>

      {/* Buy Credits CTA */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 text-center">
        <h3 className="text-white font-bold text-lg mb-2">Power Up Your Profile</h3>
        <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">
          Credits are the fuel for your business. Buy once, use anytime. 1 credit = $1. Credits never expire.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          {[
            { amount: 10, bonus: null },
            { amount: 25, bonus: "+2 free" },
            { amount: 50, bonus: "+5 free" },
            { amount: 100, bonus: "+20 free" },
          ].map((pkg) => (
            <div key={pkg.amount} className={`relative glass-card px-4 py-3 text-center ${pkg.bonus ? "border-primary/30" : "border-white/10"}`}>
              <p className="text-white font-black text-xl">${pkg.amount}</p>
              <p className="text-text-muted text-xs">{pkg.amount} credits</p>
              {pkg.bonus && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {pkg.bonus}
                </span>
              )}
            </div>
          ))}
        </div>
        <Link href="/myaccount/credits/buy" className="inline-block bg-gradient-to-r from-primary to-accent text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
          Buy Credits Now
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-4">Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard icon="➕" title="Create New Listing" description="Post your profile in a new city" href="/myaccount/listings/add-listing" highlight />
          <ActionCard icon="📋" title="My Listings" description={`${stats.totalListings} listings · ${stats.activeListings} approved`} href="/myaccount/listings" />
          <ActionCard icon="⭐" title="My Reviews" description={`${stats.totalReviews} reviews · ${stats.averageRating > 0 ? stats.averageRating + "/5 avg" : "Ask clients for reviews"}`} href="/myaccount/reviews" />
          <ActionCard icon="🎁" title="Refer & Earn" description="Get 10 free credits per referral" href="/myaccount/referral" />
        </div>
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

      {/* Welcome Bonus Banner — shows when client has credits from welcome bonus */}
      {(stats?.creditsBalance || 0) > 0 && (stats?.totalFavorites || 0) === 0 && (
        <Link href="/view-cities" className="glass-card p-5 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 flex items-center gap-4 hover:border-green-500/50 transition-all block animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎁</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">You have ${stats?.creditsBalance || 0} in free credits!</p>
            <p className="text-green-300/70 text-sm">Use them to message verified providers. Start browsing now.</p>
          </div>
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex-shrink-0 shadow-lg shadow-green-500/20">
            Browse Providers
          </span>
        </Link>
      )}

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
            <Link href="/admin/verificação" className="glass-card p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 border-yellow-500/20 hover:scale-[1.02] transition-all block">
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
              <Link href="/admin/verificação" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
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
          <ActionCard icon="📧" title="Communication" description="Send notifications to users" href="/admin/comunicação" />
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
    totalViews: 0,
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
          totalViews: listings.reduce((sum, l) => sum + (l.viewCount || 0), 0),
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