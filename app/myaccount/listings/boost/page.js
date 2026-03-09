"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFirstListingImage } from "@/lib/image-utils";

const PRODUCTS = [
  {
    id: "available-now",
    name: "Available Now",
    tagline: "Show you're online right now",
    description: "A pulsing green badge appears on your listing card and profile for 6 hours, letting clients know you're ready to take appointments immediately. Great for filling last-minute openings.",
    color: "green",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/></svg>
    ),
    pricing: [{ label: "6 Hours", cost: 3 }],
    action: "activate",
    requiresVerification: false,
    benefits: ["Green pulsing badge on card", "Visible on profile page", "Lasts 6 hours", "Instant activation"],
  },
  {
    id: "bump-up",
    name: "Bump Up",
    tagline: "Jump back to the top of search",
    description: "Refreshes your listing timestamp so it appears at the very top of search results in your city, as if it was just posted. Stays on top until a new listing is posted in your city.",
    color: "blue",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
    ),
    pricing: [{ label: "One-time", cost: 5 }],
    href: "bump-up",
    requiresVerification: false,
    benefits: ["Instant top placement", "Stays until a new listing is posted", "More clicks guaranteed", "Works immediately"],
  },
  {
    id: "auto-bump",
    name: "Auto-Bump",
    tagline: "Automatic daily top placement",
    description: "Set it and forget it. Your listing automatically bumps to the top of search results every day at your chosen hour. Credits are charged daily. Cancel anytime from your dashboard.",
    color: "cyan",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
    ),
    pricing: [{ label: "Per Day", cost: 5 }],
    href: "auto-bump",
    requiresVerification: false,
    benefits: ["Auto bumps daily at your chosen hour", "5 credits charged per day", "Cancel anytime", "Never miss peak hours"],
  },
  {
    id: "highlight",
    name: "Highlight",
    tagline: "Stand out with visual effects",
    description: "Your listing gets a colored border glow and a 'Highlighted' badge, making it visually pop among regular listings. Proven to increase click-through rate by up to 3x.",
    color: "yellow",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    ),
    pricing: [{ label: "7 Days", cost: 15 }],
    href: "highlight",
    requiresVerification: false,
    benefits: ["Colored border glow", "'Highlighted' badge", "3x more clicks", "Lasts 7 days"],
  },
  {
    id: "feature-basic",
    name: "Feature",
    tagline: "Appear in the Featured section",
    description: "Your listing is shown in the exclusive Featured carousel at the top of your city page. Rotates with other featured providers. Open to all providers, no verification needed.",
    color: "amber",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
    ),
    pricing: [
      { label: "7 Days", cost: 15 },
      { label: "30 Days", cost: 45 },
    ],
    href: "feature",
    tierParam: "BASIC",
    requiresVerification: false,
    badge: "Open to All",
    badgeColor: "amber",
    benefits: ["Featured carousel placement", "Priority 2 in rotation", "37% rotation weight", "Badge on listing card"],
  },
  {
    id: "feature-premium",
    name: "Feature Premium",
    tagline: "Maximum visibility & priority",
    description: "The ultimate promotion. Your listing gets top priority in the Featured carousel with 63% rotation weight, a premium purple banner across your card, and maximum exposure. Exclusive to verified accounts.",
    color: "purple",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
    ),
    pricing: [
      { label: "7 Days", cost: 20 },
      { label: "30 Days", cost: 60 },
    ],
    href: "feature",
    tierParam: "PREMIUM",
    requiresVerification: true,
    badge: "VIP Only",
    badgeColor: "purple",
    benefits: ["#1 priority placement", "63% rotation weight", "Premium purple banner", "Maximum exposure"],
  },
];

