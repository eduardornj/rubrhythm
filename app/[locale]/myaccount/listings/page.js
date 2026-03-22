"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getFirstListingImage } from "@/lib/image-utils";
import { detectFacePosition } from "@/lib/face-focus";

export default function MyListings() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [availableToggles, setAvailableToggles] = useState({});

  useEffect(() => {
    if (session?.user?.id) {
      fetchListings();
    }
  }, [session]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/myaccount-api/listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      const fetchedListings = data.listings || [];
      setListings(fetchedListings);

      // Seed toggle state from listing data
      const initialToggles = {};
      fetchedListings.forEach((l) => {
        const isActive =
          l.availableNow &&
          l.availableUntil &&
          new Date(l.availableUntil) > new Date();
        initialToggles[l.id] = isActive || false;
      });
      setAvailableToggles(initialToggles);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/myaccount-api/listings?id=${listingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert(t('deleteError'));
    }
  };

  const toggleAvailable = async (listingId) => {
    const current = availableToggles[listingId] || false;
    const next = !current;

    // Turning ON costs 3 credits — confirm first
    if (next && !confirm(t('availableConfirm'))) {
      return;
    }

    // Optimistic update
    setAvailableToggles((prev) => ({ ...prev, [listingId]: next }));

    try {
      const response = await fetch(`/api/listing/${listingId}/available`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: next }),
      });

      if (!response.ok) {
        setAvailableToggles((prev) => ({ ...prev, [listingId]: current }));
        const data = await response.json();
        alert(data.error || t('availableError'));
      }
    } catch {
      setAvailableToggles((prev) => ({ ...prev, [listingId]: current }));
      alert(t('availableError'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (listing) => {
    if (listing.hourlyRate) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(listing.hourlyRate) + '/hr';
    }
    if (listing.priceRange) {
      return `$${listing.priceRange}`;
    }
    return t('priceNotSet');
  };

  const getStatusBadge = (listing) => {
    if (!listing.isApproved && !listing.isRejected) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          {t('statusPending')}
        </span>
      );
    }
    if (listing.isRejected) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          {t('statusRejected')}
        </span>
      );
    }
    if (listing.isApproved) {
      if (!listing.isActive) {
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 text-text-muted border border-white/20">
            {t('statusInactive')}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          {t('statusActive')}
        </span>
      );
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    if (filter === 'active') return listing.isApproved && listing.isActive;
    if (filter === 'pending') return !listing.isApproved && !listing.isRejected;
    if (filter === 'expired') return listing.isApproved && !listing.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">{t('loadingListings')}</p>
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
            <h3 className="text-red-400 font-semibold text-lg">{t('errorLoadingListings')}</h3>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchListings}
          className="mt-6 px-5 py-2.5 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5 relative">
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
            {t('myListingsTitle')}
          </h1>
          <p className="text-text-muted text-sm sm:text-base font-medium">
            {t('listingsOnNetwork', { count: listings.length })}
          </p>
        </div>
        <Link
          href="/myaccount/listings/add-listing"
          className="px-8 py-3.5 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-[0_0_20px_rgba(255,42,127,0.3)] hover:shadow-[0_0_30px_rgba(255,42,127,0.5)] border border-white/10 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('createNewListing')}
        </Link>
      </div>

      {/* Modern Filter Tabs */}
      <div className="p-1.5 bg-[#0d0d15]/60 border border-white/5 shadow-inner rounded-2xl inline-flex flex-wrap gap-1 backdrop-blur-xl">
        {[
          { key: 'all', label: t('allListings'), count: listings.length },
          { key: 'active', label: t('activeFilter'), count: listings.filter(l => l.isApproved && l.isActive).length },
          { key: 'pending', label: t('pendingFilter'), count: listings.filter(l => !l.isApproved && !l.isRejected).length },
          { key: 'expired', label: t('inactiveFilter'), count: listings.filter(l => l.isApproved && !l.isActive).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${filter === tab.key
              ? 'bg-gradient-to-br from-white/10 to-white/5 text-white shadow-sm border border-white/10'
              : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
          >
            {tab.label}
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${filter === tab.key ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-black/30 text-white/50'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Listings Quick Actions - visible if listings exist */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/myaccount/listings/bump-up"
            className="group relative flex flex-col p-6 bg-[#0d0d15]/60 rounded-3xl border border-white/5 hover:border-blue-500/50 hover:bg-[#0d0d15]/80 transition-all duration-300 backdrop-blur-xl overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="flex items-center gap-4 mb-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-white text-xl tracking-tight">{t('bumpUp')}</h3>
                <p className="text-sm font-medium text-blue-400/80">{t('pushToTop')}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/myaccount/listings/highlight"
            className="group relative flex flex-col p-6 bg-[#0d0d15]/60 rounded-3xl border border-white/5 hover:border-yellow-500/50 hover:bg-[#0d0d15]/80 transition-all duration-300 backdrop-blur-xl overflow-hidden hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="flex items-center gap-4 mb-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-white text-xl tracking-tight">{t('highlight')}</h3>
                <p className="text-sm font-medium text-yellow-400/80">{t('standOutColors')}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/myaccount/listings/feature"
            className="group relative flex flex-col p-6 bg-[#0d0d15]/60 rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-[#0d0d15]/80 transition-all duration-300 backdrop-blur-xl overflow-hidden hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="flex items-center gap-4 mb-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-white text-xl tracking-tight">{t('featurePremium')}</h3>
                <p className="text-sm font-medium text-purple-400/80">{t('topPagePlacement')}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-[#0d0d15]/80 rounded-3xl p-16 text-center border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
            {filter === 'all' ? t('noListingsFound') : t('noFilteredListings', { filter })}
          </h3>
          <p className="text-text-muted mb-8 max-w-md mx-auto leading-relaxed">
            {filter === 'all'
              ? t('noListingsYetDesc')
              : t('noFilteredListingsDesc', { filter })
            }
          </p>
          {filter === 'all' && (
            <Link
              href="/myaccount/listings/add-listing"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold tracking-wide rounded-xl top-button-glow hover:scale-105 transition-all duration-300"
            >
              {t('postFirstAd')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredListings.map((listing) => {
            const imageUrl = getFirstListingImage(listing?.images);
            const isFeatured = listing.isFeatured || false;
            const isHighlighted = listing.isHighlighted || false;
            const isPremiumActive = isFeatured && listing.featureTier?.toUpperCase() === 'PREMIUM' && listing.featuredEndDate && new Date(listing.featuredEndDate) > new Date();
            const isStandardFeaturedActive = isFeatured && listing.featureTier?.toUpperCase() !== 'PREMIUM' && listing.featuredEndDate && new Date(listing.featuredEndDate) > new Date();
            const isHighlightedActive = isHighlighted && listing.highlightEndDate && new Date(listing.highlightEndDate) > new Date();

            return (
              <div key={listing.id} className={`group relative bg-[#0d0d15]/60 rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,42,127,0.15)] hover:bg-[#0d0d15]/80 backdrop-blur-xl ${isPremiumActive ? 'border-violet-500/60 shadow-[0_0_25px_rgba(139,92,246,0.25)]' : isStandardFeaturedActive ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : isHighlightedActive ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-white/5 hover:border-primary/50'}`}>

                {/* Glow Effect Element Background */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row h-full relative z-10">

                  {/* Image Area */}
                  <div className="w-full sm:w-56 h-56 sm:h-full flex-shrink-0 relative overflow-hidden bg-black/50 border-r border-white/5">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title || 'Listing image'}
                        className="absolute inset-0 w-full h-full object-cover object-[center_30%] group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                        onLoad={(e) => detectFacePosition(e.target)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/80 to-[#0d0d15]">
                        <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Premium banner — animated gradient, full-width */}
                    {isPremiumActive && (
                      <div className="absolute top-0 left-0 right-0 z-20">
                        <div className="relative overflow-hidden py-1.5 flex items-center justify-center gap-2">
                          <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 animate-gradient bg-[length:200%_auto]"></span>
                          <span className="relative z-10 text-lg">💎</span>
                          <span className="relative z-10 text-white font-black text-[11px] uppercase tracking-[0.2em] drop-shadow-lg">{t('premiumProvider')}</span>
                        </div>
                      </div>
                    )}

                    {/* Top-left badges — Status + Available Now */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {getStatusBadge(listing)}
                      {availableToggles[listing.id] && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-white bg-green-500 px-2.5 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          {t('availableNow')}
                        </span>
                      )}
                    </div>

                    {/* Top-right — Verified badge */}
                    {listing.user?.verified && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-blue-500/90 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)] backdrop-blur-sm border border-blue-400/30">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          {t('verified')}
                        </span>
                      </div>
                    )}

                    {/* Bottom-left badges — Featured, Highlighted, WhatsApp */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                      {isStandardFeaturedActive && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] tracking-wide">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          {t('featured')}
                        </span>
                      )}
                      {isHighlightedActive && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-black bg-gradient-to-r from-yellow-300 to-yellow-500 px-3 py-1 rounded-full font-black shadow-[0_0_12px_rgba(234,179,8,0.5)] tracking-wide">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                          {t('highlighted')}
                        </span>
                      )}
                      {listing.isWhatsAppAvailable && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-white bg-[#25D366] px-2.5 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(37,211,102,0.4)]" title="WhatsApp Available">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                          WhatsApp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-6 flex flex-col justify-between relative bg-gradient-to-br from-transparent to-white/[0.02]">
                    <div>
                      <h3 className="text-2xl font-black text-white line-clamp-1 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary transition-all duration-300">
                        {listing.title || 'Untitled Listing'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center text-primary font-black text-lg px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                          {formatPrice(listing)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {listing.city || 'Anywhere'}, {listing.state || 'US'}
                        </div>
                      </div>

                      <p className="text-text-muted text-sm line-clamp-2 mb-4 leading-relaxed font-medium">
                        {listing.description || t('noDescriptionProvided')}
                      </p>
                    </div>

                    <div className="mt-auto pt-5 border-t border-white/5 space-y-4">

                      <div className="flex flex-wrap gap-2">
                        {listing.isApproved && (
                          <button
                            onClick={() => toggleAvailable(listing.id)}
                            className={`px-4 py-2 text-sm font-bold tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 border ${
                              availableToggles[listing.id]
                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 shadow-[0_0_12px_rgba(74,222,128,0.2)]'
                                : 'bg-white/5 hover:bg-white/10 text-text-muted border-white/10 hover:border-white/20'
                            }`}
                            title={availableToggles[listing.id] ? 'Click to mark as unavailable' : 'Click to mark as available now (2h)'}
                          >
                            <span className={`w-2 h-2 rounded-full ${availableToggles[listing.id] ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`}></span>
                            {availableToggles[listing.id] ? t('availableNow') : t('setAvailable')}
                          </button>
                        )}

                        {listing.isApproved && (
                          <Link
                            href={`/myaccount/listings/boost?id=${listing.id}`}
                            className="px-4 py-2 flex-grow text-center bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm font-bold tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,42,127,0.1)] hover:shadow-[0_0_20px_rgba(255,42,127,0.3)] hover:-translate-y-0.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {t('boostListing')}
                          </Link>
                        )}
                        <Link
                          href={`/myaccount/listings/edit/${listing.id}`}
                          className="px-4 py-2 flex-1 text-center bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all border border-white/10 hover:border-white/20"
                        >
                          {t('edit')}
                        </Link>
                        <Link
                          href={`/united-states/${(listing.state || 'us').toLowerCase().replace(/\s+/g, '-')}/${(listing.city || 'anywhere').toLowerCase().replace(/\s+/g, '-')}/massagists/${(listing.title || 'listing').toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${listing.id}`}
                          className="px-4 py-2 flex-1 text-center bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all border border-white/10 hover:border-white/20"
                        >
                          {t('preview')}
                        </Link>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-xl transition-all border border-red-500/20 hover:border-red-500/40"
                          title="Delete listing"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}