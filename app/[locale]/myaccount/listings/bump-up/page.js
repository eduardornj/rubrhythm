"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getFirstListingImage } from "@/lib/image-utils";

export default function BumpUpListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BumpUpListings />
    </Suspense>
  );
}

function BumpUpListings() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [listings, setListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(0);

  const BUMP_UP_COST = 5; // $5

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (preselectedId && listings.length > 0) {
      const listing = listings.find(l => l.id === preselectedId);
      if (listing && listing.isApproved) {
        setSelectedListings(new Set([preselectedId]));
      }
    }
  }, [preselectedId, listings]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listingsResponse, creditsResponse] = await Promise.all([
        fetch('/myaccount-api/listings'),
        fetch(`/api/credits?userId=${session.user.id}`)
      ]);

      if (!listingsResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const listingsData = await listingsResponse.json();
      const creditsData = await creditsResponse.json();

      const approved = (listingsData.listings || []).filter(listing =>
        listing.isApproved
      );

      setListings(approved);
      setCredits(creditsData.balance || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(t('failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const toggleListing = (listingId) => {
    setSelectedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedListings.size === listings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map(l => l.id)));
    }
  };

  const handleBumpUp = async () => {
    const totalCost = selectedListings.size * BUMP_UP_COST;

    if (totalCost > credits) {
      alert(`Insufficient credits. You need ${totalCost} credits but only have ${credits}.`);
      return;
    }

    if (!confirm(`Bump up ${selectedListings.size} listing(s) for ${totalCost} credits?`)) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/listing/bump-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingIds: Array.from(selectedListings)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to bump up listings');
      }

      const result = await response.json();
      alert(`Successfully bumped up ${result.count} listing(s)!`);

      await fetchData();
      setSelectedListings(new Set());
    } catch (error) {
      console.error('Error bumping up listings:', error);
      setError(error.message || 'Failed to bump up listings. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">{t('loadingBumpUp')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-400 font-semibold text-lg">{t('errorLoadingData')}</h3>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="mt-6 px-5 py-2.5 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const totalCost = selectedListings.size * BUMP_UP_COST;
  const canAfford = totalCost <= credits;

  return (
    <div className="max-w-[1600px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {t('vipPromotion')}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{t('bumpUpPageTitle')}</h1>
          <p className="text-text-muted mt-1">{t('bumpUpPageSubtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 p-3 sm:px-6 sm:py-3 rounded-2xl backdrop-blur-sm">
          <div className="text-center sm:text-right">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">{t('availableCredits')}</p>
            <p className="text-2xl font-black text-white leading-none">{credits}</p>
          </div>
          <Link
            href="/myaccount/credits/buy"
            className="px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
          >
            {t('buyMore')}
          </Link>
        </div>
      </div>

      {/* Info Hero Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center flex-shrink-0">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{t('howBumpUpWorks')}</h3>
          <p className="text-text-muted mb-4 max-w-2xl leading-relaxed">
            By spending <strong className="text-blue-400">{BUMP_UP_COST} credits</strong>, your listing gets refreshed timestamps, sending it right to the <strong className="text-white">very top of the newest listings list</strong> in your city.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/20">{t('worksInstantly')}</span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/20">{t('staysOnTop')}</span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/20">{t('moreClicksGuaranteed')}</span>
          </div>
        </div>
      </div>

      {/* Auto-Bump Promo */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-cyan-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </div>
          <div>
            <h3 className="text-cyan-400 font-bold text-base">{t('tiredOfManualBumps')}</h3>
            <p className="text-cyan-300/70 text-sm">Enable <strong className="text-white">Auto-Bump</strong> to automatically bump your listing every day at your chosen hour. Just 5 credits/day.</p>
          </div>
        </div>
        <Link href="/myaccount/listings/auto-bump" className="px-5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold rounded-xl whitespace-nowrap transition-all text-sm border border-cyan-500/30">
          Configure Auto-Bump
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-16 text-center border border-white/10 backdrop-blur-sm">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('noActiveListingsBump')}</h3>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            {t('noApprovedBumpDesc')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/myaccount/listings/add-listing"
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('createListing')}
            </Link>
            <Link
              href="/myaccount/listings"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              {t('manageListings')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm overflow-hidden">
          {/* Action Bar */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={selectAll}
                className="px-5 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/10"
              >
                {selectedListings.size === listings.length ? t('deselectAll') : t('selectAll')}
              </button>
              <span className="text-text-muted text-sm font-semibold">
                <strong className="text-white">{selectedListings.size}</strong> {t('selected')}
              </span>
            </div>

            {selectedListings.size > 0 && (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-text-muted">{t('totalCost')}</p>
                  <p className={`text-xl font-black ${canAfford ? 'text-blue-400' : 'text-red-500'}`}>
                    {totalCost} credits
                  </p>
                </div>
                <button
                  onClick={handleBumpUp}
                  disabled={processing || !canAfford}
                  className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${processing || !canAfford
                    ? 'bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                    }`}
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {t('buyBumpUp')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* List Area */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => {
              const checked = selectedListings.has(listing.id);
              const wasBumped = listing.isBumpedUp;

              return (
                <div
                  key={listing.id}
                  onClick={() => toggleListing(listing.id)}
                  className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${checked
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center justify-center p-2">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checked ? 'border-blue-500 bg-blue-500' : 'border-white/20 bg-transparent'
                      }`}>
                      {checked && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 relative">
                    {(() => {
                      const imageUrl = getFirstListingImage(listing.images);
                      return imageUrl ? (
                        <Image src={imageUrl} alt={listing.title} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className={`font-bold truncate text-lg ${checked ? 'text-white' : 'text-gray-200'}`}>
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-text-muted mt-1 flex-wrap">
                      <span className="truncate">{listing.city}{listing.state ? `, ${listing.state}` : ''}</span>
                      {wasBumped && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="inline-flex items-center gap-1 text-blue-400 font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Last bumped {formatDate(listing.updatedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}