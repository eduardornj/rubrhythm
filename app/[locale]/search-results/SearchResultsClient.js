"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListingCard from "@components/ListingCard";
import AdvancedSearchFilters from "@components/AdvancedSearchFilters";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { analytics } from "@/lib/analytics";
import { useTranslations } from "next-intl";

const SORT_OPTIONS_KEYS = ["mostRelevant", "highestRated", "newestFirst", "priceLowHigh", "priceHighLow", "featuredFirst"];
const SORT_VALUES = ["relevance", "rating", "newest", "price_low", "price_high", "featured"];

export default function SearchResultsClient({ initialListings, favoriteIds, keyword, state, city }) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredListings, setFilteredListings] = useState(initialListings);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    verified: searchParams.get("verified") === "true",
    featured: searchParams.get("featured") === "true",
    priceRange: searchParams.get("priceRange")?.split(',').filter(Boolean) || [],
    bodyType: searchParams.get("bodyType")?.split(',').filter(Boolean) || [],
    ethnicity: searchParams.get("ethnicity")?.split(',').filter(Boolean) || [],
    services: searchParams.get("services")?.split(',').filter(Boolean) || [],
    ageRange: searchParams.get("ageRange")?.split(',').filter(Boolean) || [],
    availability: searchParams.get("availability")?.split(',').filter(Boolean) || [],
    serviceLocation: searchParams.get("serviceLocation")?.split(',').filter(Boolean) || [],
    availableNow: searchParams.get("availableNow") === "true",
    minRating: parseInt(searchParams.get("minRating")) || 0,
  });
  const itemsPerPage = 12;

  // Track search event on initial load
  const searchTracked = useRef(false);
  useEffect(() => {
    if (!searchTracked.current && (city || state || keyword)) {
      analytics.search(city, state, keyword);
      searchTracked.current = true;
    }
  }, [city, state, keyword]);

  // Sync state with props when data changes via Next Router
  useEffect(() => {
    setFilteredListings(initialListings);
  }, [initialListings]);

  // Apply filters to listings
  const applyFilters = useMemo(() => {
    let result = [...initialListings];

    // Price Range Filter
    if (filters.priceRange?.length > 0) {
      result = result.filter(listing => {
        if (!listing.priceRange && !listing.hourlyRate) return false;

        return filters.priceRange.some(range => {
          // Normalize: strip $ prefix for comparison
          const normalizedRange = range.replace('$', '');
          const normalizedListingRange = (listing.priceRange || '').replace('$', '');
          if (normalizedListingRange === normalizedRange) return true;

          // Check hourly rate against price ranges
          if (listing.hourlyRate) {
            const rate = listing.hourlyRate;
            switch (normalizedRange) {
              case "0-100": return rate < 100;
              case "100-200": return rate >= 100 && rate < 200;
              case "200-300": return rate >= 200 && rate < 300;
              case "300-400": return rate >= 300 && rate < 400;
              case "400+": return rate >= 400;
              default: return false;
            }
          }
          return false;
        });
      });
    }

    // Body Type Filter
    if (filters.bodyType?.length > 0) {
      result = result.filter(listing =>
        listing.bodyType && filters.bodyType.includes(listing.bodyType)
      );
    }

    // Ethnicity Filter
    if (filters.ethnicity?.length > 0) {
      result = result.filter(listing =>
        listing.ethnicity && filters.ethnicity.includes(listing.ethnicity)
      );
    }

    // Age Range Filter
    if (filters.ageRange?.length > 0) {
      result = result.filter(listing => {
        if (!listing.age) return false;

        return filters.ageRange.some(range => {
          const age = listing.age;
          switch (range) {
            case "18-25": return age >= 18 && age <= 25;
            case "26-30": return age >= 26 && age <= 30;
            case "31-35": return age >= 31 && age <= 35;
            case "36-40": return age >= 36 && age <= 40;
            case "41+": return age >= 41;
            default: return false;
          }
        });
      });
    }

    // Services Filter
    if (filters.services?.length > 0) {
      result = result.filter(listing => {
        if (!listing.services || !Array.isArray(listing.services)) return false;

        return filters.services.some(service =>
          listing.services.some(listingService =>
            listingService.toLowerCase().includes(service.toLowerCase())
          )
        );
      });
    }

    // Availability Filter
    if (filters.availability?.length > 0) {
      result = result.filter(listing => {
        if (!listing.availability || !Array.isArray(listing.availability)) return false;

        return filters.availability.some(avail =>
          listing.availability.some(listingAvail =>
            listingAvail.toLowerCase().includes(avail.toLowerCase())
          )
        );
      });
    }

    // Minimum Rating Filter
    if (filters.minRating > 0) {
      result = result.filter(listing =>
        listing.averageRating >= filters.minRating
      );
    }

    // Service Location Filter
    if (filters.serviceLocation?.length > 0) {
      result = result.filter(listing => {
        if (!listing.serviceLocation) return false;
        // "Both" matches any serviceLocation filter
        if (listing.serviceLocation === 'Both') return true;
        return filters.serviceLocation.includes(listing.serviceLocation);
      });
    }

    // Available Now Filter
    if (filters.availableNow) {
      const now = new Date();
      result = result.filter(listing =>
        listing.availableNow && (!listing.availableUntil || new Date(listing.availableUntil) > now)
      );
    }

    // Verified Filter
    if (filters.verified) {
      result = result.filter(listing => listing.user?.verified === true);
    }

    // Featured Filter
    if (filters.featured) {
      result = result.filter(listing => listing.isFeatured === true);
    }

    return result;
  }, [initialListings, filters]);

  // Apply sorting
  const sortedListings = useMemo(() => {
    let result = [...applyFilters];

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "price_low":
        result.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
      case "price_high":
        result.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
        break;
      case "featured":
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
        break;
      default: // relevance
        result.sort((a, b) => {
          // Featured first, then by rating, then by date
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if ((b.averageRating || 0) !== (a.averageRating || 0)) {
            return (b.averageRating || 0) - (a.averageRating || 0);
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    return result;
  }, [applyFilters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const paginatedListings = sortedListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update URL with filters
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (typeof value === 'boolean' && value) {
        params.set(key, 'true');
      } else if (typeof value === 'number' && value > 0) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    router.push(`/search-results?${params.toString()}`, { scroll: false });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">
            {state && city ? t("titleIn", { location: `${city}, ${state}` }) : state ? t("titleIn", { location: state }) : t("title")}
          </h1>
          {keyword && (
            <p className="text-gray-400">
              {t("showingResults")} <span className="text-primary font-medium">"{keyword}"</span>
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {t("listingsFound", { count: sortedListings.length, total: initialListings.length })}
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <label htmlFor="sr-sortby" className="text-sm text-text-muted">{t("sortBy")}</label>
          <select
            id="sr-sortby"
            name="sortby"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field py-2 pr-8 appearance-none bg-surface"
          >
            {SORT_VALUES.map((val, i) => (
              <option key={val} value={val}>
                {t(SORT_OPTIONS_KEYS[i])}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Chips (Quick Filters) - Premium Mobile-First Horizontal Scroll */}
      <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar scroll-smooth">
        <div className="flex items-center space-x-3 w-max">
          <button
            onClick={() => handleFiltersChange({ ...filters, availableNow: !filters.availableNow })}
            className={`flex items-center space-x-1.5 px-4 py-2 flex-shrink-0 rounded-full border text-sm font-medium transition-all duration-300 ${filters.availableNow
              ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-lg shadow-green-500/10'
              : 'bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
          >
            {filters.availableNow && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>}
            <span>{t("availableNow")}</span>
          </button>

          <button
            onClick={() => handleFiltersChange({ ...filters, verified: !filters.verified })}
            className={`flex items-center space-x-1.5 px-4 py-2 flex-shrink-0 rounded-full border text-sm font-medium transition-all duration-300 ${filters.verified
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
              : 'bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
          >
            {filters.verified && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
            <span>{t("onlyVerified")}</span>
          </button>

          <button
            onClick={() => handleSortChange(sortBy === 'rating' ? 'relevance' : 'rating')}
            className={`flex items-center space-x-1.5 px-4 py-2 flex-shrink-0 rounded-full border text-sm font-medium transition-all duration-300 ${sortBy === 'rating'
              ? 'bg-gradient-to-r from-accent to-primary border-transparent text-white shadow-lg'
              : 'bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
          >
            <span>⭐ {t("topRated")}</span>
          </button>

          <button
            onClick={() => handleSortChange(sortBy === 'price_low' ? 'relevance' : 'price_low')}
            className={`flex items-center space-x-1.5 px-4 py-2 flex-shrink-0 rounded-full border text-sm font-medium transition-all duration-300 ${sortBy === 'price_low'
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
              : 'bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
          >
            <span>↓ {t("lowestPrice")}</span>
          </button>

          <button
            onClick={() => handleFiltersChange({ ...filters, featured: !filters.featured })}
            className={`flex items-center space-x-1.5 px-4 py-2 flex-shrink-0 rounded-full border text-sm font-medium transition-all duration-300 ${filters.featured
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-lg shadow-yellow-500/10'
              : 'bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
          >
            <span>✨ {t("featuredChip")}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedSearchFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Results Grid */}
      {paginatedListings.length === 0 ? (
        <div className="text-center py-12 glass border border-white/5 rounded-2xl">
          <MagnifyingGlassIcon className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">{t("noResults")}</h3>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            {t("noResultsDesc")}
          </p>
          <button
            onClick={() => {
              setFilters({});
              handleFiltersChange({});
            }}
            className="btn-primary"
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                state={state}
                city={city}
                isFavorited={favoriteIds.includes(listing.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-surface border border-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors font-medium shadow-sm"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-xl transition-all duration-200 font-medium border ${currentPage === pageNum
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-surface border-white/10 text-text hover:bg-surface-hover hover:border-white/20'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-surface border border-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors font-medium shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}