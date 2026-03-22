"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function MyAccountFavorites() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/myaccount-api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (listingId) => {
    try {
      const response = await fetch('/myaccount-api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.listing.id !== listingId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite. Please try again.');
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <span className="ml-3 text-text">Loading favorites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Favorites</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchFavorites}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Favorites</h1>
          <p className="text-white/50 text-sm mt-1">
            {favorites.length} {favorites.length === 1 ? 'listing' : 'listings'} saved
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-medium text-sm flex items-center gap-2"
        >
          <span>Buscar mais anúncios</span>
          <span>→</span>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-[#0d0d15] border border-white/6 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
          <p className="text-white/40 mb-6 max-w-md">
            Comece a navegar pelos anúncios e salve seus favoritos para vê-los aqui e acessá-los mais tarde.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all font-bold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => {
            const listing = favorite.listing;
            return (
              <div key={favorite.id} className="bg-[#0d0d15] rounded-2xl overflow-hidden border border-white/6 hover:border-white/20 transition-all flex flex-col group">
                {/* Image */}
                <div className="relative h-56 w-full">
                  {listing?.images && Array.isArray(listing.images) && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0].startsWith('data:') ? listing.images[0] : (listing.images[0].startsWith('http') ? listing.images[0] : (listing.images[0].startsWith('/api/secure-files') ? listing.images[0] : `/api/secure-files?path=users/listings/${listing.images[0]}&type=listings`))}
                      alt={listing.title || 'Listing image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Remove Favorite Button */}
                  <button
                    onClick={() => removeFavorite(listing?.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md text-white/50 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10 hover:border-red-500/30"
                    title="Remove from favorites"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Status Badge */}
                  {listing?.isApproved && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md">
                        Active
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
                      {listing?.title || 'Untitled Listing'}
                    </h3>
                  </div>

                  <p className="text-white/40 text-sm mb-4 line-clamp-2">
                    {listing?.description || 'No description available'}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white font-mono">
                        {listing?.price ? formatPrice(listing.price) : 'N/A'}
                      </span>
                      <span className="text-xs text-white/50 font-medium px-2 py-1 bg-white/5 rounded-md">
                        {listing?.location || 'Location missing'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/30">
                      <span>Saved: {formatDate(favorite.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t border-white/6">
                      <Link
                        href={listing?.state && listing?.city
                          ? `/united-states/${listing.state.toLowerCase().replace(/\s+/g, '-')}/${listing.city.toLowerCase().replace(/\s+/g, '-')}/massagists/${listing.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${listing.id}`
                          : `/listing/${listing?.id}`}
                        className="flex-1 py-2 bg-primary/20 border border-primary/30 text-primary font-bold text-center rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
                      >
                        Ver Detalhes
                      </Link>
                      <button
                        onClick={() => {
                          if (listing?.id) {
                            const shareUrl = listing?.state && listing?.city
                              ? `${window.location.origin}/united-states/${listing.state.toLowerCase().replace(/\s+/g, '-')}/${listing.city.toLowerCase().replace(/\s+/g, '-')}/massagists/${listing.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${listing.id}`
                              : `${window.location.origin}/listing/${listing.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            alert('Link copied to clipboard!');
                          }
                        }}
                        className="px-3 py-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                        title="Share listing"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination or Load More (if needed) */}
      {favorites.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={fetchFavorites}
            className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/50 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            Refresh Favorites
          </button>
        </div>
      )}
    </div>
  );
}