import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Why ID Verification Matters in the Massage Industry",
  description:
    "Why ID verification is essential for massage directories. How RubRhythm's Blue Badge protects clients from scams and helps legitimate providers build credibility.",
  alternates: {
    canonical: "https://www.rubrhythm.com/why-verification-matters",
  },
  openGraph: {
    title: "Why ID Verification Matters in the Massage Industry",
    description:
      "Why ID verification is essential for massage directories. How RubRhythm's Blue Badge protects clients from scams and helps providers build credibility.",
    url: "https://www.rubrhythm.com/why-verification-matters",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Why ID Verification Matters in the Massage Industry",
    description:
      "Fake profiles cost everyone. Verification fixes that.",
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
  headline: "Why ID Verification Matters in the Massage Industry",
  description:
    "Why ID verification is essential for massage directories. How RubRhythm's Blue Badge protects clients from scams and helps legitimate providers build credibility.",
  url: "https://www.rubrhythm.com/why-verification-matters",
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
    "@id": "https://www.rubrhythm.com/why-verification-matters",
  },
};

const forClients = [
  {
    title: "No More Guessing",
    desc: "When you see the Blue Badge, you know the provider submitted a government-issued ID and our team confirmed the match. You do not need to wonder if the photos are real or if the person exists.",
  },
  {
    title: "No More Scams",
    desc: "Scammers thrive on anonymity. Verification removes anonymity. A verified provider has staked their real identity on their listing. That alone filters out the vast majority of fraud.",
  },
  {
    title: "Browse With Confidence",
    desc: "Instead of second-guessing every profile, you can focus on finding the right provider for your needs. Verification does the trust-building for you.",
  },
];

const forProviders = [
  {
    title: "Stand Out From Fakes",
    desc: "On unverified platforms, your listing sits next to stolen photos and fake accounts. On RubRhythm, the Blue Badge immediately separates you from the noise. Clients notice.",
  },
  {
    title: "Build Real Credibility",
    desc: "Verification is the fastest way to build trust online. It tells potential clients that you are willing to put your identity behind your work. That confidence is contagious.",
  },
  {
    title: "Attract Serious Clients",
    desc: "Clients who value safety are the best clients. They respect your time, your boundaries, and your profession. Verification attracts exactly that kind of person.",
  },
];

const industryExamples = [
  {
    platform: "Airbnb",
    method: "ID Verification",
    desc: "Airbnb requires hosts and guests to verify their identity before booking. This reduced fraud, increased trust, and became a standard that travelers now expect.",
  },
  {
    platform: "Uber",
    method: "Background Checks",
    desc: "Uber runs background checks on all drivers before they can accept rides. Passengers trust the platform because they know every driver has been screened.",
  },
  {
    platform: "Dating Apps",
    method: "Photo Verification",
    desc: "Apps like Bumble and Hinge use photo verification to confirm users are real. The verified badge became so popular that unverified profiles are now treated with suspicion.",
  },
];

export default function WhyVerificationMattersPage() {
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
            Why <span className="text-gradient">Verification</span> Matters
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            The massage industry deserves the same trust standards that
            transformed ride-sharing, vacation rentals, and online dating.
          </p>
        </div>

        {/* The Problem */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">The Problem</h2>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            <p>
              Most massage directories do not verify anyone. Anyone can create a
              listing with a fake name, stolen photos, and made-up credentials.
              There is no accountability and no consequences for deception.
            </p>
            <p>
              The result is predictable. Clients get scammed by profiles that
              look legitimate but are not. They show up to appointments with
              people who look nothing like their photos. They send money to
              accounts that disappear overnight.
            </p>
            <p>
              Meanwhile, legitimate providers lose business to fakes who
              undercut their prices and steal their photos. The honest
              professionals are punished for playing by the rules while
              scammers operate freely.
            </p>
          </div>
        </section>

        {/* The Solution */}
        <section className="glass-card p-6 md:p-8 mb-6 border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">The Solution</h2>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            <p>
              ID verification creates a trust layer between providers and
              clients. When you see the Blue Badge on a RubRhythm profile, you
              know three things: the provider submitted a government-issued ID,
              they submitted a matching selfie, and a real person on our team
              confirmed the match.
            </p>
            <p>
              That single verification step eliminates the majority of scams,
              fake profiles, and stolen identities. It does not guarantee
              perfection, but it guarantees that the person behind the profile
              is real and accountable.
            </p>
          </div>
        </section>

        {/* For Clients */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            For Clients
          </h2>
          <div className="space-y-4">
            {forClients.map((item) => (
              <div key={item.title} className="glass-card p-5">
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

        {/* For Providers */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            For Providers
          </h2>
          <div className="space-y-4">
            {forProviders.map((item) => (
              <div key={item.title} className="glass-card p-5">
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

        {/* How Other Industries Solved This */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">
            How Other Industries Solved This
          </h2>
          <p className="text-text-muted text-base leading-relaxed mb-6">
            Verification is not a new idea. The most trusted platforms in the
            world already use it. The massage industry is simply catching up.
          </p>
          <div className="space-y-5">
            {industryExamples.map((example) => (
              <div
                key={example.platform}
                className="flex items-start gap-4 bg-white/3 rounded-xl p-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-base">
                      {example.platform}
                    </h3>
                    <span className="text-text-muted text-xs bg-white/5 px-2 py-0.5 rounded-full">
                      {example.method}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {example.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Commitment */}
        <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">
            Our Commitment
          </h2>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            <p>
              Every Blue Badge on RubRhythm is verified by a real person, not
              an algorithm. We do not use automated facial recognition. We do
              not outsource verification to a third-party service. A member of
              our moderation team personally reviews every submission.
            </p>
            <p>
              We do this because automation makes mistakes, and mistakes in
              verification have real consequences. A fake badge is worse than no
              badge at all. By keeping the process human, we maintain a standard
              that no automated system can match.
            </p>
            <p>
              Verification is free for all providers. There are no fees, no
              subscriptions, and no premium tiers. We believe safety should
              never have a price tag.
            </p>
          </div>
        </section>

        {/* Dual CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Join the Verified Network
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Whether you are a provider ready to build credibility or a client
            looking for someone you can trust, RubRhythm is built for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-verified"
              className="btn-primary text-base px-8 py-3"
            >
              Get Verified
            </Link>
            <Link
              href="/view-cities"
              className="btn-secondary text-base px-8 py-3"
            >
              Browse Verified Providers
            </Link>
          </div>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "Verification Guide", href: "/verification-guide" },
            { label: "Safety Guide", href: "/safety-guide" },
            { label: "About RubRhythm", href: "/about" },
            { label: "For Providers", href: "/for-providers" },
            { label: "For Clients", href: "/for-clients" },
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
