"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getFirstListingImage } from "@/lib/image-utils";

const AVAILABLE_NOW_COST = 3;
const DURATION_HOURS = 6;

function formatTimeLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

export default function AvailableNowPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AvailableNowPage />
    </Suspense>
  );
}

function AvailableNowPage() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(0);
  const [autoRenewMap, setAutoRenewMap] = useState({});

  useEffect(() => {
    if (session?.user?.id) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listingsRes, creditsRes] = await Promise.all([
        fetch('/myaccount-api/listings'),
        fetch(`/api/credits?userId=${session.user.id}`)
      ]);

      if (!listingsRes.ok || !creditsRes.ok) throw new Error('Failed to fetch data');

      const listingsData = await listingsRes.json();
      const creditsData = await creditsRes.json();

      const approved = (listingsData.listings || []).filter(l => l.isApproved);
      setListings(approved);
      setCredits(creditsData.balance || 0);
      const renewMap = {};
      approved.forEach(l => { renewMap[l.id] = l.autoRenewAvailable || false; });
      setAutoRenewMap(renewMap);
    } catch (err) {
      console.error('Error:', err);
      setError(t('failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (listingId) => {
    if (credits < AVAILABLE_NOW_COST) {
      alert(t('insufficientCreditsMsg', { needed: AVAILABLE_NOW_COST, have: credits }));
      return;
    }

    if (!confirm(t('activateConfirm', { hours: DURATION_HOURS, cost: AVAILABLE_NOW_COST }))) return;

    try {
      setProcessing(listingId);
      const res = await fetch(`/api/listing/${listingId}/available`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: true, autoRenew: autoRenewMap[listingId] || false }),
      });

      if (res.ok) {
        setCredits(prev => prev - AVAILABLE_NOW_COST);
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.error || t('failedToActivate'));
      }
    } catch {
      alert(t('somethingWentWrong'));
    } finally {
      setProcessing(null);
    }
  };

  const handleDeactivate = async (listingId) => {
    try {
      setProcessing(listingId);
      const res = await fetch(`/api/listing/${listingId}/available`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: false }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert(t('failedToDeactivate'));
      }
    } catch {
      alert(t('somethingWentWrong'));
    } finally {
      setProcessing(null);
    }
  };

  const toggleAutoRenew = async (listingId) => {
    const newValue = !autoRenewMap[listingId];
    setAutoRenewMap(prev => ({ ...prev, [listingId]: newValue }));
    try {
      await fetch(`/api/listing/${listingId}/available`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setAutoRenew: newValue }),
      });
    } catch {
      setAutoRenewMap(prev => ({ ...prev, [listingId]: !newValue }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-green-500 animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-red-400 font-semibold text-lg">{t('error')}</h3>
        <p className="text-red-400/80 text-sm mt-1">{error}</p>
        <button onClick={fetchData} className="mt-4 px-5 py-2 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30">
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {t('availabilityStatus')}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('availableNowPageTitle')}</h1>
          <p className="text-text-muted mt-1">{t('availableNowPageSubtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 p-3 sm:px-6 sm:py-3 rounded-2xl">
          <div className="text-center sm:text-right">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">{t('availableCredits')}</p>
            <p className="text-2xl font-black text-white leading-none">{credits}</p>
          </div>
          <Link href="/myaccount/credits/buy" className="px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
            {t('buyMore')}
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center flex-shrink-0">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2.5}/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{t('howAvailableNowWorks')}</h3>
          <p className="text-text-muted mb-4 max-w-2xl leading-relaxed">
            By spending <strong className="text-green-400">{AVAILABLE_NOW_COST} credits</strong>, a <strong className="text-white">pulsing green badge</strong> appears on your listing card and profile page for <strong className="text-white">{DURATION_HOURS} hours</strong>, letting clients know you're ready to take appointments right now.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/20">{t('instantActivation')}</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/20">{t('lastsDuration', { hours: DURATION_HOURS })}</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/20">{t('visibleOnCardProfile')}</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/20">{t('freeToTurnOff')}</span>
          </div>
        </div>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-16 text-center border border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('noActiveListingsAvailNow')}</h3>
          <p className="text-text-muted mb-8 max-w-md mx-auto">{t('needApprovedListing')}</p>
          <Link href="/myaccount/listings/add-listing" className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            {t('createListing')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => {
            const imageUrl = getFirstListingImage(listing.images);
            const isActive = listing.availableNow && listing.availableUntil && new Date(listing.availableUntil) > new Date();
            const timeLeft = isActive ? formatTimeLeft(listing.availableUntil) : null;
            const isBusy = processing === listing.id;
            const isPreselected = listing.id === preselectedId;

            return (
              <div
                key={listing.id}
                className={`flex gap-4 p-5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                    : isPreselected
                    ? 'bg-white/5 border-primary/30'
                    : 'bg-[#0d0d15] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 relative">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={listing.title} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-white truncate text-lg">{listing.title}</h3>
                  <p className="text-sm text-white/40 mt-0.5">{listing.city}, {listing.state}</p>

                  {/* Status */}
                  {isActive && timeLeft && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-500/20 px-2.5 py-1 rounded-full font-bold border border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        {t('activeStatus')}
                      </span>
                      <span className="text-xs text-green-400/60">{timeLeft}</span>
                    </div>
                  )}
                </div>

                {/* Auto-Renew Toggle */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 border-r border-white/10 pr-4 mr-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoRenewMap[listing.id] || false}
                    onClick={(e) => { e.stopPropagation(); toggleAutoRenew(listing.id); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoRenewMap[listing.id] ? "bg-green-500" : "bg-white/20"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-md transition-transform ${autoRenewMap[listing.id] ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                  <span className={`text-[10px] font-bold ${autoRenewMap[listing.id] ? "text-green-400" : "text-text-muted"}`}>
                    {autoRenewMap[listing.id] ? t('autoMode') : t('manualMode')}
                  </span>
                </div>

                {/* Action */}
                <div className="flex items-center flex-shrink-0">
                  {isActive ? (
                    <button
                      onClick={() => handleDeactivate(listing.id)}
                      disabled={isBusy}
                      className={`px-4 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                        isBusy ? 'opacity-50 cursor-not-allowed' : ''
                      } bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20`}
                    >
                      {isBusy ? t('turningOff') : t('turnOff')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(listing.id)}
                      disabled={isBusy}
                      className={`px-4 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                        isBusy ? 'opacity-50 cursor-not-allowed' : ''
                      } bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]`}
                    >
                      {isBusy ? t('activating') : t('activateCredits', { cost: AVAILABLE_NOW_COST })}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
