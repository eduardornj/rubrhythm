import Link from "next/link";
import dynamic from "next/dynamic";
import MainLayout from "@components/MainLayout";
import locations from "../data/datalocations.js";
import GeoLocationRedirect from "../components/GeoLocationRedirect";

// Client components loaded dynamically
const SearchBar = dynamic(() => import("../components/SearchBar"));

export const metadata = {
  title: "RubRhythm - Body Rubs & Massage Directory | Find Providers Near You",
  description: "Find body rub and massage providers across America. Browse verified listings in New York, Los Angeles, Miami, Chicago, and 250+ cities. Safe, verified, professional.",
  alternates: {
    canonical: "https://rubrhythm.com",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RubRhythm",
  url: "https://www.rubrhythm.com",
  logo: "https://www.rubrhythm.com/icons/icon-512x512.svg",
  description:
    "The only US massage and body rub directory where every provider is ID-verified by our team. Professional. Verified. Safe.",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Orlando",
      addressRegion: "FL",
      addressCountry: "US",
    },
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "admin@rubrhythm.com",
    contactType: "customer support",
  },
  sameAs: [],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RubRhythm",
  url: "https://www.rubrhythm.com",
  description:
    "The only US massage directory where every provider is ID-verified. Professional. Verified. Safe.",
  potentialAction: {
    "@type": "SearchAction",
    target:
      "https://www.rubrhythm.com/search-results?city={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

// Top cities for body rub & massage — ranked by market demand
const popularCities = [
  { city: "New York", state: "New York", tag: "#1 Market" },
  { city: "Los Angeles", state: "California", tag: "Hot" },
  { city: "Las Vegas", state: "Nevada", tag: "Top Demand" },
  { city: "Miami", state: "Florida", tag: "Trending" },
  { city: "Chicago", state: "Illinois", tag: "Popular" },
  { city: "Houston", state: "Texas", tag: "Growing" },
  { city: "Atlanta", state: "Georgia", tag: "Hot" },
  { city: "Phoenix", state: "Arizona", tag: "Growing" },
  { city: "Dallas", state: "Texas", tag: "Popular" },
  { city: "San Francisco", state: "California", tag: "Premium" },
  { city: "Orlando", state: "Florida", tag: "Trending" },
  { city: "Denver", state: "Colorado", tag: "Growing" },
  { city: "San Diego", state: "California", tag: "Popular" },
  { city: "Seattle", state: "Washington", tag: "Hot" },
  { city: "Philadelphia", state: "Pennsylvania", tag: "Popular" },
  { city: "Tampa", state: "Florida", tag: "Trending" },
];

export default function Home() {
  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
      <GeoLocationRedirect />

      {/* Hero Section with Glassmorphism Search */}
      <section className="relative w-full min-h-[500px] flex items-center justify-center rounded-3xl mb-16 overflow-hidden mt-8 shadow-2xl shadow-primary/10">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-surface"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>


        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md">
            <span className="text-primary font-semibold text-xs tracking-wider uppercase">Body Rub & Massage Directory</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Find <span className="text-gradient">Verified</span> Massage Providers
          </h1>

          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse ID-verified providers across 250+ US cities. Every Blue Badge listing has been confirmed by our team — safe, professional, and real.
          </p>

          {/* Glass Search Bar Container */}
          <div className="glass-card max-w-2xl mx-auto p-2">
            <SearchBar locations={locations} />
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Popular Cities</h2>
            <p className="text-text-muted mt-2">Top markets for body rub & massage services</p>
          </div>
          <Link href="/united-states" className="hidden md:flex items-center text-primary hover:text-primary-hover font-medium transition-colors">
            View All States
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCities.map((item, i) => (
            <Link
              key={`${item.state}-${item.city}`}
              href={`/united-states/${item.state.toLowerCase().replace(/\s+/g, "-")}/${item.city.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative overflow-hidden rounded-2xl glass-card p-5 hover:border-primary/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{item.tag}</span>
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-primary transition-colors">{item.city}</h3>
                <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{item.state}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 md:hidden text-center">
          <Link href="/united-states" className="btn-secondary w-full inline-block">
            View All States
          </Link>
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="mb-12 relative rounded-3xl overflow-hidden glass border border-white/10 p-10 md:p-16 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30 transform rotate-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Safety & Verification
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
            Providers can verify their identity through our free ID verification system to earn a blue Verified badge. Look for the badge when browsing — it means the provider has been confirmed by our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-verified" className="btn-primary">
              Get Verified — Free
            </Link>
            <Link href="/myaccount/listings/add-listing" className="btn-secondary">
              List Your Services
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
