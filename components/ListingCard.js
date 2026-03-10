"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";
import useFilterStore from "@/store/useFilterStore";
import FavoriteButton from "@/app/components/FavoriteButton";
import AnonymousChat from "@/app/components/AnonymousChat";
import { getFirstListingImage } from "@/lib/image-utils";
import ImageLightbox from "@/components/ImageLightbox";
import { detectFacePosition } from "@/lib/face-focus";

export default function ListingCard({ listing, state, city, isFavorited: initialIsFavorited, priority = false }) {
  const { data: session } = useSession();
  const { onlyVerified } = useFilterStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (onlyVerified && !listing.user?.verified) return null;

  const resolvedState = (listing.state || state || "").toLowerCase().replace(/\s+/g, "-");
  const resolvedCity = (listing.city || city || "").toLowerCase().replace(/\s+/g, "-");
  const slug = `${listing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${listing.id}`;
  const href = resolvedState && resolvedCity
    ? `/united-states/${resolvedState}/${resolvedCity}/massagists/${slug}`
    : `/listing/${listing.id}`;
  const imageUrl = getFirstListingImage(listing.images);

  const currentDate = new Date();
  const isFeaturedValid =
    listing.isFeatured &&
    listing.featuredEndDate &&
    new Date(listing.featuredEndDate) > currentDate;

  const isPremium = listing.featureTier?.toUpperCase() === "PREMIUM";

  const isAvailableNow =
    listing.availableNow &&
    listing.availableUntil &&
    new Date(listing.availableUntil) > new Date();

  const isHighlightedValid =
    listing.isHighlighted &&
    listing.highlightEndDate &&
    new Date(listing.highlightEndDate) > currentDate;

  const isVerified = listing.user?.verified;

  // Card border glow based on tier
  const cardBorder = isFeaturedValid && isPremium
    ? "border-violet-500/70 shadow-[0_0_30px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/20"
    : isFeaturedValid
    ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
    : isHighlightedValid
    ? "border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
    : "border-white/8 hover:border-primary/30";

  return (
    <div className={`glass-card p-0 relative group flex flex-col h-full overflow-hidden rounded-2xl border ${cardBorder} transition-all duration-300`}>

      {/* FOTO */}
      <Link href={href} className="relative block w-full h-[32rem] overflow-hidden bg-surface-hover flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-500"
            onLoad={(e) => detectFacePosition(e.target)}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <svg className="w-14 h-14 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Expand photo button */}
        {imageUrl && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLightboxOpen(true); }}
            className="absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-black/50 border border-white/20 text-white/70 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            title="View full photo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        )}

        {/* ── PREMIUM BANNER — full-width animated, imposing ── */}
        {isFeaturedValid && isPremium && (
          <div className="absolute top-0 left-0 right-0 z-30">
            <div className="relative overflow-hidden py-2 flex items-center justify-center gap-2">
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 animate-gradient bg-[length:200%_auto]"></span>
              <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></span>
              <svg className="relative z-10 w-4 h-4 text-yellow-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="relative z-10 text-white font-black text-[11px] uppercase tracking-[0.25em] drop-shadow-lg">Premium Provider</span>
              <svg className="relative z-10 w-4 h-4 text-yellow-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
          </div>
        )}

        {/* ── TOP-LEFT: Available Now ── */}
        {isAvailableNow && (
          <div className={`absolute ${isFeaturedValid && isPremium ? 'top-12' : 'top-3'} left-3 z-20`}>
            <span className="inline-flex items-center gap-1.5 text-xs text-white bg-green-500 px-3 py-1.5 rounded-full font-bold shadow-[0_0_20px_rgba(74,222,128,0.6)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              Available Now
            </span>
          </div>
        )}

        {/* ── TOP-RIGHT: WhatsApp + Favorite on hover ── */}
        <div className={`absolute ${isFeaturedValid && isPremium ? 'top-12' : 'top-3'} right-3 pointer-events-auto flex items-center gap-2 z-20`}>
          {listing.isWhatsAppAvailable && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white bg-[#25D366] px-2.5 py-1.5 rounded-full font-bold shadow-[0_0_12px_rgba(37,211,102,0.5)]" title="WhatsApp Available">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </span>
          )}
          <div className="hidden group-hover:flex">
            <FavoriteButton
              userId={session?.user?.id}
              listingId={listing.id}
              initialIsFavorited={initialIsFavorited}
            />
          </div>
        </div>

        {/* ── BOTTOM-LEFT: Verified + Featured + Highlighted badges ── */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Verified — blue shield, professional */}
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white bg-blue-500 px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(59,130,246,0.6)] tracking-wide border border-blue-400/30">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified
              </span>
            )}

            {/* Featured (standard) — star icon, gradient */}
            {isFeaturedValid && !isPremium && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] tracking-wide">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Featured
              </span>
            )}

            {/* Highlighted — yellow lightning bolt */}
            {isHighlightedValid && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-black bg-gradient-to-r from-yellow-300 to-yellow-500 px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(250,204,21,0.5)] tracking-wide">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                Highlighted
              </span>
            )}

            {/* Founding Provider — permanent gold badge */}
            {listing.isFoundingProvider && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Founding Provider
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* CARD BODY */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Clickable title */}
        <Link href={href} className="block mb-1 hover:text-primary transition-colors">
          <h3 className="text-base font-bold text-white line-clamp-1 leading-snug">{listing.title}</h3>
        </Link>

        <p className="text-text-muted text-xs line-clamp-2 mb-2 flex-grow leading-relaxed">
          {listing.description || "No description available."}
        </p>

        {/* Rating display */}
        {listing.totalReviews > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`text-xs ${s <= Math.round(listing.averageRating || 0) ? "text-yellow-400" : "text-white/15"}`}>★</span>
              ))}
            </div>
            <span className="text-xs text-white/40">{(listing.averageRating || 0).toFixed(1)} ({listing.totalReviews})</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
          <Link
            href={href}
            className="btn-primary px-3 py-2 text-xs font-semibold flex-1 text-center rounded-xl"
          >
            View Profile →
          </Link>
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2.5 bg-white/5 border border-white/10 text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all"
            title="Anonymous Chat"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <FavoriteButton
            userId={session?.user?.id}
            listingId={listing.id}
            initialIsFavorited={initialIsFavorited}
          />
        </div>
      </div>

      <AnonymousChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        listing={listing}
        providerId={listing.userId}
      />

      <ImageLightbox
        src={imageUrl}
        alt={listing.title}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
