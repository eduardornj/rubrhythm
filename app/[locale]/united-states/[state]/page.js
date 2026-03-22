import MainLayout from "@components/MainLayout";
import { Link } from "@/i18n/navigation";
import locations from "@/data/datalocations.js";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state, locale } = params;
  const t = await getTranslations({ locale, namespace: "states" });

  const formattedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: t("stateTitle", { state: formattedState }),
    description: t("stateSubtitle", { state: formattedState }),
    alternates: { canonical: `/united-states/${state}` },
  };
}

export default async function StatePage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { state } = params;
  const t = await getTranslations("states");

  const normalizedState = state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const stateData = locations.find((loc) => loc.state === normalizedState);

  if (!stateData) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center text-sm text-text-muted mb-6 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
          <span>/</span>
          <Link href="/united-states" className="hover:text-primary transition-colors">{t("unitedStates")}</Link>
          <span>/</span>
          <span className="text-white">{stateData.state}</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            {t("stateTitle", { state: stateData.state })}
          </h1>
          <p className="text-text-muted max-w-2xl">
            {t("stateSubtitle", { state: stateData.state })}
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
                      {t("viewProviders")}
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
            <p className="text-text-muted">{t("stateSubtitle", { state: stateData.state })}</p>
          </div>
        )}

        <div className="mt-10 flex items-center gap-4">
          <Link href="/united-states" className="btn-ghost inline-flex items-center border border-white/10">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {t("title")}
          </Link>
          <Link href="/" className="btn-ghost inline-flex items-center border border-white/10">
            {t("home")}
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

export async function generateStaticParams() {
  return locations.map((location) => ({
    state: location.state.toLowerCase().replace(/\s+/g, "-"),
  }));
}
