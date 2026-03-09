"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFirstListingImage } from "@/lib/image-utils";

// ── Helpers ───────────────────────────────────────────────────────
function formatTimeLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (d > 0) return `${d}d ${h}h remaining`;
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

// ── Tier configs (prices from lib/feature-pricing.js) ─────────────
const TIERS = {
  feature: {
    key: "feature",
    label: "Feature",
    emoji: "⭐",
    tagline: "Highlighted placement in the regular Featured section",
    packages: [
      { key: "7d", days: 7, credits: 15, label: "7 Days" },
      { key: "30d", days: 30, credits: 45, label: "30 Days", badge: "Best Value" },
    ],
    accentColor: "from-amber-500 to-orange-500",
    bgGlow: "rgba(245,158,11,0.15)",
    borderActive: "border-amber-500",
    bgActive: "bg-amber-500/10",
    textActive: "text-amber-400",
    requiresVerification: false,
    apiEndpoint: "/api/listing/feature",
    apiTierValue: "BASIC",
    description: [
      "Appears in the Featured section on city pages",
      "37% rotation weight among Featured listings",
      "⭐ Featured badge on your listing card",
      "Available to all providers",
    ],
  },
  premium: {
    key: "premium",
    label: "Feature Premium",
    emoji: "💎",
    tagline: "Top-priority placement — the most visible spot on the platform",
    packages: [
      { key: "7d", days: 7, credits: 20, label: "7 Days" },
      { key: "30d", days: 30, credits: 60, label: "30 Days", badge: "Best Value" },
    ],
    accentColor: "from-violet-500 to-fuchsia-600",
    bgGlow: "rgba(139,92,246,0.2)",
    borderActive: "border-violet-500",
    bgActive: "bg-violet-500/10",
    textActive: "text-violet-400",
    requiresVerification: true,
    apiEndpoint: "/api/listing/feature",
    apiTierValue: "PREMIUM",
    description: [
      "Top banner rotation — maximum visibility",
      "Premium Featured badge (💎) on your card",
      "63% rotation weight — priority over standard",
      "Requires Verified account ✅",
    ],
  },
};

export default function FeatureListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <FeatureListings />
    </Suspense>
  );
}

