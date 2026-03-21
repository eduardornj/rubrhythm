import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "How RubRhythm Works - Find Verified Massage Providers",
  description:
    "Learn how to find ID-verified massage providers on RubRhythm. Search by city, check Blue Badges, read reviews, and connect safely.",
  alternates: {
    canonical: "https://www.rubrhythm.com/how-it-works",
  },
  openGraph: {
    title: "How RubRhythm Works - Find Verified Massage Providers",
    description:
      "Learn how to find ID-verified massage providers on RubRhythm. Search by city, check Blue Badges, read reviews, and connect safely.",
    url: "https://www.rubrhythm.com/how-it-works",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How RubRhythm Works - Find Verified Massage Providers",
    description:
      "Search by city, check Blue Badges, read reviews, and connect safely.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Find Verified Massage Providers on RubRhythm",
  description:
    "A step-by-step guide to finding ID-verified massage providers on RubRhythm, the trusted US massage directory.",
  url: "https://www.rubrhythm.com/how-it-works",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Search Your City",
      text: "Browse 250+ US cities on RubRhythm. Filter providers by services offered, price range, and availability to find exactly what you need.",
      url: "https://www.rubrhythm.com/how-it-works#search",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Check the Blue Badge",
      text: "Every verified provider displays a Blue Badge on their profile, confirming their government ID has been reviewed and approved by our moderation team.",
      url: "https://www.rubrhythm.com/how-it-works#badge",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Read Real Reviews",
      text: "Browse reviews left by verified users. RubRhythm does not allow anonymous or fake testimonials. Every review is tied to a real account.",
      url: "https://www.rubrhythm.com/how-it-works#reviews",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Connect Safely",
      text: "Message providers through the RubRhythm platform. All communications are monitored for safety, and suspicious activity is flagged automatically.",
      url: "https://www.rubrhythm.com/how-it-works#connect",
    },
  ],
};

const steps = [
  {
    id: "search",
    step: "1",
    icon: "🔍",
    title: "Search Your City",
    description:
      "Browse providers across 250+ US cities. Use filters to narrow results by the services you need, your price range, and real-time availability. Every city page shows only active, approved listings.",
    details: [
      "Coverage across all 50 states",
      "Filter by service type, price, and availability",
      "Real-time 'Available Now' status indicators",
      "Results ranked by verification status and activity",
    ],
  },
  {
    id: "badge",
    step: "2",
    icon: "🛡️",
    title: "Check the Blue Badge",
    description:
      "The Blue Badge is the most important thing to look for on any provider profile. It means that provider submitted a government-issued ID and a matching selfie, and our team confirmed the match. No badge means no verification.",
    details: [
      "Government ID reviewed by a real person",
      "Selfie cross-referenced against the ID photo",
      "Badge displayed prominently on every listing",
      "Cannot be purchased or faked",
    ],
  },
  {
    id: "reviews",
    step: "3",
    icon: "⭐",
    title: "Read Real Reviews",
    description:
      "Reviews on RubRhythm come from verified user accounts only. We do not allow anonymous reviews, and providers cannot delete negative feedback. This means the reviews you see reflect actual client experiences.",
    details: [
      "All reviewers must have a verified account",
      "Providers cannot remove or edit reviews",
      "Review fraud is detected and removed",
      "Rating history visible on every profile",
    ],
  },
  {
    id: "connect",
    step: "4",
    icon: "💬",
    title: "Connect Safely",
    description:
      "When you find a provider you trust, send them a message directly through RubRhythm. Our messaging system is monitored for prohibited content and suspicious patterns. You never need to share personal contact information before you are ready.",
    details: [
      "In-platform messaging system",
      "Automated content monitoring",
      "Report button on every conversation",
      "No personal info shared until you decide",
    ],
  },
];

const providerSteps = [
  {
    step: "1",
    title: "Create Your Account",
    desc: "Sign up with your email. It takes less than a minute.",
  },
  {
    step: "2",
    title: "Post Your Listing",
    desc: "Add your services, rates, location, photos, and availability. Listings cost $10.",
  },
  {
    step: "3",
    title: "Get Verified",
    desc: "Submit your government ID and selfie for free verification. Blue Badge issued within 24 hours.",
  },
  {
    step: "4",
    title: "Start Receiving Clients",
    desc: "Your listing goes live after admin review. Verified providers rank higher in search results.",
  },
];

export default function HowItWorksPage() {
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
            How <span className="text-gradient">RubRhythm</span> Works
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Finding a verified massage provider takes four steps. Every step is
            designed to keep you safe and informed.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-10">
          {steps.map((item) => (
            <section
              key={item.id}
              id={item.id}
              className="glass-card p-6 md:p-8 animate-fade-in"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/15 border border-primary/30 text-primary text-lg font-black rounded-full flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <h2 className="text-white font-bold text-xl">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-text-muted text-base leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {item.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 text-text-muted text-sm"
                      >
                        <span className="text-primary flex-shrink-0 mt-0.5">
                          +
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* For Providers Section */}
        <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-2">
            For Providers: How to List Your Services
          </h2>
          <p className="text-text-muted text-base mb-6">
            Getting listed on RubRhythm is straightforward. Here is how it
            works from the provider side.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {providerSteps.map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {s.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dual CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">Get Started</h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Whether you are searching for a provider or listing your own
            services, RubRhythm makes it safe and simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/view-cities"
              className="btn-primary text-base px-8 py-3"
            >
              Start Searching
            </Link>
            <Link
              href="/get-verified"
              className="btn-secondary text-base px-8 py-3"
            >
              List Your Services
            </Link>
          </div>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "About RubRhythm", href: "/about" },
            { label: "For Providers", href: "/for-providers" },
            { label: "For Clients", href: "/for-clients" },
            { label: "View Cities", href: "/view-cities" },
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
