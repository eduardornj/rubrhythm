// app/united-states/[state]/[city]/page.js
import MainLayout from "@components/MainLayout";
import { Link } from "@/i18n/navigation";
import prisma from "@lib/prisma.js";
import ListingCard from "@components/ListingCard";
import { auth } from "@/auth";
import SearchBar from "@/components/SearchBar";
import { safeJsonParse } from "@/lib/json-utils";
import { getTranslations } from "next-intl/server";

import locations from "@/data/datalocations";
import cityContent from "@/data/cityContent";

export async function generateStaticParams() {
  const paths = [];

  locations.forEach((location) => {
    const stateSlug = location.state.toLowerCase().replace(/\s+/g, "-");
    location.cities.forEach((city) => {
      const citySlug = city.name.toLowerCase().replace(/\s+/g, "-");
      paths.push({
        state: stateSlug,
        city: citySlug,
      });
    });
  });

  return paths;
}

async function getCityData(state, city) {
  const normalizedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const normalizedCity = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const stateData = locations.find((loc) => loc.state === normalizedState);
  if (stateData) {
    const cityData = stateData.cities.find((c) => c.name === normalizedCity);
    if (cityData) {
      return { name: cityData.name };
    }
  }

  return { name: normalizedCity };
}

async function getListings(state, city) {
  const formattedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const formattedCity = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const listings = await prisma.listing.findMany({
    where: {
      state: formattedState,
      city: formattedCity,
      isActive: true,
      isApproved: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      priceRange: true,
      hourlyRate: true,
      services: true,
      availability: true,
      age: true,
      state: true,
      city: true,
      userId: true,
      createdAt: true,
      lastBumpUp: true,
      isFeatured: true,
      featureTier: true,
      featuredEndDate: true,
      isHighlighted: true,
      highlightEndDate: true,
      availableNow: true,
      availableUntil: true,
      isWhatsAppAvailable: true,
      averageRating: true,
      totalReviews: true,
      user: {
        select: { verified: true }
      }
    },
    orderBy: [{ lastBumpUp: 'desc' }, { createdAt: 'desc' }],
    take: 24,
  });

  // Simplificar para evitar problemas de memória - apenas retornar os listings
  return listings.map(listing => {
    let images = [];
    let services = [];
    let availability = [];

    images = safeJsonParse(listing.images);
    services = safeJsonParse(listing.services);
    availability = safeJsonParse(listing.availability);

    return {
      ...listing,
      images,
      services,
      availability
    };
  });
}

const TIER1_CITIES = ["New York", "Los Angeles", "Las Vegas", "Miami"];
const TIER2_CITIES = ["Chicago", "Houston", "Atlanta", "Phoenix", "Dallas", "San Francisco", "Orlando", "Denver", "San Diego", "Seattle", "Philadelphia", "Tampa"];

async function getFoundingSpots(formattedCity) {
  const foundingLimit = TIER1_CITIES.includes(formattedCity) ? 50 : TIER2_CITIES.includes(formattedCity) ? 25 : 10;
  const taken = await prisma.listing.count({
    where: { city: formattedCity, isFoundingProvider: true },
  });
  const remaining = Math.max(0, foundingLimit - taken);
  return { remaining, foundingLimit };
}

async function getFavorites(userId) {
  if (!userId) return [];

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { listingId: true },
    take: 100, // Limitar favoritos para evitar problemas de memória
  });

  return favorites.map((fav) => fav.listingId);
}

async function getFeaturedListings(state, city, excludeId = null) {
  const formattedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const formattedCity = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const currentDate = new Date();

  const featuredListings = await prisma.listing.findMany({
    where: {
      state: formattedState,
      city: formattedCity,
      isActive: true,
      isApproved: true,
      isFeatured: true,
      featuredEndDate: {
        gt: currentDate
      },
      ...(excludeId && { id: { not: excludeId } })
    },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      priceRange: true,
      hourlyRate: true,
      services: true,
      availability: true,
      age: true,
      state: true,
      city: true,
      userId: true,
      createdAt: true,
      isFeatured: true,
      featuredEndDate: true,
      featureTier: true,
      isHighlighted: true,
      highlightEndDate: true,
      availableNow: true,
      availableUntil: true,
      isWhatsAppAvailable: true,
      user: {
        select: {
          verified: true
        }
      }
    },
    take: 8, // Limitar a 8 listings featured
    orderBy: {
      createdAt: 'desc'
    }
  });

  return featuredListings.map(listing => {
    let images = [];
    let services = [];
    let availability = [];

    images = safeJsonParse(listing.images);
    services = safeJsonParse(listing.services);
    availability = safeJsonParse(listing.availability);

    return {
      ...listing,
      images,
      services,
      availability
    };
  });
}

