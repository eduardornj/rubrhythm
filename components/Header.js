"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import locations from "../data/datalocations";
import NotificationManager from "./NotificationManager";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFixedCityModalOpen, setIsFixedCityModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCity, setCurrentCity] = useState('Orlando');
  const [currentState, setCurrentState] = useState('Florida');

  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Carregar cidade do localStorage ou URL
  useEffect(() => {
    const savedCity = localStorage.getItem('currentCity');
    const savedState = localStorage.getItem('currentState');

    if (savedCity && savedState) {
      setCurrentCity(savedCity);
      setCurrentState(savedState);
    } else {
      const pathSegments = pathname.split("/").filter(Boolean);
      if (pathSegments.length >= 3 && pathSegments[0] === "united-states") {
        const stateFromUrl = pathSegments[1];
        const cityFromUrl = pathSegments[2];

        const normalizedState = stateFromUrl
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        const normalizedCity = cityFromUrl
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const stateData = locations.find((loc) => loc.state === normalizedState);
        if (stateData) {
          const cityData = stateData.cities.find((city) => city.name === normalizedCity);
          if (cityData) {
            setCurrentCity(cityData.name);
            setCurrentState(stateData.state);
            localStorage.setItem('currentCity', cityData.name);
            localStorage.setItem('currentState', stateData.state);
          }
        }
      }
    }
  }, [pathname]);

  if (status === "loading") {
    return null;
  }

  const isLoggedIn = !!session;
  const username = session?.user?.name || "User";

  // Filtrar cidades para busca
  const filteredCities = searchTerm
    ? locations
      .flatMap((loc) =>
        loc.cities.map((city) => ({
          name: city.name,
          state: loc.state,
        }))
      )
      .filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10) // Limitar a 10 resultados
    : [];

  // Função para selecionar cidade
  const handleCitySelect = (city, state) => {
    setIsLocationModalOpen(false);
    setSearchTerm("");

    // Atualizar estado local e localStorage
    setCurrentCity(city);
    setCurrentState(state);
    localStorage.setItem('currentCity', city);
    localStorage.setItem('currentState', state);

    const stateSlug = state.toLowerCase().replace(/\s+/g, "-");
    const citySlug = city.toLowerCase().replace(/\s+/g, "-");
    router.push(`/united-states/${stateSlug}/${citySlug}`);
  };

  // Cidades populares para exibir
  const popularCities = [
    { name: "New York", state: "New York" },
    { name: "Los Angeles", state: "California" },
    { name: "Las Vegas", state: "Nevada" },
    { name: "Miami", state: "Florida" },
    { name: "Chicago", state: "Illinois" },
    { name: "Houston", state: "Texas" },
    { name: "Orlando", state: "Florida" },
    { name: "Atlanta", state: "Georgia" },
  ];

  return (
    <>
      {/* Header Fixo com Glassmorphism */}
      <header className="fixed top-0 w-full z-[100] glass transition-all duration-300">
        {/* Top Bar - Opcional, mantido para links rápidos */}
        <div className="bg-primary/90 text-white py-1">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-xs lg:text-sm">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsFixedCityModalOpen(true)}
                  className="flex items-center hover:text-white/80 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {currentCity}, {currentState}
                </button>
              </div>
              <div className="hidden md:block">
                <span>Professional. Verified. Safe.</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">ID-Verified Providers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              href={currentCity ? `/united-states/${currentState?.toLowerCase().replace(/\s+/g, '-')}/${currentCity.toLowerCase().replace(/\s+/g, '-')}` : '/'}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-xl shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-xl tracking-tighter">RR</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight block">RubRhythm</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Verified Directory</span>
              </div>
            </Link>

            {/* Location Selector */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center space-x-2 bg-surface/80 border border-white/10 px-4 py-2 rounded-xl hover:bg-surface hover:border-white/20 transition-all duration-300"
              >
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-text">
                  {currentCity ? `${currentCity}, ${currentState}` : "Select Location"}
                </span>
                <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                href="/myaccount/listings/add-listing"
                className="btn-primary"
              >
                + Add Listing
              </Link>

              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <NotificationManager />
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 bg-surface/80 border border-white/10 px-4 py-2 rounded-xl hover:bg-surface hover:border-white/20 transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-white font-semibold text-sm">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-text">{username}</span>
                      <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 glass-card border border-white/10 z-50 overflow-hidden shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <div className="py-2">
                          <Link
                            href="/myaccount"
                            className="flex items-center px-4 py-3 text-text hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            My Account
                          </Link>
                          <Link
                            href="/myaccount/listings"
                            className="flex items-center px-4 py-3 text-text hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                            </svg>
                            My Listings
                          </Link>
                          <Link
                            href="/myaccount/credits"
                            className="flex items-center px-4 py-3 text-text hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            Credits
                          </Link>
                          <Link
                            href="/myaccount/chat"
                            className="flex items-center px-4 py-3 text-text hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            Messages
                          </Link>
                          <Link
                            href="/myaccount/verification"
                            className="flex items-center px-4 py-3 text-text hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Get Verified
                          </Link>
                          <hr className="my-1 border-white/10" />
                          <button
                            onClick={() => signOut()}
                            className="flex items-center w-full px-4 py-3 text-text hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="btn-ghost"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register-on-rubrhythm"
                    className="btn-secondary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-text focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-white/10">
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center justify-between bg-surface/50 border border-white/5 px-4 py-3 rounded-xl"
                >
                  <span className="text-text">
                    {currentCity ? `${currentCity}, ${currentState}` : "Select Location"}
                  </span>
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>

                <Link
                  href="/myaccount/listings/add-listing"
                  className="btn-primary text-center"
                >
                  Add Listing
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link href="/myaccount" className="text-text hover:text-accent px-4 py-2">
                      My Account
                    </Link>
                    <Link href="/myaccount/listings" className="text-text hover:text-accent px-4 py-2">
                      My Listings
                    </Link>
                    <Link href="/myaccount/credits" className="text-text hover:text-accent px-4 py-2">
                      Credits
                    </Link>
                    <Link href="/myaccount/chat" className="text-text hover:text-accent px-4 py-2">
                      Messages
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="text-text hover:text-accent px-4 py-2 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-text hover:text-accent px-4 py-2">
                      Sign In
                    </Link>
                    <Link
                      href="/register-on-rubrhythm"
                      className="btn-secondary text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Popular Cities Bar */}
        <div className="bg-surface/30 backdrop-blur-md border-t border-white/5">
          <div className="container mx-auto px-4 py-2">
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap pt-0.5">Popular:</span>
              <div className="flex items-center gap-4">
                {popularCities.map((city) => (
                  <Link
                    key={`${city.name}-${city.state}`}
                    href={`/united-states/${city.state.toLowerCase().replace(/\s+/g, "-")}/${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs text-text hover:text-white transition-colors whitespace-nowrap"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para não quebrar layout pelo fixed header */}
      <div className="h-[140px] md:h-[132px]"></div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text">Select Location</h3>
                <button
                  onClick={() => setIsLocationModalOpen(false)}
                  className="text-text hover:text-accent"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                placeholder="Search cities or states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 bg-background border border-secondary rounded-lg text-text focus:border-primary focus:outline-none mb-4"
              />

              <div className="max-h-64 overflow-y-auto">
                {searchTerm ? (
                  filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={`${city.name}-${city.state}`}
                        onClick={() => handleCitySelect(city.name, city.state)}
                        className="w-full text-left p-3 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <div className="text-text font-medium">{city.name}</div>
                        <div className="text-sm text-accent">{city.state}</div>
                      </button>
                    ))
                  ) : (
                    <p className="text-text p-3">No cities found</p>
                  )
                ) : (
                  <div>
                    <h4 className="text-accent font-medium mb-2">Popular Cities</h4>
                    {popularCities.map((city) => (
                      <button
                        key={`${city.name}-${city.state}`}
                        onClick={() => handleCitySelect(city.name, city.state)}
                        className="w-full text-left p-3 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <div className="text-text font-medium">{city.name}</div>
                        <div className="text-sm text-accent">{city.state}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed City Selection Modal */}
      {isFixedCityModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text">Change Your City</h3>
                <button
                  onClick={() => setIsFixedCityModalOpen(false)}
                  className="text-text hover:text-accent"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                placeholder="Search cities or states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 bg-background border border-secondary rounded-lg text-text focus:border-primary focus:outline-none mb-4"
              />

              <div className="max-h-64 overflow-y-auto">
                {searchTerm ? (
                  filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={`${city.name}-${city.state}`}
                        onClick={() => {
                          handleCitySelect(city.name, city.state);
                          setIsFixedCityModalOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-surface-hover rounded-xl transition-colors"
                      >
                        <div className="text-text font-medium">{city.name}</div>
                        <div className="text-sm text-accent">{city.state}</div>
                      </button>
                    ))
                  ) : (
                    <p className="text-text p-3">No cities found</p>
                  )
                ) : (
                  <div>
                    <h4 className="text-accent font-medium mb-2">Popular Cities</h4>
                    {popularCities.map((city) => (
                      <button
                        key={`${city.name}-${city.state}`}
                        onClick={() => {
                          handleCitySelect(city.name, city.state);
                          setIsFixedCityModalOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-surface-hover rounded-xl transition-colors"
                      >
                        <div className="text-text font-medium">{city.name}</div>
                        <div className="text-sm text-accent">{city.state}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}