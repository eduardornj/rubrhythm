"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getFirstListingImage } from "@/lib/image-utils";

const SERVICES = [
  {
    id: "available-now",
    name: "Available Now",
    tagline: "Show you're online right now",
    description: "A pulsing green badge appears on your listing card and profile for 6 hours, letting clients know you're ready to take appointments immediately.",
    color: "green",
    cost: "3 credits",
    duration: "6 hours",
    effect: "Green pulsing badge on card & profile",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/></svg>
    ),
    benefits: ["Instant green pulsing badge", "Visible on card & profile", "Lasts 6 hours", "Great for filling last-minute slots"],
  },
  {
    id: "bump-up",
    name: "Bump Up",
    tagline: "Jump back to the top of search",
    description: "Refreshes your listing timestamp so it appears at the very top of search results in your city, as if it was just posted. Stays on top until a new listing is posted.",
    color: "blue",
    cost: "5 credits",
    duration: "Until next new listing",
    effect: "Top of search results",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
    ),
    benefits: ["Instant top placement", "Stays until a new listing is posted", "More clicks guaranteed", "Perfect for peak hours"],
  },
  {
    id: "auto-bump",
    name: "Auto-Bump",
    tagline: "Automatic daily top placement",
    description: "Set it and forget it. Your listing automatically bumps to the top of search results every day at your chosen hour. Credits are charged daily — cancel anytime.",
    color: "cyan",
    cost: "5 credits/day",
    duration: "Daily (recurring)",
    effect: "Auto top placement every day",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
    ),
    benefits: ["Auto bumps daily at your chosen hour", "5 credits charged per day automatically", "Cancel anytime from dashboard", "Never miss peak hours again"],
  },
  {
    id: "highlight",
    name: "Highlight",
    tagline: "Stand out with visual effects",
    description: "Your listing gets a colored border glow and a 'Highlighted' badge, making it visually pop among regular listings. Up to 3x more clicks.",
    color: "yellow",
    cost: "15 credits",
    duration: "7 days",
    effect: "Colored border glow + badge",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    ),
    benefits: ["Yellow border glow effect", "'Highlighted' badge on card", "3x more clicks", "Lasts 7 days"],
  },
  {
    id: "feature",
    name: "Feature",
    tagline: "Appear in the Featured carousel",
    description: "Your listing is shown in the exclusive Featured carousel at the top of your city page. Open to all providers, no verification needed.",
    color: "amber",
    cost: "15-45 credits",
    duration: "7 or 30 days",
    effect: "Featured carousel placement",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
    ),
    benefits: ["Featured carousel at top of page", "37% rotation weight", "Badge on listing card", "Open to all providers"],
    pricingDetails: [
      { label: "7 Days", cost: 15 },
      { label: "30 Days", cost: 45 },
    ],
  },
  {
    id: "feature-premium",
    name: "Feature Premium",
    tagline: "Maximum visibility & priority",
    description: "Top priority in the Featured carousel with 63% rotation weight, a premium purple banner across your card, and maximum exposure. Verified accounts only.",
    color: "purple",
    cost: "20-60 credits",
    duration: "7 or 30 days",
    effect: "Top carousel + premium banner",
    requiresVerification: true,
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
    ),
    benefits: ["#1 priority placement", "63% rotation weight", "Purple premium banner on card", "Maximum exposure"],
    pricingDetails: [
      { label: "7 Days", cost: 20 },
      { label: "30 Days", cost: 60 },
    ],
  },
];

const COLOR_CLASSES = {
  green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", hoverBorder: "hover:border-green-500/50", btn: "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", hoverBorder: "hover:border-blue-500/50", btn: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", hoverBorder: "hover:border-yellow-500/50", btn: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/30" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", hoverBorder: "hover:border-amber-500/50", btn: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", hoverBorder: "hover:border-purple-500/50", btn: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", hoverBorder: "hover:border-cyan-500/50", btn: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30" },
};

