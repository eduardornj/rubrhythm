import MainLayout from "@components/MainLayout";
import prisma from "@lib/prisma.js";
import ListingCard from "@components/ListingCard";
import { auth } from "@/auth";
import Link from "next/link";
import SearchResultsClient from "./SearchResultsClient";

async function getListings(keyword, state, city, filters = {}) {
  const formattedState = state
    ? state
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    : undefined;
  const formattedCity = city
    ? city
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    : undefined;

  const whereClause = {
    AND: [
      keyword
        ? {
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }
        : {},
      formattedState ? { state: formattedState } : {},
      formattedCity ? { city: formattedCity } : {},
      { isApproved: true },
      filters.bodyType?.length > 0 ? { bodyType: { in: filters.bodyType } } : {},
      filters.ethnicity?.length > 0 ? { ethnicity: { in: filters.ethnicity } } : {},
      filters.ageRange?.length > 0
        ? {
          OR: filters.ageRange.map((range) => {
            switch (range) {
              case "18-25": return { age: { gte: 18, lte: 25 } };
              case "26-30": return { age: { gte: 26, lte: 30 } };
              case "31-35": return { age: { gte: 31, lte: 35 } };
              case "36-40": return { age: { gte: 36, lte: 40 } };
              case "41+": return { age: { gte: 41 } };
              default: return {};
            }
          }),
        }
        : {},
      filters.priceRange?.length > 0
        ? {
          OR: filters.priceRange.map((range) => {
            const r = range.replace('$', '');
            switch (r) {
              case "0-100": return { hourlyRate: { lt: 100 } };
              case "100-200": return { hourlyRate: { gte: 100, lt: 200 } };
              case "200-300": return { hourlyRate: { gte: 200, lt: 300 } };
              case "300-400": return { hourlyRate: { gte: 300, lt: 400 } };
              case "400+": return { hourlyRate: { gte: 400 } };
              default: return {};
            }
          }),
        }
        : {},
      filters.serviceLocation?.length > 0
        ? {
          OR: [
            { serviceLocation: { in: filters.serviceLocation } },
            { serviceLocation: 'Both' }
          ]
        }
        : {},
      filters.availableNow ? { availableNow: true } : {},
      filters.minRating > 0 ? { averageRating: { gte: filters.minRating } } : {},
      filters.verified ? { user: { verified: true } } : {},
      filters.featured ? { isFeatured: true } : {},
    ].filter((c) => Object.keys(c).length > 0),
  };

  const listings = await prisma.listing.findMany({
    where: whereClause,
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
      bodyType: true,
      ethnicity: true,
      state: true,
      city: true,
      serviceLocation: true,
      availableNow: true,
      availableUntil: true,
      userId: true,
      createdAt: true,
      isFeatured: true,
      isHighlighted: true,
      featuredEndDate: true,
      highlightEndDate: true,
      averageRating: true,
      totalReviews: true,
      user: {
        select: { id: true, name: true, verified: true, image: true },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { isHighlighted: "desc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });

  const now = new Date();

  return listings.map((listing) => {
    const isFeaturedValid =
      listing.isFeatured && listing.featuredEndDate && new Date(listing.featuredEndDate) > now;
    const isHighlightedValid =
      listing.isHighlighted && listing.highlightEndDate && new Date(listing.highlightEndDate) > now;

    let images = [], services = [], availability = [];
    try { images = typeof listing.images === "string" ? JSON.parse(listing.images) : listing.images || []; } catch { }
    try { services = typeof listing.services === "string" ? JSON.parse(listing.services) : listing.services || []; } catch { }
    try { availability = typeof listing.availability === "string" ? JSON.parse(listing.availability) : listing.availability || []; } catch { }

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      priceRange: listing.priceRange,
      hourlyRate: listing.hourlyRate,
      age: listing.age,
      bodyType: listing.bodyType,
      ethnicity: listing.ethnicity,
      state: listing.state,
      city: listing.city,
      serviceLocation: listing.serviceLocation,
      availableNow: listing.availableNow,
      availableUntil: listing.availableUntil?.toISOString() ?? null,
      userId: listing.userId,
      createdAt: listing.createdAt?.toISOString() ?? null,
      isFeatured: !!isFeaturedValid,
      isHighlighted: !!isHighlightedValid,
      averageRating: listing.averageRating ?? 0,
      totalReviews: listing.totalReviews ?? 0,
      images,
      services,
      availability,
      user: listing.user || null,
    };
  });
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

export default async function SearchResultsPage({ searchParams: searchParamsPromise }) {
  // Aguardar a resolução de searchParams
  const searchParams = await searchParamsPromise;
  const keyword = searchParams?.keyword || "";
  const state = searchParams?.state || "";
  const city = searchParams?.city || "";

  // Extract filters from search params
  const filters = {
    priceRange: searchParams?.priceRange?.split(',').filter(Boolean) || [],
    bodyType: searchParams?.bodyType?.split(',').filter(Boolean) || [],
    ethnicity: searchParams?.ethnicity?.split(',').filter(Boolean) || [],
    services: searchParams?.services?.split(',').filter(Boolean) || [],
    ageRange: searchParams?.ageRange?.split(',').filter(Boolean) || [],
    availability: searchParams?.availability?.split(',').filter(Boolean) || [],
    serviceLocation: searchParams?.serviceLocation?.split(',').filter(Boolean) || [],
    availableNow: searchParams?.availableNow === 'true',
    minRating: parseInt(searchParams?.minRating) || 0,
    verified: searchParams?.verified === 'true',
    featured: searchParams?.featured === 'true'
  };

  const session = await auth();
  const userId = session?.user?.id;

  const listings = await getListings(keyword, state, city, filters);
  const favoriteIds = await getFavorites(userId);

  // Format state and city names for display
  const formattedState = state
    ? state.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : "";
  const formattedCity = city
    ? city.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : "";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center mb-6 btn-ghost"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Search Results Client Component */}
        <SearchResultsClient
          initialListings={listings}
          favoriteIds={favoriteIds}
          keyword={keyword}
          state={formattedState}
          city={formattedCity}
        />
      </div>
    </MainLayout>
  );
}