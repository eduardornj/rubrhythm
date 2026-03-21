import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "For Massage Providers - List Your Services on RubRhythm",
  description:
    "Join the only verified massage directory. Free ID verification, Blue Badge credibility, and access to clients who value safety and professionalism.",
  alternates: {
    canonical: "https://www.rubrhythm.com/for-providers",
  },
  openGraph: {
    title: "For Massage Providers - List Your Services on RubRhythm",
    description:
      "Join the only verified massage directory. Free ID verification, Blue Badge credibility, and access to clients who value safety and professionalism.",
    url: "https://www.rubrhythm.com/for-providers",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Massage Providers - List Your Services on RubRhythm",
    description:
      "Free ID verification. Blue Badge credibility. Professional platform.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "For Massage Providers - List Your Services on RubRhythm",
  description:
    "Join the only verified massage directory. Free ID verification, Blue Badge credibility, and access to clients who value safety and professionalism.",
  url: "https://www.rubrhythm.com/for-providers",
  publisher: {
    "@type": "Organization",
    name: "RubRhythm",
    url: "https://www.rubrhythm.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.rubrhythm.com/icons/icon-512x512.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.rubrhythm.com/for-providers",
  },
};

const reasons = [
  {
    icon: "🛡️",
    title: "Instant Credibility",
    desc: "Your clients want to know you are real. The Blue Badge tells them instantly. No explanation needed, no back-and-forth proving your legitimacy.",
  },
  {
    icon: "🧹",
    title: "Clean Platform",
    desc: "No sketchy listings next to yours. Our content filter blocks 70+ prohibited terms and our moderation team reviews every single listing before it goes live. Your reputation is protected.",
  },
  {
    icon: "📈",
    title: "Growing Audience",
    desc: "RubRhythm covers 250+ US cities and is growing every month. Clients actively search for verified providers, and verified listings rank higher in results.",
  },
  {
    icon: "💼",
    title: "Professional Tools",
    desc: "Manage your listing, respond to messages, track views, and promote your services all from one dashboard. Built for providers, not for advertisers.",
  },
];

const visibilityOptions = [
  {
    name: "Bump Up",
    price: "$5 / 24h",
    desc: "Push your listing to the top of city search results for 24 hours.",
  },
  {
    name: "Highlight",
    price: "$10 - $30",
    desc: "Add a colored border and badge to make your listing stand out visually in search results.",
  },
  {
    name: "Featured",
    price: "$15 - $60",
    desc: "Pin your listing to the featured section at the top of your city page for maximum exposure.",
  },
  {
    name: "Available Now",
    price: "Free",
    desc: "Toggle your real-time availability status. Clients filtering by 'Available Now' will see you first.",
  },
];

export default function ForProvidersPage() {
  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            For Massage <span className="text-gradient">Providers</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            List your services on the only directory where verification is the
            standard, not the exception.
          </p>
        </div>

        {/* Why RubRhythm */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            Why RubRhythm?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {reasons.map((item) => (
              <div key={item.title} className="glass-card p-5">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="text-white font-semibold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Free Verification */}
        <section className="glass-card p-6 md:p-8 mb-6 border-primary/20 animate-fade-in">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🪪</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">
                Free Verification
              </h2>
              <p className="text-primary text-sm font-medium">
                $0 cost, lifetime Blue Badge
              </p>
            </div>
          </div>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            <p>
              Verification on RubRhythm is completely free. Submit your
              government-issued ID and a selfie, and our team will review it
              within 24 hours. Once approved, you earn the Blue Badge that
              stays on your profile permanently.
            </p>
            <p>
              The Blue Badge is the single most important trust signal on our
              platform. Clients actively filter for verified providers, and
              verified listings consistently receive more views and messages
              than unverified ones.
            </p>
          </div>
        </section>

        {/* Professional Platform */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">
            A Professional Platform
          </h2>
          <div className="space-y-3 text-text-muted text-base leading-relaxed">
            <p>
              Other directories let anyone post anything. RubRhythm does not.
              Every listing is reviewed by our moderation team before it goes
              live. Our content filter automatically blocks 70+ prohibited
              terms and phrases. Listings that violate our standards are
              removed without warning.
            </p>
            <p>
              This protects you. When a client finds your listing on
              RubRhythm, they know they are on a platform that takes quality
              seriously. Your listing is surrounded by other legitimate
              professionals, not scam accounts and fake profiles.
            </p>
          </div>
        </section>

        {/* Boost Your Visibility */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            Boost Your Visibility
          </h2>
          <div className="space-y-3">
            {visibilityOptions.map((opt) => (
              <div
                key={opt.name}
                className="glass-card p-5 flex items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-base">
                      {opt.name}
                    </h3>
                    <span className="text-primary text-xs font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {opt.price}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Welcome Bonus */}
        <section className="glass-card p-6 md:p-8 mb-6 border-primary/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎁</span>
            <h2 className="text-white font-bold text-xl">Welcome Bonus</h2>
          </div>
          <p className="text-text-muted text-base leading-relaxed mb-4">
            New providers receive{" "}
            <strong className="text-white">$50 in free credits</strong> when
            they create their first listing. Use these credits to Bump Up,
            Highlight, or Feature your listing and start building your client
            base immediately.
          </p>
          <p className="text-text-muted text-sm">
            Credits are applied automatically after your first listing is
            approved. No code required.
          </p>
        </section>

        {/* Pricing Grid */}
        <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-text-muted text-xs font-semibold uppercase tracking-wider pb-3 pr-4">
                    Service
                  </th>
                  <th className="text-text-muted text-xs font-semibold uppercase tracking-wider pb-3 pr-4">
                    Price
                  </th>
                  <th className="text-text-muted text-xs font-semibold uppercase tracking-wider pb-3">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  {
                    service: "Listing",
                    price: "$10",
                    desc: "One active listing on RubRhythm",
                  },
                  {
                    service: "Bump Up",
                    price: "$5 / 24h",
                    desc: "Move to the top of city results",
                  },
                  {
                    service: "Highlight",
                    price: "$10 - $30",
                    desc: "Visual distinction in search results",
                  },
                  {
                    service: "Featured",
                    price: "$15 - $60",
                    desc: "Pinned to featured section on city page",
                  },
                  {
                    service: "Verification",
                    price: "Free",
                    desc: "ID verification and Blue Badge",
                  },
                ].map((row) => (
                  <tr
                    key={row.service}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 pr-4 text-white font-medium">
                      {row.service}
                    </td>
                    <td className="py-3 pr-4 text-primary font-semibold">
                      {row.price}
                    </td>
                    <td className="py-3 text-text-muted">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Dual CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Start Building Your Client Base
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Get verified for free and create your first listing today. New
            providers receive $50 in credits to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-verified"
              className="btn-primary text-base px-8 py-3"
            >
              Get Verified -- Free
            </Link>
            <Link
              href="/myaccount/listings/add-listing"
              className="btn-secondary text-base px-8 py-3"
            >
              Create Your Listing
            </Link>
          </div>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "About RubRhythm", href: "/about" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "For Clients", href: "/for-clients" },
            { label: "RubRhythm Credits", href: "/rubrhythm-credits" },
            { label: "FAQ", href: "/info/faq" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-text-muted hover:text-primary text-xs border border-white/10 px-3 py-1.5 rounded-full hover:border-primary/30 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