export const dynamicParams = true;
export const revalidate = 60; // revalidate every 60 seconds

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state, city } = params;
  const formattedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedState = state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const count = await prisma.listing.count({ where: { state: formattedState, city: formattedCity, isActive: true, isApproved: true } });

  return {
    title: `Body Rubs & Massage in ${formattedCity}, ${formattedState}`,
    description: `Find ${count > 0 ? count + ' verified' : 'top-rated'} body rub & massage providers in ${formattedCity}, ${formattedState}. Browse profiles, read reviews, and connect directly.`,
    alternates: { canonical: `/united-states/${state}/${city}` },
    ...(count === 0 && { robots: { index: false, follow: true } }),
    openGraph: {
      title: `Body Rubs & Massage in ${formattedCity}, ${formattedState}`,
      description: `${count > 0 ? count + ' providers' : 'Top providers'} in ${formattedCity}, ${formattedState} on RubRhythm.`,
      type: 'website',
    }
  };
}

export default async function CityPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state, city } = params;
  const t = await getTranslations("city");

  const session = await auth();
  const userId = session?.user?.id;

  const formattedState = state.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const formattedCity = city.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const cityData = await getCityData(state, city);
  const [listings, favoriteIds, featuredListings, { remaining: foundingRemaining }] = await Promise.all([
    getListings(state, city),
    getFavorites(userId),
    getFeaturedListings(state, city),
    getFoundingSpots(formattedCity),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Body Rubs & Massage in ${formattedCity}, ${formattedState}`,
    "description": `Find verified massage and body rub providers in ${formattedCity}, ${formattedState}`,
    "numberOfItems": listings.length,
    "itemListElement": listings.slice(0, 10).map((l, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": l.title,
      "url": `https://rubrhythm.com/united-states/${state}/${city}/massagists/${l.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${l.id}`
    }))
  };

  return (
    <MainLayout>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SearchBar currentState={formattedState} currentCity={formattedCity} />

      <div className="container mx-auto px-4 py-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-6 flex-wrap">
          <Link href="/" className="hover:text-white/60 transition-colors">{t("breadcrumbHome")}</Link>
          <span>/</span>
          <Link href="/united-states" className="hover:text-white/60 transition-colors">{t("breadcrumbUS")}</Link>
          <span>/</span>
          <Link href={`/united-states/${state}`} className="hover:text-white/60 transition-colors">{formattedState}</Link>
          <span>/</span>
          <span className="text-white/60">{formattedCity}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{t("title", { city: formattedCity })}</h1>
              <p className="text-text-muted text-sm">
                {t("subtitle", { city: formattedCity, state: formattedState })}
              </p>
            </div>
            {listings.length > 0 && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-shrink-0">
                <span className="text-2xl font-black text-white">{listings.length}</span>
                <span className="text-xs text-text-muted leading-tight whitespace-pre-line">{t("providersAvailable")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Provider CTA Banner */}
        <div className={`mb-8 rounded-2xl border p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r ${foundingRemaining > 0 ? 'border-amber-500/30 from-amber-500/10 to-amber-500/5' : 'border-primary/20 from-primary/10 to-primary/5'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${foundingRemaining > 0 ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
              {foundingRemaining > 0 ? '⭐' : '💆'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t("areYouProvider", { city: formattedCity })}</p>
              {foundingRemaining > 0 ? (
                <p className="text-amber-400/80 text-xs mt-0.5 font-medium">
                  {t("foundingSpots", { count: foundingRemaining, city: formattedCity })} — {t("foundingFree")}
                </p>
              ) : (
                <p className="text-white/50 text-xs mt-0.5">{t("createProfile")}</p>
              )}
            </div>
          </div>
          <Link
            href="/register-on-rubrhythm"
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${foundingRemaining > 0 ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-primary hover:bg-primary/90 text-white'}`}
          >
            {foundingRemaining > 0 ? t("claimSpot") : t("listFree")}
          </Link>
        </div>

        {/* Main Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-4 text-center py-16">
              <p className="text-white/40 text-lg">{t("noProviders", { city: formattedCity })}</p>
              <p className="text-white/20 text-sm mt-2">{t("beFirst")}</p>
            </div>
          ) : (
            listings.map((listing, idx) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                state={state}
                city={city}
                isFavorited={favoriteIds.includes(listing.id)}
                priority={idx < 4}
              />
            ))
          )}
        </div>

        {/* Featured Section */}
        {featuredListings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">{t("featuredProviders", { city: formattedCity })}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  state={state}
                  city={city}
                  isFavorited={favoriteIds.includes(listing.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SEO Content Block */}
        <div className="mt-8 glass-card p-6 prose prose-invert max-w-none">
          <h2 className="text-lg font-bold text-white mb-3">{t("seoTitle", { city: formattedCity, state: formattedState })}</h2>
          {cityContent[formattedCity]?.content ? (
            cityContent[formattedCity].content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-white/50 text-sm leading-relaxed mb-3">{paragraph}</p>
            ))
          ) : (
            <p className="text-white/50 text-sm leading-relaxed">
              {t("seoDefault", { city: formattedCity, state: formattedState })}
              {listings.length > 0 && ` ${t("currentlyActive", { count: listings.length, city: formattedCity })}`}
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}