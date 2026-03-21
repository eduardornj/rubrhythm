import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Massage & Body Rub Glossary - Terms You Should Know",
  description:
    "Glossary of massage and body rub terms used on RubRhythm. Learn what Blue Badge, incall, outcall, deep tissue, and other industry terms mean.",
  alternates: {
    canonical: "https://www.rubrhythm.com/glossary",
  },
  openGraph: {
    title: "Massage & Body Rub Glossary - Terms You Should Know",
    description:
      "Glossary of massage and body rub terms used on RubRhythm. Learn what Blue Badge, incall, outcall, deep tissue, and other industry terms mean.",
    url: "https://www.rubrhythm.com/glossary",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Massage & Body Rub Glossary - Terms You Should Know",
    description:
      "Definitions for Blue Badge, incall, outcall, deep tissue, and more.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const terms = [
  {
    term: "Available Now",
    definition:
      "A real-time status indicating the provider is currently accepting appointments. Providers toggle this status manually when they are ready to see clients.",
  },
  {
    term: "Blue Badge",
    definition:
      "RubRhythm's verified provider badge. It confirms that the provider has submitted a government-issued ID and a matching selfie, and that our moderation team has reviewed and approved both. The Blue Badge cannot be purchased or transferred.",
  },
  {
    term: "Body Rub",
    definition:
      "A hands-on bodywork session focused on relaxation and muscle relief. Body rubs typically use a combination of techniques to release tension and promote overall well-being.",
  },
  {
    term: "Bump Up",
    definition:
      "A paid feature that moves your listing to the top of search results in your city for 24 hours. Bump Ups are purchased with RubRhythm credits and provide temporary visibility boost.",
  },
  {
    term: "Credits",
    definition:
      "RubRhythm's currency system used for platform features like messaging, Bump Ups, and Featured Listings. 1 credit equals $1 USD. Credits are purchased through your account dashboard.",
  },
  {
    term: "Deep Tissue",
    definition:
      "A massage technique that targets the deeper layers of muscle and connective tissue. Deep tissue massage uses slower strokes and more direct pressure to address chronic tension and muscle knots.",
  },
  {
    term: "Featured Listing",
    definition:
      "Premium placement with a golden badge at the top of city pages. Featured Listings receive maximum visibility and are displayed above all standard and highlighted listings.",
  },
  {
    term: "Founding Provider",
    definition:
      "One of the first verified providers in a city on RubRhythm. Founding Providers earn a permanent badge on their profile recognizing their early commitment to the platform and their city.",
  },
  {
    term: "Highlighted Listing",
    definition:
      "A listing with visual emphasis to stand out in search results. Highlighted Listings appear with a distinct border and background color that draws attention without the full premium placement of a Featured Listing.",
  },
  {
    term: "Hot Stone",
    definition:
      "A massage technique using heated, smooth stones placed on specific points of the body. The heat relaxes muscles and improves circulation, allowing the therapist to work more deeply with less pressure.",
  },
  {
    term: "Incall",
    definition:
      "A service provided at the provider's location. When a listing offers incall, it means the client travels to the provider's studio, office, or designated workspace for the session.",
  },
  {
    term: "Outcall",
    definition:
      "A service provided at the client's location. When a listing offers outcall, it means the provider travels to the client's home, hotel, or other specified location for the session.",
  },
  {
    term: "Swedish Massage",
    definition:
      "A gentle, full-body massage technique using long gliding strokes, kneading, and circular movements on the top layers of muscles. Swedish massage is the most common type and is ideal for relaxation and stress relief.",
  },
  {
    term: "Verified Provider",
    definition:
      "A provider who has completed RubRhythm's ID verification process. Verified providers display the Blue Badge on their profile, confirming their identity has been reviewed and approved by our moderation team.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Massage & Body Rub Glossary",
  description:
    "Glossary of massage and body rub terms used on RubRhythm. Definitions for industry terminology, platform features, and service types.",
  url: "https://www.rubrhythm.com/glossary",
  hasDefinedTerm: terms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.definition,
  })),
};

export default function GlossaryPage() {
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
            <span className="text-gradient">Glossary</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Definitions for common massage industry terms and RubRhythm platform
            features. Organized alphabetically for quick reference.
          </p>
        </div>

        {/* Alphabetical Jump */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[...new Set(terms.map((t) => t.term[0].toUpperCase()))].map(
            (letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm font-bold text-text-muted border border-white/10 rounded-lg hover:text-primary hover:border-primary/30 transition-all"
              >
                {letter}
              </a>
            )
          )}
        </div>

        {/* Terms */}
        <div className="space-y-4">
          {terms.map((item, i) => {
            const isFirstOfLetter =
              i === 0 ||
              item.term[0].toUpperCase() !==
                terms[i - 1].term[0].toUpperCase();

            return (
              <div key={item.term}>
                {isFirstOfLetter && (
                  <div
                    id={`letter-${item.term[0].toUpperCase()}`}
                    className="scroll-mt-24"
                  >
                    <h2 className="text-primary font-black text-2xl mt-8 mb-3 px-1">
                      {item.term[0].toUpperCase()}
                    </h2>
                  </div>
                )}
                <div className="glass-card p-5">
                  <h3 className="text-white font-bold text-base mb-2">
                    {item.term}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <section className="glass-card p-8 text-center border-primary/20 mt-10 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Now that you know the terms, browse verified providers across 250+
            US cities or get your own listing verified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/view-cities"
              className="btn-primary text-base px-8 py-3"
            >
              Browse Providers
            </Link>
            <Link
              href="/get-verified"
              className="btn-secondary text-base px-8 py-3"
            >
              Get Verified
            </Link>
          </div>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "How It Works", href: "/how-it-works" },
            { label: "Safety Guide", href: "/safety-guide" },
            { label: "Verification Guide", href: "/verification-guide" },
            { label: "For Clients", href: "/for-clients" },
            { label: "For Providers", href: "/for-providers" },
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
