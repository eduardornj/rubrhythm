"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@components/MainLayout";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import FavoriteButton from "@/app/components/FavoriteButton";
import dynamic from "next/dynamic";
const PhotoModal = dynamic(() => import("../../components/PhotoModal"), { ssr: false });
import ListingCard from "@components/ListingCard";
import { processListingImages } from "@/lib/image-utils";

function safeJsonParse(str, fallback = []) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export default function ListingDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredListings, setFeaturedListings] = useState([]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listing/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Anúncio não encontrado");
          return;
        }

        setListing(data);

        // Fetch featured listings and favorite status in parallel (eliminates waterfall)
        const parallelRequests = [
          fetch(`/api/listings?city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&featured=true&limit=8`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null),
        ];

        if (session?.user?.id) {
          parallelRequests.push(
            fetch(`/myaccount/api/favorites/check?listingId=${params.id}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          );
        }

        const [featuredData, favData] = await Promise.all(parallelRequests);

        if (featuredData?.listings) {
          setFeaturedListings(featuredData.listings.filter(l => l.id !== params.id));
        }
        if (favData) {
          setIsFavorited(favData.isFavorited);
        }
      } catch (err) {
        console.error("Erro ao carregar anúncio:", err);
        setError("Erro ao carregar anúncio");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id, session?.user?.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando anúncio...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Anúncio não encontrado</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-accent text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">Anúncio não encontrado</h2>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-accent text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const images = processListingImages(listing.images);
  const selectedPhoto = images[photoIndex] || images[0];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span>›</span>
          <span className="text-text">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden mb-6">
                <div className="aspect-video relative">
                  <Image
                    src={selectedPhoto}
                    alt={listing.title}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-300"
                  />

                  {/* Navigation Buttons */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
                    >
                      View Larger
                    </button>
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIndex(photoIndex > 0 ? photoIndex - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setPhotoIndex(photoIndex < images.length - 1 ? photoIndex + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setPhotoIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${index === photoIndex
                            ? 'border-primary ring-2 ring-primary/50 scale-105'
                            : 'border-slate-600 hover:border-primary/50'
                            }`}
                        >
                          <img
                            src={image}
                            alt={`${listing.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Listing Details */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <span>{listing.city}, {listing.state}</span>
                    {listing.age && <span>Idade: {listing.age}</span>}
                  </div>
                </div>
                {session?.user?.id && (
                  <FavoriteButton
                    listingId={listing.id}
                    initialIsFavorited={isFavorited}
                  />
                )}
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-2 mb-6">
                {listing.isHighlighted && (
                  <span className="inline-flex items-center gap-1 text-xs text-yellow-300 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Em Destaque
                  </span>
                )}
                {listing.isFeatured && (
                  <span className="text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                    Premium
                  </span>
                )}
                {listing.user?.verified && (
                  <span className="text-xs text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                    Verificado
                  </span>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Descrição</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listing.serviceLocation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Local de Atendimento</h4>
                    <p className="text-white">{listing.serviceLocation}</p>
                  </div>
                )}
                {listing.availability && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Disponibilidade</h4>
                    <p className="text-white">{listing.availability}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Info */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Contato</h3>

              {listing.phoneArea && listing.phoneNumber && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Telefone</h4>
                  <p className="text-white font-mono">({listing.phoneArea}) {listing.phoneNumber}</p>
                </div>
              )}

              {listing.whatsapp && (
                <div className="mb-4">
                  <a
                    href={`https://wa.me/${listing.phoneArea}${listing.phoneNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              )}

              {listing.telegram && (
                <div className="mb-4">
                  <a
                    href={`https://t.me/${listing.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    Telegram
                  </a>
                </div>
              )}

              {listing.websiteUrl && (
                <div className="mb-4">
                  <a
                    href={listing.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                </div>
              )}
            </div>

            {/* Pricing */}
            {(listing.hourlyRate || listing.priceRange) && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Preços</h3>
                {listing.hourlyRate && (
                  <div className="mb-2">
                    <span className="text-gray-400">Por hora: </span>
                    <span className="text-white font-semibold">${listing.hourlyRate}</span>
                  </div>
                )}
                {listing.priceRange && (
                  <div>
                    <span className="text-gray-400">Faixa de preço: </span>
                    <span className="text-white font-semibold">{listing.priceRange}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Listings Section */}
      {featuredListings.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Body Rub Providers Similar To {listing.title}
            </h2>
            <p className="text-gray-400">Discover more exceptional massage and wellness services in {listing.city}, {listing.state}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((featuredListing) => (
              <div key={featuredListing.id} className="group">
                <Link
                  href={featuredListing.state && featuredListing.city
                    ? `/united-states/${featuredListing.state.toLowerCase().replace(/\s+/g, '-')}/${featuredListing.city.toLowerCase().replace(/\s+/g, '-')}/massagists/${featuredListing.slug || featuredListing.id}`
                    : `/listing/${featuredListing.id}`}
                  className="block bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  {/* Featured Badge */}
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full shadow-lg">
                        ⭐ FEATURED
                      </span>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={featuredListing.images && featuredListing.images.length > 0 ? featuredListing.images[0] : '/default-image.jpg'}
                        alt={featuredListing.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {featuredListing.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{featuredListing.city}, {featuredListing.state}</span>
                      {featuredListing.hourlyRate && (
                        <span className="text-purple-300 font-medium">${featuredListing.hourlyRate}/hr</span>
                      )}
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 mt-3">
                      {featuredListing.user?.verified && (
                        <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30">
                          Verificado
                        </span>
                      )}
                      {featuredListing.isHighlighted && (
                        <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Modal */}
      <PhotoModal
        images={images}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialIndex={photoIndex}
        listingTitle={listing.title}
      />
    </MainLayout>
  );
}