"use client";

import MainLayout from "@components/MainLayout";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import FavoriteButton from "@/app/components/FavoriteButton";
import ReportButton from "@/components/ReportButton";
import dynamic from "next/dynamic";
const PhotoModal = dynamic(() => import("../../../../../components/PhotoModal"), { ssr: false });
import { getFirstListingImage } from "@/lib/image-utils";
import { detectFacePosition } from "@/lib/face-focus";
import ReviewForm from "@/components/ReviewForm";
import ListingCard from "@/components/ListingCard";
import MiniCard from "@/components/MiniCard";

// ─── Skeleton ───────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-[4/3] bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-xl" />)}
            </div>
            <div className="glass-card p-6 space-y-3">
              <div className="h-6 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="glass-card p-6 h-64 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ─── Last Seen formatter ──────────────────────────────────────────────────────
function formatLastSeen(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Online now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ─── Image helper ────────────────────────────────────────────────────────────
const PLACEHOLDER = "/placeholder-provider.svg";
function imgSrc(img) {
  if (!img) return PLACEHOLDER;
  if (img.startsWith("http") || img.startsWith("/")) return img;
  return `/api/images/${img}`;
}

// ─── Stat Pill ───────────────────────────────────────────────────────────────
function StatPill({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-text-muted text-xs">{label}</p>
        <p className="text-white font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingProfilePage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const { data: session } = useSession();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(null);
  const [formattedState, setFormattedState] = useState("");
  const [formattedCity, setFormattedCity] = useState("");
  const [listingId, setListingId] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [similarListings, setSimilarListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [otherCities, setOtherCities] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Gallery
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Chat
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [existingConvId, setExistingConvId] = useState(null);
  const [chatSuccess, setChatSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isAnonymousChat, setIsAnonymousChat] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const p = await paramsPromise;
        const sp = await searchParamsPromise;
        setParams(p);

        const { state, city, slug } = p;
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 segments)
        // Slug format: name-parts-{uuid} — take last 5 segments to reconstruct full UUID
        const slugParts = slug.split("-");
        const id = slugParts.length >= 5
          ? slugParts.slice(-5).join("-")
          : slugParts.at(-1);

        setListingId(id);
        setSelectedPhoto(sp?.photo ? parseInt(sp.photo, 10) : 0);
        setFormattedState(state.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
        setFormattedCity(city.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));

        const [listingRes, similarRes, featuredRes, recentRes, citiesRes] = await Promise.all([
          fetch(`/api/listing/${id}`),
          fetch(`/api/listings/similar?listingId=${id}&city=${city}&state=${state}&limit=8`),
          fetch(`/api/listings?city=${city}&state=${state}&featured=true&limit=6`),
          fetch(`/api/listings/recent?city=${city}&state=${state}&limit=10`),
          fetch(`/api/cities/nearby?city=${city}&state=${state}&limit=6`),
        ]);

        if (!listingRes.ok) throw new Error("Listing not found");
        const data = await listingRes.json();
        setListing(data);
        setIsFavorited(data.isFavorited);

        // Increment view count (fire-and-forget)
        fetch(`/api/listings/${data.id}/view`, { method: 'POST' }).catch(() => {});

        // Fetch approved reviews for this listing
        setReviewsLoading(true);
        fetch(`/api/reviews?listingId=${id}`)
          .then((r) => r.ok ? r.json() : [])
          .then((r) => setReviews(Array.isArray(r) ? r : r.reviews || []))
          .catch(() => setReviews([]))
          .finally(() => setReviewsLoading(false));

        if (similarRes.ok) setSimilarListings(await similarRes.json() || []);
        if (featuredRes.ok) { const fd = await featuredRes.json(); setFeaturedListings(fd?.listings || []); }
        if (recentRes.ok) setRecentListings(await recentRes.json() || []);
        if (citiesRes.ok) setOtherCities(await citiesRes.json() || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [paramsPromise, searchParamsPromise]);

  // Heartbeat — update lastSeen every 5 minutes for logged-in users
  useEffect(() => {
    if (!session?.user) return;
    const beat = () => fetch('/api/user/heartbeat', { method: 'POST' }).catch(() => {});
    beat();
    const interval = setInterval(beat, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleSendMessage = async () => {
    if (!session?.user?.id) { alert("Please log in to send messages."); return; }
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    setChatError(null);
    try {
      setExistingConvId(null);
      // Create conversation and send first message (locking identity)
      const initRes = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: listing.user.id,
          listingId: listing.id,
          subject: `Inquiry via ${listing.title}`,
          isAnonymous: isAnonymousChat
        }),
      });
      if (!initRes.ok) {
        const err = await initRes.json();
        if (initRes.status === 409 && err.conversationId) {
          setExistingConvId(err.conversationId);
        }
        throw new Error(err.error || "Failed to start chat. Make sure you don't already have an active chat.");
      }
      const chatData = await initRes.json();

      const msgRes = await fetch(`/api/messages/${chatData.conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatMessage }),
      });
      if (!msgRes.ok) {
        if (msgRes.status === 402) throw new Error("Insufficient credits.");
        throw new Error("Failed to send message");
      }
      setChatMessage("");
      setChatSuccess(true);
      setTimeout(() => setChatSuccess(false), 4000);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      });
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !listing || !params) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-24 px-4">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-white text-xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-text-muted text-sm mb-6">This listing may have been removed or the link is incorrect.</p>
          <Link href="/" className="btn-primary inline-block">Browse Providers</Link>
        </div>
      </MainLayout>
    );
  }

  const { state, city } = params;
  const safeJson = (s, fb = []) => { try { return typeof s === "string" ? JSON.parse(s) : s || fb; } catch { return fb; } };
  const images = safeJson(listing.images, []);
  const services = safeJson(listing.services, []);
  const phone = listing.phoneArea && listing.phoneNumber ? `(${listing.phoneArea}) ${listing.phoneNumber}` : listing.phoneNumber;
  const isFeatured = listing.isFeatured && listing.featuredEndDate && new Date(listing.featuredEndDate) > new Date();
  const isPremium = listing.featureTier?.toUpperCase() === 'PREMIUM';
  const isAvailableNow = listing.availableNow && listing.availableUntil && new Date(listing.availableUntil) > new Date();
  const isHighlightedValid = listing.isHighlighted && listing.highlightEndDate && new Date(listing.highlightEndDate) > new Date();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="opacity-40">›</span>
          <Link href={`/united-states/${state}`} className="hover:text-primary transition-colors">{formattedState}</Link>
          <span className="opacity-40">›</span>
          <Link href={`/united-states/${state}/${city}`} className="hover:text-primary transition-colors">{formattedCity}</Link>
          <span className="opacity-40">›</span>
          <span className="text-white/70 line-clamp-1">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* ── GALLERY ──────────────────────────────────────────── */}
            <div className="glass-card p-0 overflow-hidden">
              {/* Main Image */}
              <div
                className="relative aspect-[4/5] lg:aspect-[3/4] cursor-pointer group overflow-hidden"
                onClick={() => { setModalImageIndex(selectedPhoto); setIsModalOpen(true); }}
              >
                <img
                  src={imgSrc(images[selectedPhoto] ?? images[0])}
                  alt={listing.title}
                  className="absolute inset-0 w-full h-full object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-[1.02]"
                  onLoad={(e) => detectFacePosition(e.target)}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  {isAvailableNow && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-white bg-green-500 px-3 py-1.5 rounded-full font-bold shadow-[0_0_20px_rgba(74,222,128,0.6)] animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      Available Now
                    </span>
                  )}
                  {listing.user?.verified && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-white bg-blue-500 px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(59,130,246,0.6)] tracking-wide border border-blue-400/30">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Verified
                    </span>
                  )}
                  {listing.isFoundingProvider && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Founding Provider
                    </span>
                  )}
                  {isFeatured && isPremium && (
                    <span className="relative inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-purple-400/50 text-white">
                      <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 animate-gradient bg-[length:200%_auto]"></span>
                      <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></span>
                      <svg className="relative z-10 w-4 h-4 text-yellow-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="relative z-10 uppercase tracking-[0.2em] drop-shadow-lg">Premium</span>
                    </span>
                  )}
                  {isFeatured && !isPremium && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] tracking-wide">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      Featured
                    </span>
                  )}
                  {isHighlightedValid && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-black bg-gradient-to-r from-yellow-300 to-yellow-500 px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(250,204,21,0.5)] tracking-wide">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                      Highlighted
                    </span>
                  )}
                  {listing.isWhatsAppAvailable && (
                    <span className="inline-flex items-center gap-1 text-xs text-white bg-[#25D366] px-2.5 py-1.5 rounded-full font-bold shadow-[0_0_12px_rgba(37,211,102,0.5)]" title="WhatsApp Available">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                      WhatsApp
                    </span>
                  )}
                </div>

                {/* Top right controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <FavoriteButton
                    userId={session?.user?.id}
                    listingId={listingId}
                    initialIsFavorited={isFavorited}
                    variant="sophisticated"
                    listingSlug={params.slug}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    className="w-9 h-9 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    title="Share"
                  >
                    {linkCopied ? "✓" : "↗"}
                  </button>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h1 className="text-white font-black text-2xl md:text-3xl leading-tight drop-shadow-lg">{listing.title}</h1>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-white/80 text-sm flex items-center gap-1">
                      <span>📍</span> {listing.city}, {listing.state}
                    </span>
                    {listing.neighborhood && (
                      <span className="text-white/60 text-sm">· {listing.neighborhood}</span>
                    )}
                    {formatLastSeen(listing.user?.lastSeen) && (
                      <span className="text-white/70 text-xs flex items-center gap-1.5">
                        ·
                        <span className={`w-2 h-2 rounded-full ${(Date.now() - new Date(listing.user.lastSeen).getTime()) < 3600000 ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-white/30'}`} />
                        {formatLastSeen(listing.user.lastSeen)}
                      </span>
                    )}
                    {images.length > 1 && (
                      <span className="text-white/50 text-xs ml-auto">{selectedPhoto + 1} / {images.length}</span>
                    )}
                  </div>
                </div>

                {/* Expand icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center border border-white/20">
                    <span className="text-white text-xl">⊕</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 bg-black/20 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPhoto(i)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedPhoto === i ? "border-primary shadow-md shadow-primary/30 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <Image src={imgSrc(img)} alt="" fill sizes="64px" unoptimized className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── PROFILE INFO ─────────────────────────────────────── */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-white font-bold text-base">About {listing.title}</h2>
                <div className="ml-auto flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${listing.user?.verified ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-white/10 text-text-muted"}`}>
                    {listing.user?.verified ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Verified
                      </>
                    ) : "Unverified"}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                <StatPill icon="🌎" label="Ethnicity" value={listing.ethnicity} />
                <StatPill icon="💪" label="Body Type" value={listing.bodyType} />
                <StatPill icon="🎂" label="Age" value={listing.age ? `${listing.age} yrs` : null} />
                <StatPill icon="📍" label="Service" value={listing.serviceLocation === "Both" ? "Incall & Outcall" : listing.serviceLocation} />
                <StatPill icon="🏘️" label="Area" value={listing.neighborhood} />
                <StatPill icon="🌐" label="From" value={listing.country} />
              </div>

              {/* Session Rates + Price — prominent display */}
              {(() => {
                const rates = typeof listing.rates === 'string' ? (() => { try { return JSON.parse(listing.rates); } catch { return null; } })() : listing.rates;
                const hasRates = rates && Array.isArray(rates) && rates.length > 0;
                const hasPrice = listing.priceRange || listing.hourlyRate;
                if (!hasRates && !hasPrice) return null;
                return (
                  <div className="bg-gradient-to-r from-purple-600/20 via-primary/15 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-bold text-sm uppercase tracking-wide">Session Rates</h3>
                      {hasPrice && (
                        <span className="ml-auto text-xs font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full">
                          {listing.hourlyRate ? `About $${listing.hourlyRate}` : listing.priceRange}
                        </span>
                      )}
                    </div>
                    {hasRates ? (
                      <div className="space-y-1.5">
                        {rates.map((rate, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5">
                            <span className="text-white/80 text-sm font-medium">{rate.duration || rate.label || rate.name}</span>
                            <span className="text-white font-bold text-sm">${rate.price || rate.amount || rate.rate}</span>
                          </div>
                        ))}
                      </div>
                    ) : hasPrice && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5">
                        <span className="text-white/80 text-sm font-medium">Hourly Rate</span>
                        <span className="text-white font-bold text-sm">${listing.hourlyRate}/hr</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Availability */}
              {Array.isArray(listing.availability) && listing.availability.length > 0 && (
                <div className="mb-4">
                  <p className="text-text-muted text-xs mb-2">📅 Availability</p>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.availability.map((day, i) => (
                      <span key={i} className="bg-white/5 border border-white/10 text-white text-xs px-2.5 py-1 rounded-full">{day}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div className="border-t border-white/8 pt-4">
                  <p className="text-text-muted text-xs mb-2">About</p>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}
            </div>


            {/* ── SERVICES ─────────────────────────────────────────── */}
            {services.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-white font-bold text-base">Services Offered</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.map((svc, i) => (
                    <span key={i} className="bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── CONTACT ──────────────────────────────────────────── */}
            {(phone || listing.websiteUrl || listing.isWhatsAppAvailable) && (
              <div className="glass-card p-5 border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-white font-bold text-base">Contact Details</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {phone && (
                    <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-3 bg-white/5 hover:bg-primary/10 border border-white/8 hover:border-primary/30 rounded-xl p-3.5 transition-all group">
                      <span className="text-2xl">📞</span>
                      <div>
                        <p className="text-text-muted text-xs">Phone</p>
                        <p className="text-white font-semibold text-sm group-hover:text-primary transition-colors">{phone}</p>
                      </div>
                      {listing.isWhatsAppAvailable && (
                        <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">WhatsApp</span>
                      )}
                    </a>
                  )}
                  {listing.websiteUrl && (
                    <a href={listing.websiteUrl.startsWith("http") ? listing.websiteUrl : `https://${listing.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-primary/10 border border-white/8 hover:border-primary/30 rounded-xl p-3.5 transition-all group">
                      <span className="text-2xl">🌐</span>
                      <div>
                        <p className="text-text-muted text-xs">Website</p>
                        <p className="text-white font-semibold text-sm group-hover:text-primary transition-colors truncate max-w-[200px]">{listing.websiteUrl}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── SOCIAL LINKS ─────────────────────────────────────── */}
            {(() => {
              const links = typeof listing.socialLinks === 'string' ? (() => { try { return JSON.parse(listing.socialLinks); } catch { return null; } })() : listing.socialLinks;
              if (!links || typeof links !== 'object') return null;
              const socials = [
                { key: 'twitter', label: 'Twitter / X', color: 'bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/25', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { key: 'instagram', label: 'Instagram', color: 'bg-pink-500/15 border-pink-500/30 text-pink-400 hover:bg-pink-500/25', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                { key: 'onlyfans', label: 'OnlyFans', color: 'bg-blue-400/15 border-blue-400/30 text-blue-300 hover:bg-blue-400/25', icon: <span className="text-xs font-black">OF</span> },
                { key: 'linktree', label: 'Linktree', color: 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.953 15.066l-.038-2.888 4.124-3.262-4.124.564L7.953 6.594l4.081 3.178L7.953 6.594 12.002 2l4.062 4.594-4.1 3.178 4.1-.564-4.137 3.262.038 2.888L12.002 22z"/></svg> },
              ];
              const activeSocials = socials.filter(s => links[s.key] && links[s.key].trim());
              if (activeSocials.length === 0) return null;
              return (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    <h2 className="text-white font-bold text-base">Social Media</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSocials.map(({ key, label, color, icon }) => (
                      <a
                        key={key}
                        href={links[key].startsWith('http') ? links[key] : `https://${links[key]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${color}`}
                      >
                        {icon}
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── REVIEWS ──────────────────────────────────────────── */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-white font-bold text-base">Reviews</h2>
                {listing.totalReviews > 0 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-sm ${s <= Math.round(listing.averageRating || 0) ? "text-yellow-400" : "text-white/15"}`}>★</span>
                      ))}
                    </div>
                    <span className="text-sm text-white/60 font-semibold">{(listing.averageRating || 0).toFixed(1)}</span>
                    <span className="text-xs text-white/30">({listing.totalReviews})</span>
                  </div>
                )}
              </div>

              {/* Approved reviews list */}
              {reviewsLoading ? (
                <div className="space-y-3 mb-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-white/5 rounded-xl h-16" />
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white/5 border border-white/8 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-xs ${s <= review.rating ? "text-yellow-400" : "text-white/15"}`}>★</span>
                            ))}
                          </div>
                          <span className="text-xs text-white/40 font-medium">
                            {review.isAnonymous ? "Anonymous" : (review.user_review_reviewerIdTouser?.name || "User")}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/25">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 mb-4">
                  <svg className="w-8 h-8 mx-auto mb-2 text-yellow-400/50" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <p className="text-text-muted text-sm">No reviews yet. Be the first!</p>
                </div>
              )}

              {/* Leave a review form */}
              <div className="border-t border-white/8 pt-4">
                <p className="text-white/60 text-sm font-semibold mb-3">Leave a Review</p>
                <ReviewForm
                  listingId={listing.id}
                  providerId={listing.userId}
                  onSuccess={() => {
                    fetch(`/api/reviews?listingId=${listing.id}`)
                      .then((r) => r.ok ? r.json() : [])
                      .then((r) => setReviews(Array.isArray(r) ? r : r.reviews || []))
                      .catch(() => {});
                  }}
                />
              </div>
            </div>


          </div>

          {/* ── RIGHT SIDEBAR ───────────────────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">

              {/* ── CTA CARD ─────────────────────────────────────── */}
              <div className="glass-card p-5 border-primary/20 bg-primary/5">
                {/* Phone CTA */}
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="block w-full bg-gradient-to-r from-primary to-accent text-white font-black text-center py-3.5 rounded-2xl hover:shadow-xl hover:shadow-primary/25 transition-all mb-3 hover:-translate-y-0.5"
                  >
                    📞 Call Now — {phone}
                  </a>
                )}

                {/* WhatsApp CTA */}
                {listing.isWhatsAppAvailable && phone && (
                  <a
                    href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-center py-3 rounded-2xl hover:bg-green-500/30 transition-all mb-3"
                  >
                    💬 WhatsApp
                  </a>
                )}

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="block w-full bg-white/5 border border-white/10 text-text-muted font-medium text-center py-2.5 rounded-2xl hover:bg-white/10 hover:text-white transition-all text-sm"
                >
                  {linkCopied ? "✓ Link Copied!" : "↗ Share Profile"}
                </button>

                {/* "Back to city" small link */}
                <Link href={`/united-states/${state}/${city}`} className="block text-center text-text-muted text-xs mt-3 hover:text-primary transition-colors">
                  ← Browse all in {formattedCity}
                </Link>
              </div>

              {/* ── SEND MESSAGE ─────────────────────────────────── */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h3 className="text-white font-bold text-sm">Send Private Message</h3>
                </div>

                {chatSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-xs mb-3">
                    ✓ Message sent successfully! View it in your account inbox.
                  </div>
                )}
                {chatError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 flex flex-col items-center text-center">
                    <p className="text-red-400 text-xs mb-2">⚠️ {chatError}</p>
                    {existingConvId && (
                      <Link
                        href={`/myaccount/chat`}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs px-4 py-1.5 rounded-lg transition-colors border border-red-500/30 font-semibold"
                      >
                        Go to Inbox
                      </Link>
                    )}
                  </div>
                )}

                {/* Identity Selection Block */}
                {session?.user?.id && !chatSuccess && (
                  <div className="space-y-2 mb-4">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isAnonymousChat ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                      <div className="flex items-center h-4 mt-0.5">
                        <input type="radio" checked={isAnonymousChat} onChange={() => setIsAnonymousChat(true)} className="hidden" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isAnonymousChat ? 'border-primary' : 'border-white/30'}`}>
                          {isAnonymousChat && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs font-bold ${isAnonymousChat ? 'text-white' : 'text-white/70'}`}>Anonymous Mode</span>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">2 Credits</span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed">Name & photo hidden. Fully private.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${!isAnonymousChat ? 'bg-green-500/10 border-green-500/50 ring-1 ring-green-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                      <div className="flex items-center h-4 mt-0.5">
                        <input type="radio" checked={!isAnonymousChat} onChange={() => setIsAnonymousChat(false)} className="hidden" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${!isAnonymousChat ? 'border-green-500' : 'border-white/30'}`}>
                          {!isAnonymousChat && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs font-bold ${!isAnonymousChat ? 'text-white' : 'text-white/70'}`}>Identified Mode</span>
                          <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">1 Credit</span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed">Share name ({session.user.name}) for faster replies.</p>
                      </div>
                    </label>
                  </div>
                )}

                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={session?.user?.id ? "Write your securely encrypted message here..." : "Log in to send a secure message"}
                  disabled={chatLoading || !session?.user?.id || chatSuccess}
                  rows={4}
                  className="w-full p-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-primary/50 resize-none transition-all disabled:opacity-40"
                />

                {session?.user?.id ? (
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatMessage.trim() || chatSuccess}
                    className="w-full mt-2 py-2.5 bg-white/8 border border-white/10 text-white font-semibold rounded-xl hover:bg-primary/20 hover:border-primary/30 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {chatLoading ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending Securely...</>
                    ) : chatSuccess ? "Sent ✓" : "Send Secure Message →"}
                  </button>
                ) : (
                  <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                    <p className="text-white/70 text-xs mb-2">Create a free account to send messages and view contact details</p>
                    <div className="flex gap-2">
                      <Link href="/register-on-rubrhythm" className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/80 transition-colors">
                        Join Free — 30 sec
                      </Link>
                      <Link href="/login" className="flex-1 py-2 bg-white/8 border border-white/10 text-white/60 text-xs rounded-lg hover:bg-white/12 transition-colors">
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RECENT NEARBY ─────────────────────────────── */}
              {recentListings.length > 0 && (
                <div className="glass-card p-4">
                  <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">🕐 Recent Nearby</p>
                  <div className="space-y-2">
                    {recentListings.slice(0, 10).map((post) => (
                      <Link key={post.id} href={`/united-states/${state}/${city}/massagists/${post.id}`} className="flex items-center gap-3 group hover:bg-white/5 rounded-xl p-1.5 -mx-1.5 transition-all">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                          <Image
                            src={imgSrc(post.images?.[0])}
                            alt={post.title}
                            fill
                            sizes="80px"
                            loading="lazy"
                            unoptimized
                            className="object-cover"
                            onError={(e) => { e.currentTarget.src = "/default-image.jpg"; }}
                          />
                          {/* Verified dot — green */}
                          {post.user?.verified && (
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
                          <p className="text-text-muted text-[10px] mt-0.5">{post.timeAgo}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── NEARBY CITIES ────────────────────────────────── */}
              {otherCities.length > 0 && (
                <div className="glass-card p-4">
                  <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">📍 Nearby Cities</p>
                  <div className="space-y-1.5">
                    {otherCities.map((c, i) => (
                      <Link key={i} href={`/united-states/${state}/${c.slug}`} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-all group">
                        <span className="text-text-muted text-sm group-hover:text-white transition-colors">{c.name}</span>
                        <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{c.count}+</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── DISCLAIMER ───────────────────────────────────── */}
              <div className="glass-card p-4 border-amber-500/15 bg-amber-500/5">
                <p className="text-amber-400/80 text-xs leading-relaxed">
                  ⚠️ <strong className="text-amber-400">Safety notice:</strong> Be cautious of providers who request deposits before a meeting. All services are independent — RubRhythm is a directory only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIMILAR TO ───────────────────────────────────────────── */}
        {similarListings.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">You might also like</p>
                <h2 className="text-white font-bold text-lg">Body Rub Providers Similar To <span className="text-primary">{listing?.title}</span></h2>
              </div>
              <Link href={`/united-states/${state}/${city}`} className="text-primary text-xs hover:underline whitespace-nowrap">See all in {formattedCity} →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarListings.slice(0, 8).map((l) => (
                <ListingCard key={l.id} listing={l} state={state} city={city} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PHOTO MODAL ─────────────────────────────────────────────── */}
      <PhotoModal
        images={images}
        isOpen={isModalOpen}
        initialIndex={modalImageIndex}
        onClose={() => setIsModalOpen(false)}
        listingTitle={listing?.title}
      />

      {/* ── REPORT ───────────────────────────────────────────────────── */}
      {listing && (
        <div className="max-w-6xl mx-auto px-4 pb-4 flex justify-end">
          <ReportButton listingId={listing.id} listingName={listing.title} />
        </div>
      )}
    </MainLayout>
  );
}