export default function ServicesPage() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    if (session?.user?.id) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [listingsRes, creditsRes] = await Promise.all([
        fetch('/myaccount-api/listings'),
        fetch(`/api/credits?userId=${session.user.id}`),
      ]);

      if (listingsRes.ok) {
        const data = await listingsRes.json();
        const approved = (data.listings || []).filter(l => l.isApproved);
        setListings(approved);
        if (approved.length > 0) setSelectedListing(approved[0]);
      }

      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setBalance(data.balance || 0);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-4" />
        <p className="text-white/40 animate-pulse font-medium">{t('loadingServices')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('boostServicesTitle')}</h1>
          <p className="text-text-muted mt-1">{t('boostServicesSubtitle')}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
          <div>
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">{t('yourBalance')}</p>
            <p className="text-2xl font-black text-white leading-none">{balance} <span className="text-sm text-text-muted font-normal">credits</span></p>
          </div>
          <Link href="/myaccount/credits/buy" className="px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
            {t('buyShort')}
          </Link>
        </div>
      </div>

      {/* Select Listing (if user has listings) */}
      {listings.length > 0 && (
        <div className="bg-[#0d0d15] rounded-2xl p-5 border border-white/10">
          <p className="text-sm font-bold text-white mb-3">{t('selectListingToBoost')}</p>
          <div className="flex flex-wrap gap-3">
            {listings.map((listing) => {
              const imgUrl = getFirstListingImage(listing.images);
              const isSelected = selectedListing?.id === listing.id;
              return (
                <button
                  key={listing.id}
                  onClick={() => setSelectedListing(listing)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(255,42,127,0.15)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 relative">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={listing.title} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold truncate max-w-[150px] ${isSelected ? 'text-white' : 'text-white/70'}`}>{listing.title}</p>
                    <p className="text-[10px] text-white/40">{listing.city}, {listing.state}</p>
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-primary ml-2 flex-shrink-0"></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No listings notice */}
      {listings.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-amber-400 font-bold text-base">{t('noActiveListings')}</h3>
            <p className="text-amber-300/70 text-sm">{t('noActiveListingsDesc')}</p>
          </div>
          <Link href="/myaccount/listings/add-listing" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl whitespace-nowrap transition-all text-sm">
            {t('createListing')}
          </Link>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => {
          const c = COLOR_CLASSES[service.color];
          return (
            <div key={service.id} className={`bg-[#0d0d15] rounded-3xl p-6 border ${c.border} ${c.hoverBorder} transition-all group relative overflow-hidden flex flex-col`}>
              <div className={`absolute top-0 right-0 w-28 h-28 ${c.bg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-all pointer-events-none`} />

              {/* Verified badge */}
              {service.requiresVerification && (
                <div className="absolute top-5 right-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  {t('verifiedOnly')}
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 ${c.bg} rounded-xl border ${c.border} flex items-center justify-center ${c.text} mb-4 group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>

              <h3 className="text-lg font-black text-white mb-0.5">{service.name}</h3>
              <p className={`text-xs font-semibold ${c.text} mb-2`}>{service.tagline}</p>
              <p className="text-white/40 text-sm leading-relaxed mb-4 flex-1">{service.description}</p>

              {/* Quick stats */}
              <div className="flex items-center gap-3 mb-4 text-xs">
                <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-white/60">
                  <strong className="text-yellow-400">{service.cost}</strong>
                </span>
                <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-white/60">
                  {service.duration}
                </span>
              </div>

              {/* Benefits */}
              <div className="space-y-1.5 mb-5">
                {service.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                    <svg className={`w-3 h-3 ${c.text} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {b}
                  </div>
                ))}
              </div>

              {/* Pricing details if multiple options */}
              {service.pricingDetails && (
                <div className="flex flex-col gap-1.5 mb-4">
                  {service.pricingDetails.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                      <span className="text-white/50 font-bold uppercase tracking-wider">{p.label}</span>
                      <span className="font-black text-yellow-400">{p.cost} credits</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              {service.id === "auto-bump" ? (
                <Link
                  href="/myaccount/listings/auto-bump"
                  className={`w-full text-center px-5 py-2.5 border font-bold rounded-xl transition-all block text-sm ${c.btn}`}
                >
                  {t('configureAutoBump')}
                </Link>
              ) : selectedListing ? (
                <Link
                  href={`/myaccount/listings/boost?id=${selectedListing.id}`}
                  className={`w-full text-center px-5 py-2.5 border font-bold rounded-xl transition-all block text-sm ${c.btn}`}
                >
                  Boost "{selectedListing.title?.substring(0, 20)}{selectedListing.title?.length > 20 ? '...' : ''}"
                </Link>
              ) : (
                <Link
                  href="/myaccount/listings/add-listing"
                  className="w-full text-center px-5 py-2.5 border border-white/10 bg-white/5 text-white/40 font-bold rounded-xl transition-all block text-sm hover:border-white/20 hover:text-white/60"
                >
                  {t('createListingFirst')}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10">
        <h3 className="text-lg font-black text-white mb-4">{t('quickComparison')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left py-3 pr-4">{t('thService')}</th>
                <th className="text-center py-3 px-2">{t('thCost')}</th>
                <th className="text-center py-3 px-2">{t('thDuration')}</th>
                <th className="text-center py-3 px-2">{t('thEffect')}</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {SERVICES.map((s, i) => {
                const c = COLOR_CLASSES[s.color];
                return (
                  <tr key={s.id} className={i < SERVICES.length - 1 ? "border-b border-white/5" : ""}>
                    <td className={`py-3 pr-4 font-bold ${c.text}`}>{s.name}</td>
                    <td className="text-center py-3 px-2">{s.cost}</td>
                    <td className="text-center py-3 px-2">{s.duration}</td>
                    <td className="text-center py-3 px-2">{s.effect}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
