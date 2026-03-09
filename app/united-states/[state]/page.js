import MainLayout from "@components/MainLayout";
import Link from "next/link";
import locations from "../../../data/datalocations.js";
import { notFound } from "next/navigation";

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state } = params;

  // Format string for presentation (capitalize first letters)
  const formattedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `Best Body Rubs & Massage Providers in ${formattedState} | RubRhythm`,
    description: `Find top-rated massage therapies, body rubs, and sensual wellness providers in ${formattedState}. Browse our verified catalog per city and book appointments today.`,
    alternates: {
      canonical: `/united-states/${state}`,
    }
  };
}

export default async function StatePage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state } = params;

  // Normalizar o nome do estado da URL
  const normalizedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Encontrar o estado nos dados
  const stateData = locations.find((loc) => loc.state === normalizedState);

  if (!stateData) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-text-muted mb-6 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/united-states" className="hover:text-primary transition-colors">United States</Link>
          <span>/</span>
          <span className="text-white">{stateData.state}</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Body Rubs & Massage in {stateData.state}
          </h1>
          <p className="text-text-muted max-w-2xl">
            Browse verified providers across {stateData.cities.length} cities in {stateData.state}. Select a city to explore available listings.
          </p>
        </div>

        {stateData.cities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stateData.cities.map((city) => (
              <Link
                key={city.name}
                href={`/united-states/${state}/${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group glass-card p-5 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-text-muted text-sm mt-1">
                      Browse providers
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card border border-white/5 rounded-2xl">
            <p className="text-text-muted">No cities available for this state yet.</p>
          </div>
        )}

        <div className="mt-10 flex items-center gap-4">
          <Link href="/united-states" className="btn-ghost inline-flex items-center border border-white/10">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            All States
          </Link>
          <Link href="/" className="btn-ghost inline-flex items-center border border-white/10">
            Home
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

// Gerar páginas estáticas para todos os estados
export async function generateStaticParams() {
  return locations.map((location) => ({
    state: location.state.toLowerCase().replace(/\s+/g, "-"),
  }));
}