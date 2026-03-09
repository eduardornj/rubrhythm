// app/united-states/[state]/[city]/massagists/page.js
import MainLayout from "@components/MainLayout";
import Link from "next/link";
import prisma from "@lib/prisma.js";
import ListingCard from "@components/ListingCard";
import { auth } from "@/auth";
import SearchBar from "../../../../../components/SearchBar";
import { safeJsonParse } from "@/lib/json-utils";

import locations from "../../../../../data/datalocations";

// Função para buscar dados da cidade
async function getCityData(state, city) {
  const normalizedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const normalizedCity = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const location = locations.find(
    (loc) =>
      loc.state === normalizedState &&
      loc.cities.some((c) => c.name === normalizedCity)
  );

  if (location) {
    const cityData = location.cities.find((c) => c.name === normalizedCity);
    return {
      name: normalizedCity,
      state: normalizedState,
      ...cityData,
    };
  }

  return {
    name: normalizedCity,
    state: normalizedState,
  };
}

// Função para buscar listings
async function getListings(state, city) {
  try {
    const normalizedState = state.replace("-", " ");
    const normalizedCity = city.replace("-", " ");

    const listings = await prisma.listing.findMany({
      where: {
        state: { contains: normalizedState },
        city: { contains: normalizedCity },
        isApproved: true,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return listings.map((listing) => {
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
        availability,
      };
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
}

// Função para buscar favoritos do usuário
async function getFavorites(userId) {
  if (!userId) return [];
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return favorites.map((fav) => fav.listingId);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}

// Função para buscar listings em destaque
async function getFeaturedListings(state, city) {
  try {
    const normalizedState = state.replace("-", " ");
    const normalizedCity = city.replace("-", " ");

    const featuredListings = await prisma.listing.findMany({
      where: {
        state: { contains: normalizedState },
        city: { contains: normalizedCity },
        isApproved: true,
        isActive: true,
        isFeatured: true,
        featuredEndDate: {
          gte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    return featuredListings.map((listing) => {
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
        availability,
      };
    });
  } catch (error) {
    console.error("Error fetching featured listings:", error);
    return [];
  }
}

export default async function MassagistsPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state, city } = params;

  const session = await auth();
  const userId = session?.user?.id;

  const cityData = await getCityData(state, city);
  const listings = await getListings(state, city);
  const favoriteIds = await getFavorites(userId);
  const featuredListings = await getFeaturedListings(state, city);

  // Formatar state e city para passar como props
  const formattedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const formattedCity = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <MainLayout>
      <SearchBar currentState={formattedState} currentCity={formattedCity} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-text">
          {cityData.name} Massagists & Body Rub Providers
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-text">
          Professional Massage Services in {cityData.name}
        </h2>

        {/* Featured Listings Section */}
        {featuredListings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-text">
              ⭐ Featured Providers in {cityData.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  state={state}
                  city={city}
                  isFavorited={favoriteIds.includes(listing.id)}
                  featured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Listings Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-text text-lg mb-4">
                No massagists found in {cityData.name}.
              </p>
              <p className="text-gray-400">
                Try another city or check back later!
              </p>
              <Link
                href={`/united-states/${state}`}
                className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                Browse Other Cities in {formattedState}
              </Link>
            </div>
          ) : (
            listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                state={state}
                city={city}
                isFavorited={favoriteIds.includes(listing.id)}
              />
            ))
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link
            href={`/united-states/${state}`}
            className="bg-secondary text-text px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors border border-accent"
          >
            ← Back to {formattedState}
          </Link>
          <Link
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors"
          >
            Browse All States
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

// Generate static params for all state/city combinations
export async function generateStaticParams() {
  const params = [];

  locations.forEach((location) => {
    const stateSlug = location.state.toLowerCase().replace(/\s+/g, "-");
    location.cities.forEach((city) => {
      const citySlug = city.name.toLowerCase().replace(/\s+/g, "-");
      params.push({
        state: stateSlug,
        city: citySlug,
      });
    });
  });

  return params;
}