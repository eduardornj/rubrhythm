import Link from "next/link";
import { detectFacePosition } from "@/lib/face-focus";

const PLACEHOLDER = "/placeholder-provider.svg";
function imgSrc(img) {
  if (!img) return PLACEHOLDER;
  if (img.startsWith("http") || img.startsWith("/")) return img;
  return `/api/images/${img}`;
}

export default function MiniCard({ listing, state, city }) {
  const img = listing.images?.[0] || null;
  const slug = listing.id;
  const isVerified = listing.user?.verified;
  const isFeatured = listing.isFeatured && listing.featuredEndDate && new Date(listing.featuredEndDate) > new Date();
  const isPremium = listing.featureTier?.toUpperCase() === 'PREMIUM';
  const isAvailableNow = listing.availableNow && listing.availableUntil && new Date(listing.availableUntil) > new Date();
  const isHighlightedValid = listing.isHighlighted && listing.highlightEndDate && new Date(listing.highlightEndDate) > new Date();

  // Card border glow based on tier
  const cardBorder = isFeatured && isPremium
    ? "border-violet-500/70 shadow-[0_0_20px_rgba(139,92,246,0.25)] ring-1 ring-violet-500/20"
    : isFeatured
    ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
    : isHighlightedValid
    ? "border-yellow-400/40 shadow-[0_0_12px_rgba(250,204,21,0.12)]"
    : "border-white/8 hover:border-primary/40";

  return (
    <Link
      href={`/united-states/${state}/${city}/massagists/${slug}`}
      className={`group glass-card p-0 overflow-hidden transition-all duration-300 block border ${cardBorder}`}
    >
      <div className="relative w-full h-full aspect-[3/4] overflow-hidden">
        <img src={img ? imgSrc(img) : PLACEHOLDER} alt={listing.title} className="absolute inset-0 w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-500" onLoad={(e) => detectFacePosition(e.target)} onError={(e) => { e.target.src = PLACEHOLDER; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Available Now badge */}
        {isAvailableNow && (
          <div className="absolute bottom-12 left-2 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] text-white bg-green-500 px-2 py-1 rounded-full font-bold shadow-[0_0_12px_rgba(74,222,128,0.5)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Available Now
            </span>
          </div>
        )}

        {/* Badges — top row */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
          {/* Verified badge — blue, left */}
          {isVerified && (
            <div className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-400/30">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified
            </div>
          )}
          {!isVerified && <div />}

          {/* Featured/Premium/Highlighted badge — right */}
          <div className="flex items-center gap-1">
            {isFeatured && isPremium && (
              <div className="relative flex flex-shrink-0 items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full overflow-hidden shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-purple-400/50 text-white">
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 animate-gradient bg-[length:200%_auto]"></span>
                <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></span>
                <svg className="relative z-10 w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="relative z-10 uppercase tracking-wider">Premium</span>
              </div>
            )}
            {isFeatured && !isPremium && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Featured
              </div>
            )}
            {isHighlightedValid && !isFeatured && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                Highlighted
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          {listing.neighborhood && <p className="text-white/60 text-[10px] mb-0.5">{listing.neighborhood}</p>}
          <p className="text-white font-semibold text-xs line-clamp-2">{listing.title}</p>
          {listing.age && <p className="text-white/60 text-[10px] mt-0.5">{listing.age} yrs</p>}
        </div>
      </div>
    </Link>
  );
}