const COLOR_MAP = {
  green: {
    bg: "bg-green-500/10", border: "border-green-500/20", hoverBorder: "hover:border-green-500/50",
    text: "text-green-400", glow: "bg-green-500/5", hoverGlow: "group-hover:bg-green-500/15",
    btn: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40 text-green-300",
    shadow: "shadow-[0_0_30px_rgba(34,197,94,0.15)]",
  },
  blue: {
    bg: "bg-blue-500/10", border: "border-blue-500/20", hoverBorder: "hover:border-blue-500/50",
    text: "text-blue-400", glow: "bg-blue-500/5", hoverGlow: "group-hover:bg-blue-500/15",
    btn: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/40 text-blue-300",
    shadow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  },
  yellow: {
    bg: "bg-yellow-500/10", border: "border-yellow-500/20", hoverBorder: "hover:border-yellow-500/50",
    text: "text-yellow-400", glow: "bg-yellow-500/5", hoverGlow: "group-hover:bg-yellow-500/10",
    btn: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20 hover:border-yellow-500/40 text-yellow-300",
    shadow: "shadow-[0_0_30px_rgba(234,179,8,0.15)]",
  },
  amber: {
    bg: "bg-amber-500/10", border: "border-amber-500/20", hoverBorder: "hover:border-amber-500/50",
    text: "text-amber-400", glow: "bg-amber-500/5", hoverGlow: "group-hover:bg-amber-500/15",
    btn: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 hover:border-amber-500/40 text-amber-300",
    shadow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
  cyan: {
    bg: "bg-cyan-500/10", border: "border-cyan-500/20", hoverBorder: "hover:border-cyan-500/50",
    text: "text-cyan-400", glow: "bg-cyan-500/5", hoverGlow: "group-hover:bg-cyan-500/15",
    btn: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300",
    shadow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  },
  purple: {
    bg: "bg-purple-500/10", border: "border-purple-500/20", hoverBorder: "hover:border-purple-500/50",
    text: "text-purple-400", glow: "bg-purple-500/10", hoverGlow: "group-hover:bg-purple-500/20",
    btn: "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 hover:border-purple-500/50 text-purple-300",
    shadow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  },
};

export default function BoostHubPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BoostHubPage />
    </Suspense>
  );
}

function BoostHubPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');

  const [listing, setListing] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [activatingAvailable, setActivatingAvailable] = useState(false);

  useEffect(() => {
    if (session?.user?.id && listingId) {
      fetchData();
    } else if (!listingId) {
      router.push('/myaccount/listings');
    }
  }, [session, listingId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [listingRes, creditsRes] = await Promise.all([
        fetch(`/api/listings/${listingId}`),
        fetch(`/api/credits?userId=${session.user.id}`),
      ]);

      if (listingRes.ok) {
        const listingData = await listingRes.json();
        const l = listingData.listing || listingData;
        setListing(l);
        setIsVerified(l.user?.verified === true);
      } else {
        router.push('/myaccount/listings');
        return;
      }

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setBalance(creditsData.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAvailableNow = async () => {
    if (balance < 3) {
      alert('Insufficient credits. You need 3 credits to activate Available Now.');
      return;
    }
    if (!confirm('Activate "Available Now" for 6 hours?\n\nCost: 3 credits')) return;

    try {
      setActivatingAvailable(true);
      const res = await fetch(`/api/listing/${listingId}/available`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: true }),
      });

      if (res.ok) {
        alert('Available Now activated for 6 hours!');
        setBalance(prev => prev - 3);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to activate.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setActivatingAvailable(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-4" />
        <p className="text-white/40 animate-pulse font-medium">Loading boost options...</p>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="max-w-[1200px] w-full mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header with listing info + balance */}
      <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center gap-6 z-10">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-black/40 flex-shrink-0">
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={getFirstListingImage(listing.images) || ''}
                alt={listing.title}
                fill
                className="object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
          <div>
            <span className="text-primary font-bold text-xs tracking-widest uppercase mb-1 block">Boost Your Listing</span>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              Promotion Hub
            </h1>
            <p className="text-white/50 text-sm font-medium mt-1">
              Choose a promotion for <strong className="text-white">"{listing.title}"</strong>
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[200px] z-10 w-full md:w-auto">
          <span className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Your Balance</span>
          <div className="text-3xl font-black text-yellow-400 font-mono tracking-tight">{balance} credits</div>
          <Link href="/myaccount/credits/buy" className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest mt-2 border-b border-white/20 hover:border-white transition-all">
            Buy more credits
          </Link>
        </div>
      </div>

      {/* Verification notice */}
      {!isVerified && (
        <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <h3 className="text-blue-400 font-bold text-base">Get Verified for Premium Access</h3>
              <p className="text-blue-300/70 text-sm">Feature Premium is exclusive to verified providers. Verify to unlock top-priority placement.</p>
            </div>
          </div>
          <Link href="/myaccount/get-verified" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl whitespace-nowrap transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 text-sm">
            Get Verified
          </Link>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-white">Choose Your Promotion</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => {
            const c = COLOR_MAP[product.color];
            const isLocked = product.requiresVerification && !isVerified;

            return (
              <div
                key={product.id}
                className={`bg-[#0d0d15] rounded-3xl p-6 border ${c.border} ${c.hoverBorder} transition-all group relative overflow-hidden flex flex-col ${isLocked ? 'opacity-60' : ''} ${c.shadow}`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${c.glow} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${c.hoverGlow} transition-all pointer-events-none`} />

                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-6 right-6 ${product.badgeColor === 'purple' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : `${c.bg} ${c.text} border ${c.border}`} text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                    {product.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 ${c.bg} rounded-2xl border ${c.border} flex items-center justify-center ${c.text} mb-5 group-hover:scale-110 transition-transform`}>
                  {product.icon}
                </div>

                {/* Title & description */}
                <h3 className="text-xl font-black text-white mb-1">{product.name}</h3>
                <p className={`text-sm font-semibold ${c.text} mb-3`}>{product.tagline}</p>
                <p className="text-white/40 text-sm leading-relaxed mb-4 flex-1">{product.description}</p>

                {/* Benefits */}
                <div className="space-y-1.5 mb-5">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                      <svg className={`w-3.5 h-3.5 ${c.text} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      {b}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex flex-col gap-2 mb-5">
                  {product.pricing.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-white/50 text-xs font-bold uppercase tracking-wider">{p.label}</span>
                      <span className="text-lg font-black text-yellow-400 font-mono">{p.cost} credits</span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                {isLocked ? (
                  <Link href="/myaccount/get-verified" className="w-full text-center px-6 py-3 bg-black/40 border border-white/10 text-white/40 font-bold rounded-xl transition-all block hover:border-blue-500/30 hover:text-blue-400">
                    Requires Verification
                  </Link>
                ) : product.action === "activate" ? (
                  <button
                    onClick={handleActivateAvailableNow}
                    disabled={activatingAvailable}
                    className={`w-full text-center px-6 py-3 border font-bold rounded-xl transition-all ${c.btn} ${activatingAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {activatingAvailable ? 'Activating...' : 'Activate Now'}
                  </button>
                ) : (
                  <Link
                    href={product.id === "auto-bump" ? `/myaccount/listings/auto-bump` : `/myaccount/listings/${product.href}?id=${listingId}${product.tierParam ? `&tier=${product.tierParam}` : ''}`}
                    className={`w-full text-center px-6 py-3 border font-bold rounded-xl transition-all block ${c.btn}`}
                  >
                    {product.id === "auto-bump" ? "Configure Auto-Bump" : `Select ${product.name}`}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison summary */}
      <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10">
        <h3 className="text-lg font-black text-white mb-4">Quick Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left py-3 pr-4">Promotion</th>
                <th className="text-center py-3 px-2">Cost</th>
                <th className="text-center py-3 px-2">Duration</th>
                <th className="text-center py-3 px-2">Effect</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-bold text-green-400">Available Now</td>
                <td className="text-center py-3 px-2">3 credits</td>
                <td className="text-center py-3 px-2">6 hours</td>
                <td className="text-center py-3 px-2">Green pulsing badge</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-bold text-blue-400">Bump Up</td>
                <td className="text-center py-3 px-2">5 credits</td>
                <td className="text-center py-3 px-2">Until next listing</td>
                <td className="text-center py-3 px-2">Top of search results</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-bold text-cyan-400">Auto-Bump</td>
                <td className="text-center py-3 px-2">5 credits/day</td>
                <td className="text-center py-3 px-2">Daily (recurring)</td>
                <td className="text-center py-3 px-2">Auto top placement</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-bold text-yellow-400">Highlight</td>
                <td className="text-center py-3 px-2">15 credits</td>
                <td className="text-center py-3 px-2">7 days</td>
                <td className="text-center py-3 px-2">Colored border + badge</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-bold text-amber-400">Feature</td>
                <td className="text-center py-3 px-2">15-45 credits</td>
                <td className="text-center py-3 px-2">7-30 days</td>
                <td className="text-center py-3 px-2">Featured carousel</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-purple-400">Feature Premium</td>
                <td className="text-center py-3 px-2">20-60 credits</td>
                <td className="text-center py-3 px-2">7-30 days</td>
                <td className="text-center py-3 px-2">Top carousel + banner</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
