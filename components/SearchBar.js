"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import locations from "../data/datalocations.js";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

// Carrega o react-select dinamicamente, desativando SSR
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function SearchBar({ currentState = "", currentCity = "" }) {
  const t = useTranslations("home");
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [keyword, setKeyword] = useState("");

  // Opções pro dropdown de estados
  const stateOptions = useMemo(() => {
    return locations.map((location) => ({
      value: location.state.toLowerCase().replace(/\s+/g, "-"),
      label: location.state,
    }));
  }, []);

  // Opções pro dropdown de cidades, com base no estado selecionado
  const cityOptions = useMemo(() => {
    return selectedState
      ? locations
        .find((location) => location.state.toLowerCase().replace(/\s+/g, "-") === selectedState.value)
        ?.cities.map((city) => ({
          value: city.name.toLowerCase().replace(/\s+/g, "-"),
          label: city.name,
        })) || []
      : [];
  }, [selectedState]);

  // Pré-selecionar o estado com base na prop currentState
  useEffect(() => {
    if (currentState && stateOptions.length > 0) {
      const stateOption = stateOptions.find(
        (option) => option.label.toLowerCase() === currentState.toLowerCase()
      );
      if (stateOption) {
        setSelectedState(stateOption);
      }
    }
  }, [currentState, stateOptions]);

  // Pré-selecionar a cidade com base na prop currentCity
  useEffect(() => {
    if (selectedState && currentCity && cityOptions.length > 0) {
      const cityOption = cityOptions.find(
        (option) => option.label.toLowerCase() === currentCity.toLowerCase()
      );
      if (cityOption) {
        setSelectedCity(cityOption);
      }
    }
  }, [selectedState, currentCity, cityOptions]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (keyword) searchParams.set('keyword', keyword);
    if (selectedState) searchParams.set('state', selectedState.value);
    if (selectedCity) searchParams.set('city', selectedCity.value);

    window.location.href = `/search-results?${searchParams.toString()}`;
  };

  const handleUseLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const cityCoordinates = {
            "Orlando": { lat: 28.5383, lon: -81.3792, state: "Florida" },
            "Miami": { lat: 25.7617, lon: -80.1918, state: "Florida" },
            "Los Angeles": { lat: 34.0522, lon: -118.2437, state: "California" },
            "New York": { lat: 40.7128, lon: -74.0060, state: "New York" },
            "Chicago": { lat: 41.8781, lon: -87.6298, state: "Illinois" },
            "Houston": { lat: 29.7604, lon: -95.3698, state: "Texas" },
            "Atlanta": { lat: 33.7490, lon: -84.3880, state: "Georgia" },
            "Las Vegas": { lat: 36.1699, lon: -115.1398, state: "Nevada" },
            "Phoenix": { lat: 33.4484, lon: -112.0740, state: "Arizona" },
            "Philadelphia": { lat: 39.9526, lon: -75.1652, state: "Pennsylvania" }
          };

          let nearestCity = null;
          let minDistance = Infinity;

          Object.entries(cityCoordinates).forEach(([cityName, coords]) => {
            const R = 6371;
            const dLat = (coords.lat - latitude) * Math.PI / 180;
            const dLon = (coords.lon - longitude) * Math.PI / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latitude * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = { name: cityName, state: coords.state };
            }
          });

          if (nearestCity) {
            const stateOption = stateOptions.find(o => o.label === nearestCity.state);
            if (stateOption) setSelectedState(stateOption);

            // Set timeout to allow cityOptions to re-evaluate based on new selectedState
            setTimeout(() => {
              const cityLabel = nearestCity.name;
              const autoCityOptions = locations
                .find((l) => l.state === nearestCity.state)
                ?.cities.map((city) => ({
                  value: city.name.toLowerCase().replace(/\s+/g, "-"),
                  label: city.name,
                })) || [];

              const cityOpt = autoCityOptions.find(c => c.label === cityLabel);
              if (cityOpt) setSelectedCity(cityOpt);
            }, 50);
          }
        },
        (error) => {
          alert("Could not access location. Please check browser permissions and try again.");
        },
        { timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgba(24, 24, 27, 0.6)", // bg-surface com opacidade
      borderColor: state.isFocused ? "#e11d48" : "rgba(255, 255, 255, 0.1)",
      borderWidth: "1px",
      borderRadius: "0.75rem", // xl
      boxShadow: state.isFocused ? "0 0 0 2px rgba(225, 29, 72, 0.2)" : "none",
      minHeight: "48px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#f4f4f5", // text-text
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#f4f4f5",
      fontWeight: "500",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#d4d4d8", // zinc-300, sufficient contrast on dark bg
      fontWeight: "400",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#18181b", // surface
      borderRadius: "0.75rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      overflow: "hidden",
      zIndex: 100,
    }),
    menuList: (base) => ({
      ...base,
      padding: "8px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#e11d48" // primary
        : state.isFocused
          ? "rgba(255, 255, 255, 0.05)"
          : "transparent",
      color: state.isSelected ? "white" : "#f4f4f5",
      borderRadius: "8px",
      margin: "2px 0",
      padding: "12px 16px",
      fontWeight: state.isSelected ? "600" : "400",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: state.isSelected ? "#e11d48" : "rgba(255, 255, 255, 0.05)",
      },
    }),
    input: (base) => ({
      ...base,
      color: "#f4f4f5",
    }),
  };

  return (
    <div className="w-full relative z-20">
      <div className="w-full mx-auto relative z-10">
        {/* Header moved to parent component or kept optional, for now removed inside the form to avoid duplication */}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full mx-auto">
          <div className="glass-card bg-surface/80 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Keyword Search */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="sb-keyword" className="block text-sm font-semibold text-text">
                    <MagnifyingGlassIcon className="w-4 h-4 inline mr-2 text-primary" />
                    {t("whatLookingFor")}
                  </label>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center bg-primary/10 px-2 py-1 rounded-md transition-colors"
                  >
                    <MapPinIcon className="w-3 h-3 mr-1" /> {t("useMyLocation")}
                  </button>
                </div>
                <input
                  id="sb-keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="input-field"
                />
              </div>

              {/* State Selection */}
              <div>
                <p className="block text-sm font-semibold text-text mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-2 text-primary" />
                  {t("state")}
                </p>
                <Select
                  inputId="sb-state"
                  aria-label={t("state")}
                  options={stateOptions}
                  value={selectedState}
                  onChange={(option) => {
                    setSelectedState(option);
                    setSelectedCity(null); // Reset city when state changes
                  }}
                  placeholder={t("selectState")}
                  className="text-base"
                  classNamePrefix="select"
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>

              {/* City Selection */}
              <div>
                <p className="block text-sm font-semibold text-text mb-2 flex items-center">
                  <span className="w-4 h-4 mr-2">🏙️</span>
                  {t("city")}
                </p>
                <Select
                  inputId="sb-city"
                  aria-label={t("city")}
                  options={cityOptions}
                  value={selectedCity}
                  onChange={setSelectedCity}
                  placeholder={selectedState ? t("selectCity") : t("chooseStateFirst")}
                  className="text-base"
                  classNamePrefix="select"
                  isDisabled={!selectedState}
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-6 mt-6 border-t border-white/5 pt-6">
              <p className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">{t("quickFilters")}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t("underPrice"), param: "priceRange", value: "0-100,100-200" },
                  { label: t("midPrice"), param: "priceRange", value: "200-300,300-400" },
                  { label: t("verifiedOnly"), param: "verified", value: "true" },
                  { label: t("featured"), param: "featured", value: "true" }
                ].map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => {
                      const searchParams = new URLSearchParams();
                      if (keyword) searchParams.set('keyword', keyword);
                      if (selectedState) searchParams.set('state', selectedState.value);
                      if (selectedCity) searchParams.set('city', selectedCity.value);
                      searchParams.set(filter.param, filter.value);
                      window.location.href = `/search-results?${searchParams.toString()}`;
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-surface hover:bg-white/10 text-text-muted hover:text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                className="btn-primary w-full md:w-auto md:px-12 py-4 flex items-center justify-center gap-2 text-lg"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
                {t("findProviders")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}