function FeatureListings() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("id");
  const preselectedTier = searchParams.get("tier") === "premium" ? "premium" : "feature";

  const [activeTier, setActiveTier] = useState(preselectedTier);
  const [selectedPackageKey, setSelectedPackageKey] = useState("30d");
  const [listings, setListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [success, setSuccess] = useState(null);
  const [autoRenew, setAutoRenew] = useState(false);

  const tier = TIERS[activeTier];
  const pkg = tier.packages.find(p => p.key === selectedPackageKey) || tier.packages[1];
  const totalCost = selectedListings.size * pkg.credits;
  const canAfford = totalCost <= credits;
  const canUse = !tier.requiresVerification || isVerified;

  useEffect(() => {
    if (session?.user?.id) fetchData();
  }, [session]);

  useEffect(() => {
    if (preselectedId && listings.length > 0) {
      const found = listings.find(l => l.id === preselectedId);
      if (found) setSelectedListings(new Set([preselectedId]));
    }
  }, [preselectedId, listings]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, credRes] = await Promise.all([
        fetch("/myaccount/api/listings"),
        fetch(`/api/credits?userId=${session.user.id}`),
      ]);

      const listData = await listRes.json();
      const credData = await credRes.json();

      const approved = (listData.listings || []).filter(l => l.isApproved);
      setListings(approved);
      setCredits(credData.balance || 0);

      // Check verification from listing user data
      const firstListing = (listData.listings || [])[0];
      if (firstListing?.user?.verified) {
        setIsVerified(true);
      }
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleListing = (id) => {
    setSelectedListings(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFeature = async () => {
    if (!canUse) return;
    if (totalCost > credits) {
      setError(`Insufficient credits. You need ${totalCost} credits but only have ${credits}.`);
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const res = await fetch(tier.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingIds: Array.from(selectedListings),
          duration: pkg.days,
          tier: tier.apiTierValue,
          autoRenew,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to feature listings");
      }

      setSuccess(`${tier.emoji} ${selectedListings.size} listing(s) ${tier.label === "Feature Premium" ? "Premium Featured" : "Featured"} for ${pkg.days} days!`);
      setSelectedListings(new Set());
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-amber-500 animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">Loading Feature module...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full space-y-8 animate-fade-in pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Feature Listings</h1>
          <p className="text-text-muted mt-1">Choose your promotion tier and boost your listing's visibility.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Credits</p>
            <p className="text-2xl font-black text-white leading-none">{credits}</p>
          </div>
          <Link href="/myaccount/credits/buy" className="px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/80 transition-colors">
            + Buy
          </Link>
        </div>
      </div>

      {/* ── Tier Tabs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(TIERS).map((t) => {
          const active = activeTier === t.key;
          const locked = t.requiresVerification && !isVerified;
          return (
            <button
              key={t.key}
              onClick={() => { if (!locked) setActiveTier(t.key); }}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${active
                  ? `${t.borderActive} ${t.bgActive} shadow-[0_0_30px_${t.bgGlow}]`
                  : locked
                    ? "border-white/10 bg-white/3 opacity-60 cursor-not-allowed"
                    : "border-white/10 bg-black/20 hover:border-white/30 hover:bg-white/5 cursor-pointer"
                }`}
            >
              {active && (
                <div className="absolute top-0 right-0 w-40 h-40 blur-3xl rounded-full pointer-events-none -mr-10 -mt-10"
                  style={{ background: t.bgGlow }} />
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{t.emoji}</span>
                  {active && (
                    <span className={`text-xs font-black px-2 py-1 rounded-full bg-gradient-to-r ${t.accentColor} text-white`}>
                      SELECTED
                    </span>
                  )}
                  {locked && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/10 text-white/40">
                      🔒 Verified Only
                    </span>
                  )}
                </div>
                <h3 className={`text-xl font-black mb-1 ${active ? "text-white" : "text-gray-300"}`}>
                  {t.label}
                </h3>
                <p className="text-text-muted text-sm mb-4">{t.tagline}</p>
                <ul className="space-y-1.5">
                  {t.description.map((d, i) => (
                    <li key={i} className={`text-xs flex items-start gap-2 ${active ? t.textActive : "text-text-muted"}`}>
                      <span className="mt-0.5 flex-shrink-0">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                {locked && (
                  <Link
                    href="/myaccount/verification"
                    onClick={e => e.stopPropagation()}
                    className="mt-4 inline-block text-xs font-bold text-violet-400 underline hover:text-violet-300"
                  >
                    Get Verified to unlock →
                  </Link>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Package selector for active tier ── */}
      {canUse && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Select Duration</h3>
          <div className="grid grid-cols-2 gap-4">
            {tier.packages.map((p) => {
              const sel = selectedPackageKey === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPackageKey(p.key)}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${sel ? `${tier.borderActive} ${tier.bgActive}` : "border-white/10 bg-black/20 hover:border-white/30"
                    }`}
                >
                  {p.badge && (
                    <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.accentColor} text-white`}>
                      {p.badge}
                    </span>
                  )}
                  <p className={`text-xl font-black ${sel ? "text-white" : "text-gray-300"}`}>{p.label}</p>
                  <p className={`text-3xl font-black mt-1 ${sel ? tier.textActive : "text-gray-400"}`}>
                    {p.credits} <span className="text-sm font-semibold text-text-muted">credits</span>
                  </p>
                  <p className="text-text-muted text-xs mt-1">Per listing</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Auto-Renew Toggle ── */}
      {canUse && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={autoRenew}
                onClick={() => setAutoRenew(!autoRenew)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenew ? "bg-gradient-to-r " + tier.accentColor : "bg-white/20"}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${autoRenew ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Auto-renew when expired</p>
              {autoRenew ? (
                <p className="text-amber-400 text-xs mt-1 font-semibold">
                  Auto-renewal is ON. You will be automatically charged {pkg.credits} credits per listing when your {tier.label.toLowerCase()} expires. Turn off anytime.
                </p>
              ) : (
                <p className="text-text-muted text-xs mt-1">
                  Your listing will be automatically re-featured and charged when it expires. You can turn this off anytime.
                </p>
              )}
            </div>
          </label>
        </div>
      )}

      {/* ── Listing picker ── */}
      {canUse && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* toolbar */}
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-bold">Select Listings</h3>
              <button
                onClick={() =>
                  setSelectedListings(
                    selectedListings.size === listings.length
                      ? new Set()
                      : new Set(listings.map(l => l.id))
                  )
                }
                className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {selectedListings.size === listings.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            {selectedListings.size > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-text-muted">Total</p>
                  <p className={`text-xl font-black ${canAfford ? tier.textActive : "text-red-400"}`}>
                    {totalCost} credits
                  </p>
                </div>
                <button
                  disabled={processing || !canAfford}
                  onClick={handleFeature}
                  className={`px-6 py-2.5 font-bold rounded-xl transition-all ${processing || !canAfford
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : `bg-gradient-to-r ${tier.accentColor} text-white hover:scale-105 shadow-lg`
                    }`}
                >
                  {processing ? "Processing..." : `Confirm ${tier.label}`}
                </button>
              </div>
            )}
          </div>

          {/* list */}
          {listings.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-white font-bold text-lg mb-2">No eligible listings</p>
              <p className="text-text-muted text-sm mb-6">You don't have any approved listings available.</p>
              <Link href="/myaccount/listings" className="btn-primary inline-block">Manage Listings</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {listings.map((listing) => {
                const checked = selectedListings.has(listing.id);
                const isCurrentlyFeatured = listing.isFeatured && listing.featuredEndDate && new Date(listing.featuredEndDate) > new Date();
                const featureTimeLeft = isCurrentlyFeatured ? formatTimeLeft(listing.featuredEndDate) : null;
                const isPremiumTier = listing.featureTier?.toUpperCase() === "PREMIUM";

                return (
                  <div
                    key={listing.id}
                    onClick={() => toggleListing(listing.id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                      isCurrentlyFeatured && !checked
                        ? "bg-amber-500/5 border-l-2 border-amber-500/30"
                        : checked ? `${tier.bgActive} border-l-2 ${tier.borderActive}` : "hover:bg-white/[0.03]"
                      }`}
                  >
                    {/* checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? `${tier.borderActive} bg-gradient-to-r ${tier.accentColor}` : "border-white/30"
                      }`}>
                      {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>

                    {/* thumb */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 relative">
                      {(() => {
                        const url = getFirstListingImage(listing.images);
                        return url
                          ? <Image src={url} alt={listing.title} fill className="object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">IMG</div>;
                      })()}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {checked && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r ${tier.accentColor} text-white`}>
                            {tier.emoji} WILL {tier.key === "premium" ? "PREMIUM FEATURE" : "FEATURE"}
                          </span>
                        )}
                        <p className={`font-bold truncate ${checked ? "text-white" : "text-gray-200"}`}>{listing.title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5 flex-wrap">
                        <span>{listing.city || "—"}{listing.state ? `, ${listing.state}` : ""}</span>
                        {isCurrentlyFeatured && featureTimeLeft && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              {isPremiumTier ? "💎 Premium" : "⭐ Featured"} — {featureTimeLeft}
                            </span>
                          </>
                        )}
                        {listing.isFeatured && !isCurrentlyFeatured && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="text-red-400/70 font-semibold">Feature expired</span>
                          </>
                        )}
                        {listing.autoRenewFeatured && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="text-green-400 font-semibold text-xs">Auto-renew ON</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Feedback ── */}
      {error && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5 text-red-300 text-sm flex items-center gap-3">
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
        </div>
      )}
      {success && (
        <div className="glass-card p-4 border-green-500/20 bg-green-500/5 text-green-300 text-sm flex items-center gap-3">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-300">✕</button>
        </div>
      )}

      {/* ── Locked state for Premium ── */}
      {activeTier === "premium" && !isVerified && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-black text-white mb-2">Verification Required</h3>
          <p className="text-text-muted mb-6 max-w-sm mx-auto">
            Feature Premium is exclusive to Verified providers. Get verified to unlock the top placement spots.
          </p>
          <Link href="/myaccount/verification" className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg">
            Get Verified →
          </Link>
        </div>
      )}
    </div>
  );
}