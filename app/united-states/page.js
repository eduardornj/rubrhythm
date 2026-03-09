import MainLayout from "@components/MainLayout";
import Link from "next/link";
import locations from "../../data/datalocations.js";

export const metadata = {
    title: "Body Rubs & Massage Providers by State | RubRhythm",
    description:
        "Find top-rated body rub and massage providers near you. Browse by state and city to discover verified providers across the United States.",
};

export default function UnitedStatesPage() {
    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-text-muted mb-6 space-x-2">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-white">United States</span>
                </nav>

                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                        All States
                    </h1>
                    <p className="text-text-muted max-w-2xl">
                        Browse verified massage and body rub providers across all 50 states. Select a state to explore cities and providers.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {locations.map((location) => {
                        const stateSlug = location.state
                            .toLowerCase()
                            .replace(/\s+/g, "-");
                        return (
                            <Link
                                key={location.state}
                                href={`/united-states/${stateSlug}`}
                                className="group glass-card p-4 hover:border-primary/40 transition-all duration-300"
                            >
                                <h2 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                    {location.state}
                                </h2>
                                <p className="text-xs text-text-muted mt-1">
                                    {location.cities.length} {location.cities.length === 1 ? 'city' : 'cities'}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-10 text-center">
                    <Link href="/" className="btn-ghost inline-flex items-center border border-white/10">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
