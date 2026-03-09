"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

const BODY_TYPES = [
  "Slim", "Athletic", "Average", "Curvy", "BBW", "Muscular", "Petite", "Tall"
];

const ETHNICITIES = [
  "Latina", "Brazilian", "Mexican", "Puerto Rican", "Venezuelan", "Colombian",
  "Asian", "Ebony/Black", "Caucasian/White", "Mixed/Exotic"
];

const SERVICE_LOCATIONS = [
  { value: "Incall", label: "Incall (Her Place)" },
  { value: "Outcall", label: "Outcall (Your Place)" },
  { value: "Both", label: "Both" }
];

const SERVICES = [
  "Swedish Massage", "Deep Tissue", "Hot Stone", "Aromatherapy", "Sports Massage",
  "Reflexology", "Thai Massage", "Shiatsu", "Prenatal Massage", "Couples Massage",
  "Body Scrub", "Nuru Massage", "Tantric Massage", "Sensual Massage"
];

const PRICE_RANGES = [
  { value: "$0-100", label: "Under $100" },
  { value: "$100-200", label: "$100 - $200" },
  { value: "$200-300", label: "$200 - $300" },
  { value: "$300-400", label: "$300 - $400" },
  { value: "$400+", label: "$400+" }
];

const AGE_RANGES = [
  { value: "18-25", label: "18-25" },
  { value: "26-30", label: "26-30" },
  { value: "31-35", label: "31-35" },
  { value: "36-40", label: "36-40" },
  { value: "41+", label: "41+" }
];

const AVAILABILITY_OPTIONS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "Morning (6AM-12PM)", "Afternoon (12PM-6PM)", "Evening (6PM-12AM)", "Late Night (12AM-6AM)"
];

