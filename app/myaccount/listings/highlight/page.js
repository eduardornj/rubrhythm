"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFirstListingImage } from "@/lib/image-utils";

function formatTimeLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (d > 0) return `${d}d ${h}h remaining`;
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

export default function HighlightListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HighlightListings />
    </Suspense>
  );
}

function HighlightListings() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [listings, setListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(0);

  const HIGHLIGHT_COST = 15; // $15
  const [autoRenew, setAutoRenew] = useState(false);

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
        fetch('/myaccount/api/listings'),
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
      setError('Failed to load data. Please try again.');
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

  const handleHighlight = async () => {
    const totalCost = selectedListings.size * HIGHLIGHT_COST;

    if (totalCost > credits) {
      alert(`Insufficient credits. You need ${totalCost} credits but only have ${credits}.`);
      return;
    }

    if (!confirm(`Highlight ${selectedListings.size} listing(s) for ${totalCost} credits?`)) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/listing/highlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingIds: Array.from(selectedListings),
          autoRenew,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to highlight listings');
      }

      await fetchData();
      setSelectedListings(new Set());
      alert(`Successfully highlighted!`);
    } catch (error) {
      setError('Failed to highlight listings. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-yellow-400 animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">Loading Highlight module...</p>
      </div>
    );
  }

  const totalCost = selectedListings.size * HIGHLIGHT_COST;
  const canAfford = totalCost <= credits;

  return (
    <div className="max-w-[1600px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            VIP Promotion
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Highlight Listings</h1>
          <p className="text-text-muted mt-1">Make your listing stand out visually with a vibrant card background in search results.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 p-3 sm:px-6 sm:py-3 rounded-2xl backdrop-blur-sm">
          <div className="text-center sm:text-right">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Available Credits</p>
            <p className="text-2xl font-black text-white leading-none">{credits}</p>
          </div>
          <Link href="/myaccount/credits/buy" className="px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
            + Buy More
          </Link>
        </div>
      </div>

      {/* Info Hero Card */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] flex items-center justify-center flex-shrink-0">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">Noticeable at first glance</h3>
          <p className="text-text-muted mb-4 max-w-2xl leading-relaxed">
            By spending <strong className="text-yellow-400">{HIGHLIGHT_COST} credits</strong>, your ad will receive a special colorful background border and a badge in search results, converting up to 300% more clicks.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">Lasts 14 days</span>
            <span className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">Standalone badge inside list</span>
          </div>
        </div>
      </div>

      {/* Auto-Renew Toggle */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="pt-0.5">
            <button
              type="button"
              role="switch"
              aria-checked={autoRenew}
              onClick={() => setAutoRenew(!autoRenew)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenew ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-white/20"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${autoRenew ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Auto-renew when expired</p>
            {autoRenew ? (
              <p className="text-yellow-400 text-xs mt-1 font-semibold">
                Auto-renewal is ON. You will be automatically charged {HIGHLIGHT_COST} credits per listing when your highlight expires. Turn off anytime.
              </p>
            ) : (
              <p className="text-text-muted text-xs mt-1">
                Your listing will be automatically re-highlighted and charged when it expires. You can turn this off anytime.
              </p>
            )}
          </div>
        </label>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-16 text-center border border-white/10 backdrop-blur-sm">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No active listings available</h3>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            You don't have any approved listings available to highlight.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/myaccount/listings" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              Manage Listings
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm overflow-hidden">
          {/* Action Bar */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button onClick={selectAll} className="px-5 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                {selectedListings.size === listings.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-text-muted text-sm font-semibold"><strong className="text-white">{selectedListings.size}</strong> selected</span>
            </div>

            {selectedListings.size > 0 && (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-text-muted">Total Cost</p>
                  <p className={`text-xl font-black ${canAfford ? 'text-yellow-400' : 'text-red-500'}`}>{totalCost} credits</p>
                </div>
                <button
                  onClick={handleHighlight}
                  disabled={processing || !canAfford}
                  className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${processing || !canAfford ? 'bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/25 hover:scale-105'
                    }`}
                >
                  Buy Highlight
                </button>
              </div>
            )}
          </div>

          {/* List Area */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => {
              const checked = selectedListings.has(listing.id);
              const isCurrentlyHighlighted = listing.isHighlighted && listing.highlightEndDate && new Date(listing.highlightEndDate) > new Date();
              const highlightTimeLeft = isCurrentlyHighlighted ? formatTimeLeft(listing.highlightEndDate) : null;

              return (
                <div
                  key={listing.id}
                  onClick={() => toggleListing(listing.id)}
                  className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isCurrentlyHighlighted && !checked
                      ? 'bg-yellow-500/5 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                      : checked
                      ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                      : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center justify-center p-2">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checked ? 'border-yellow-500 bg-yellow-500' : 'border-white/20 bg-transparent'
                      }`}>
                      {checked && <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 relative">
                    {(() => {
                      const imageUrl = getFirstListingImage(listing.images);
                      return imageUrl ? (
                        <Image src={imageUrl} alt={listing.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">IMG</div>
                      );
                    })()}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {checked && <span className="text-[10px] bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded uppercase">Preview</span>}
                      <h3 className={`font-bold truncate text-lg ${checked ? 'text-yellow-400' : 'text-gray-200'}`}>
                        {listing.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted mt-1 flex-wrap">
                      <span className="truncate">{listing.city}{listing.state ? `, ${listing.state}` : ''}</span>
                      {isCurrentlyHighlighted && highlightTimeLeft && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="inline-flex items-center gap-1 text-yellow-400 font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                            Active — {highlightTimeLeft}
                          </span>
                        </>
                      )}
                      {listing.isHighlighted && !isCurrentlyHighlighted && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-red-400/70 font-semibold text-xs">Highlight expired</span>
                        </>
                      )}
                      {listing.autoRenewHighlight && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-green-400 font-semibold text-xs">Auto-renew ON</span>
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