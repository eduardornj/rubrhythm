import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "About RubRhythm - The Verified Massage Directory",
  description:
    "RubRhythm is the only US massage directory requiring ID verification for every provider. Learn about our mission to make the massage industry safer.",
  alternates: {
    canonical: "https://www.rubrhythm.com/about",
  },
  openGraph: {
    title: "About RubRhythm - The Verified Massage Directory",
    description:
      "RubRhythm is the only US massage directory requiring ID verification for every provider. Learn about our mission to make the massage industry safer.",
    url: "https://www.rubrhythm.com/about",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About RubRhythm - The Verified Massage Directory",
    description:
      "The only US massage directory requiring ID verification for every provider.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About RubRhythm",
    description:
      "RubRhythm is the only US massage directory requiring ID verification for every provider.",
    url: "https://www.rubrhythm.com/about",
    mainEntity: {
      "@type": "Organization",
      name: "RubRhythm",
      url: "https://www.rubrhythm.com",
      logo: "https://www.rubrhythm.com/icons/icon-512x512.svg",
      description:
        "The only US massage and body rub directory where every provider is ID-verified. Professional. Verified. Safe.",
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
    },
  },
];

const differentiators = [
  {
    icon: "🪪",
    title: "ID Verification",
    desc: "Every Blue Badge provider submits a government-issued ID and a matching selfie. Our team reviews both before granting verification.",
  },
  {
    icon: "🛡️",
    title: "Content Filtering",
    desc: "Our automated system blocks 70+ prohibited terms and phrases. Combined with manual moderation, this keeps the platform clean and professional.",
  },
  {
    icon: "👁️",
    title: "Admin Moderation",
    desc: "Every listing is manually reviewed before publication. Suspicious accounts are investigated and removed without warning.",
  },
  {
    icon: "⚖️",
    title: "FOSTA-SESTA Compliance",
    desc: "RubRhythm is built from the ground up to comply with federal anti-trafficking legislation. We cooperate fully with law enforcement.",
  },
  {
    icon: "🚫",
    title: "Anti-Trafficking Commitment",
    desc: "Zero tolerance. We actively monitor for signs of exploitation and report suspicious activity to the National Human Trafficking Hotline.",
  },
];

const verificationSteps = [
  {
    step: "1",
    title: "Submit Your ID",
    desc: "Upload a photo of your government-issued identification. We accept driver's licenses, state IDs, and passports.",
  },
  {
    step: "2",
    title: "Take a Selfie",
    desc: "Submit a clear selfie holding a handwritten note with your username and the current date. This confirms you are the person on the ID.",
  },
  {
    step: "3",
    title: "Team Review",
    desc: "Our moderation team reviews your submission within 24 hours. We verify the ID is authentic and the selfie matches.",
  },
  {
    step: "4",
    title: "Blue Badge Issued",
    desc: "Once approved, your profile displays the Blue Badge permanently. Clients can see at a glance that you are verified and trustworthy.",
  },
];

export default function AboutPage() {
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
            About <span className="text-gradient">RubRhythm</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            The first and only US massage directory where every provider can be
            ID-verified. Professional. Verified. Safe.
          </p>
        </div>

        {/* Our Mission */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">Our Mission</h2>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            <p>
              The massage industry has a trust problem. Fake listings, scam
              accounts, and unverified providers make it difficult for
              legitimate professionals to build their business, and nearly
              impossible for clients to know who they can trust.
            </p>
            <p>
              RubRhythm exists to fix that. We built the first directory where
              every Blue Badge provider has been ID-verified by our team. Not
              by an algorithm. Not by a phone number. By a real person
              reviewing a real government ID against a real selfie.
            </p>
            <p>
              The result is a platform where providers are treated as
              professionals and clients can search with confidence. That is the
              standard we hold, and we will not lower it.
            </p>
          </div>
        </section>

        {/* How We're Different */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            How We Are Different
          </h2>
          <div className="space-y-4">
            {differentiators.map((item) => (
              <div key={item.title} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-text-muted text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Process */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-6">
            Our Verification Process
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {verificationSteps.map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/15 border border-primary/30 text-primary text-sm font-black rounded-full flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base mb-1">
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

        {/* For Providers + For Clients */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-white font-bold text-lg mb-3">
              For Providers
            </h2>
            <ul className="space-y-2 text-text-muted text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Free verification, no hidden fees
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Instant credibility with the Blue Badge
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Professional platform, no sketchy neighbors
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Tools to promote and manage your listing
              </li>
            </ul>
            <Link
              href="/for-providers"
              className="inline-block mt-4 text-primary text-sm font-medium hover:underline"
            >
              Learn more for providers
            </Link>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-white font-bold text-lg mb-3">For Clients</h2>
            <ul className="space-y-2 text-text-muted text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Search verified providers across 250+ US cities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Blue Badge means identity confirmed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Reviews from real, verified users
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">+</span>
                Report tools and active moderation
              </li>
            </ul>
            <Link
              href="/for-clients"
              className="inline-block mt-4 text-primary text-sm font-medium hover:underline"
            >
              Learn more for clients
            </Link>
          </div>
        </div>

        {/* CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Ready to Get Verified?
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Verification is free and takes less than 5 minutes to submit. Our
            team reviews every application within 24 hours.
          </p>
          <Link href="/get-verified" className="btn-primary text-base px-8 py-3">
            Get Verified -- It is Free
          </Link>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "How It Works", href: "/how-it-works" },
            { label: "For Providers", href: "/for-providers" },
            { label: "For Clients", href: "/for-clients" },
            { label: "Anti-Trafficking Policy", href: "/info/anti-trafficking" },
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