export default function AdvancedSearchFilters({ onFiltersChange, initialFilters = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: initialFilters.priceRange || [],
    bodyType: initialFilters.bodyType || [],
    ethnicity: initialFilters.ethnicity || [],
    services: initialFilters.services || [],
    ageRange: initialFilters.ageRange || [],
    availability: initialFilters.availability || [],
    serviceLocation: initialFilters.serviceLocation || [],
    availableNow: initialFilters.availableNow || false,
    minRating: initialFilters.minRating || 0,
    verified: initialFilters.verified || false,
    featured: initialFilters.featured || false,
    ...initialFilters
  });

  // Load filters from URL params on mount
  useEffect(() => {
    const urlFilters = {
      priceRange: searchParams.get('priceRange')?.split(',').filter(Boolean) || [],
      bodyType: searchParams.get('bodyType')?.split(',').filter(Boolean) || [],
      ethnicity: searchParams.get('ethnicity')?.split(',').filter(Boolean) || [],
      services: searchParams.get('services')?.split(',').filter(Boolean) || [],
      ageRange: searchParams.get('ageRange')?.split(',').filter(Boolean) || [],
      availability: searchParams.get('availability')?.split(',').filter(Boolean) || [],
      serviceLocation: searchParams.get('serviceLocation')?.split(',').filter(Boolean) || [],
      availableNow: searchParams.get('availableNow') === 'true',
      minRating: parseInt(searchParams.get('minRating')) || 0,
      verified: searchParams.get('verified') === 'true',
      featured: searchParams.get('featured') === 'true'
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const handleFilterChange = (filterType, value, isChecked) => {
    const newFilters = { ...filters };

    if (filterType === 'minRating' || filterType === 'verified' || filterType === 'featured' || filterType === 'availableNow') {
      newFilters[filterType] = value;
    } else {
      if (isChecked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
    }

    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: [],
      bodyType: [],
      ethnicity: [],
      services: [],
      ageRange: [],
      availability: [],
      serviceLocation: [],
      availableNow: false,
      minRating: 0,
      verified: false,
      featured: false
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filter) => {
      if (Array.isArray(filter)) {
        return count + filter.length;
      } else if (typeof filter === 'boolean') {
        return count + (filter ? 1 : 0);
      } else if (typeof filter === 'number') {
        return count + (filter > 0 ? 1 : 0);
      }
      return count;
    }, 0);
  };

  const FilterSection = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );

  const CheckboxGroup = ({ options, filterType, selectedValues }) => (
    <div className="space-y-2">
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const isChecked = selectedValues.includes(value);

        return (
          <label key={value} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleFilterChange(filterType, value, e.target.checked)}
              className="w-4 h-4 text-primary bg-surface border-white/20 rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-text-muted group-hover:text-white transition-colors">
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Trigger Button */}
      <div className="w-full sm:w-auto flex justify-end">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-surface border border-white/10 rounded-full hover:bg-surface-hover hover:border-white/20 transition-all shadow-sm"
        >
          <FunnelIcon className="w-5 h-5 text-primary" />
          <span className="font-medium text-white">All Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ml-1">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Offcanvas Modal Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsExpanded(false)}
          ></div>

          {/* Modal Panel */}
          <div className="relative w-full max-w-md bg-background border-l border-white/10 h-full flex flex-col shadow-2xl animate-slide-in-right">

            {/* Header Sticky */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-primary" />
                Filters
              </h3>
              <div className="flex items-center gap-3">
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-text-muted hover:text-white underline decoration-white/30 underline-offset-4"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

              {/* Available Now Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Available Now</h4>
                    <p className="text-xs text-text-muted/60 mt-0.5">Show only providers available right now</p>
                  </div>
                  <button
                    onClick={() => handleFilterChange('availableNow', !filters.availableNow)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${filters.availableNow ? 'bg-green-500' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.availableNow ? 'translate-x-6' : ''}`} />
                  </button>
                </label>
              </div>

              {/* Service Location */}
              <FilterSection title="Service Location">
                <div className="flex flex-wrap gap-2">
                  {SERVICE_LOCATIONS.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={filters.serviceLocation.includes(option.value)}
                        onChange={(e) => handleFilterChange('serviceLocation', option.value, e.target.checked)}
                      />
                      <div className="px-4 py-1.5 border border-white/10 rounded-full text-sm text-text-muted transition-all peer-checked:bg-white peer-checked:text-black hover:border-white/30">
                        {option.label}
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div className="grid grid-cols-2 gap-3">
                  {PRICE_RANGES.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={filters.priceRange.includes(option.value)}
                        onChange={(e) => handleFilterChange('priceRange', option.value, e.target.checked)}
                      />
                      <div className="px-4 py-2 border border-white/10 rounded-xl text-center text-sm font-medium text-text-muted transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:border-white/20">
                        {option.label}
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Body Type */}
              <FilterSection title="Body Type">
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map((type) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={filters.bodyType.includes(type)}
                        onChange={(e) => handleFilterChange('bodyType', type, e.target.checked)}
                      />
                      <div className="px-4 py-1.5 border border-white/10 rounded-full text-sm text-text-muted transition-all peer-checked:bg-white peer-checked:text-black hover:border-white/30">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Ethnicity */}
              <FilterSection title="Ethnicity">
                <div className="flex flex-wrap gap-2">
                  {ETHNICITIES.map((type) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={filters.ethnicity.includes(type)}
                        onChange={(e) => handleFilterChange('ethnicity', type, e.target.checked)}
                      />
                      <div className="px-4 py-1.5 border border-white/10 rounded-full text-sm text-text-muted transition-all peer-checked:bg-white peer-checked:text-black hover:border-white/30">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Age Range */}
              <FilterSection title="Age Range">
                <div className="grid grid-cols-3 gap-3">
                  {AGE_RANGES.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={filters.ageRange.includes(option.value)}
                        onChange={(e) => handleFilterChange('ageRange', option.value, e.target.checked)}
                      />
                      <div className="px-4 py-2 border border-white/10 rounded-xl text-center text-sm font-medium text-text-muted transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:border-white/20">
                        {option.label}
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Services List (Standard Checkboxes) */}
              <FilterSection title="Services">
                <CheckboxGroup
                  options={SERVICES}
                  filterType="services"
                  selectedValues={filters.services}
                />
              </FilterSection>

              {/* Availability List */}
              <FilterSection title="Availability">
                <CheckboxGroup
                  options={AVAILABILITY_OPTIONS}
                  filterType="availability"
                  selectedValues={filters.availability}
                />
              </FilterSection>

              {/* Rating */}
              <FilterSection title="Minimum Rating">
                <select
                  id="asf-minrating"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:border-primary outline-none"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars Rating</option>
                  <option value={4}>4+ Stars Rating</option>
                  <option value={5}>5 Stars Only (Perfect)</option>
                </select>
              </FilterSection>

            </div>

            {/* Sticky Footer */}
            <div className="p-5 border-t border-white/10 bg-surface/80 backdrop-blur-md sticky bottom-0 z-10">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full btn-primary py-3.5 text-base font-bold shadow-lg shadow-primary/20"
              >
                Show Results
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}