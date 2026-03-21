import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "For Clients - Find Safe, Verified Massage Providers",
  description:
    "Search ID-verified massage providers across 250+ US cities. Blue Badge means verified. Reviews from real users. Safe, professional, trusted.",
  alternates: {
    canonical: "https://www.rubrhythm.com/for-clients",
  },
  openGraph: {
    title: "For Clients - Find Safe, Verified Massage Providers",
    description:
      "Search ID-verified massage providers across 250+ US cities. Blue Badge means verified. Reviews from real users. Safe, professional, trusted.",
    url: "https://www.rubrhythm.com/for-clients",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Clients - Find Safe, Verified Massage Providers",
    description:
      "Blue Badge means verified. Reviews from real users. Safe, professional, trusted.",
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
  headline: "For Clients - Find Safe, Verified Massage Providers on RubRhythm",
  description:
    "Search ID-verified massage providers across 250+ US cities. Blue Badge means verified. Reviews from real users. Safe, professional, trusted.",
  url: "https://www.rubrhythm.com/for-clients",
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
    "@id": "https://www.rubrhythm.com/for-clients",
  },
};

const badgeMeaning = [
  {
    icon: "🪪",
    text: "Government-issued ID submitted and reviewed",
  },
  {
    icon: "📸",
    text: "Selfie verified against the ID photo by our team",
  },
  {
    icon: "✓",
    text: "Identity confirmed by a human moderator, not an algorithm",
  },
  {
    icon: "🛡️",
    text: "Badge displayed permanently on the provider's profile",
  },
];

const safetyTips = [
  {
    title: "Check for the Blue Badge",
    desc: "The Blue Badge is the fastest way to confirm a provider is real. If there is no badge, the provider has not completed ID verification.",
  },
  {
    title: "Read Reviews",
    desc: "Check the provider's review history before reaching out. Reviews come from verified accounts and cannot be deleted by the provider.",
  },
  {
    title: "Use Our Messaging System",
    desc: "Communicate through RubRhythm's built-in messaging. This keeps a record of all conversations and allows our moderation team to intervene if something goes wrong.",
  },
  {
    title: "Report Suspicious Activity",
    desc: "Every profile and message has a report button. If something feels off, report it. Our team investigates every report and takes action within hours.",
  },
];

const redFlags = [
  "No Blue Badge or verification of any kind",
  "Profile photos that look like stock images or are clearly stolen",
  "Prices that are significantly lower than other providers in the same city",
  "Asking you to pay outside the platform via gift cards, crypto, or wire transfer",
  "Refusing to communicate through the RubRhythm messaging system",
  "Pressuring you to book immediately without answering questions",
  "Profile text that is vague, generic, or copied from other listings",
  "Requesting personal information before any real conversation",
];

export default function ForClientsPage() {
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
            For <span className="text-gradient">Clients</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Search with confidence. Every Blue Badge provider on RubRhythm has
            been ID-verified by our team.
          </p>
        </div>

        {/* Search With Confidence */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">
            Search With Confidence
          </h2>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            <p>
              Other directories let anyone create a listing with a fake name
              and a stolen photo. On RubRhythm, every Blue Badge provider has
              submitted a government-issued ID and a matching selfie. Our
              moderation team, not software, verifies the match.
            </p>
            <p>
              The result: when you see the Blue Badge, you know the provider is
              a real person who is willing to stand behind their identity. No
              fakes. No scams. No guesswork.
            </p>
          </div>
        </section>

        {/* What the Blue Badge Means */}
        <section className="glass-card p-6 md:p-8 mb-6 border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">
            What the Blue Badge Means
          </h2>
          <div className="space-y-4">
            {badgeMeaning.map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-4 bg-white/3 rounded-xl p-4"
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <p className="text-text-muted text-base">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-sm mt-5">
            The Blue Badge cannot be purchased, transferred, or faked. It is
            earned through our verification process and stays on the
            provider's profile permanently.
          </p>
        </section>

        {/* How to Stay Safe */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            How to Stay Safe
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {safetyTips.map((tip, i) => (
              <div key={tip.title} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/15 border border-primary/30 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <h3 className="text-white font-semibold text-base">
                    {tip.title}
                  </h3>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Red Flags */}
        <section className="glass-card p-6 md:p-8 mb-6 border-red-500/20 bg-red-500/3 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🚩</span>
            <h2 className="text-white font-bold text-xl">
              Red Flags to Watch For
            </h2>
          </div>
          <p className="text-text-muted text-base mb-5">
            If you encounter any of these warning signs, do not proceed.
            Report the account and move on.
          </p>
          <ul className="space-y-3">
            {redFlags.map((flag) => (
              <li
                key={flag}
                className="flex items-start gap-3 text-text-muted text-base"
              >
                <span className="text-red-400 flex-shrink-0 mt-0.5">!</span>
                {flag}
              </li>
            ))}
          </ul>
        </section>

        {/* Welcome Credits */}
        <section className="glass-card p-6 md:p-8 mb-8 border-primary/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎁</span>
            <h2 className="text-white font-bold text-xl">Welcome Credits</h2>
          </div>
          <p className="text-text-muted text-base leading-relaxed mb-3">
            New clients receive{" "}
            <strong className="text-white">$5 in free credits</strong> when
            they create an account. Use these credits to try the messaging
            system and connect with verified providers at no cost.
          </p>
          <p className="text-text-muted text-sm">
            Credits are applied automatically to your account after
            registration.
          </p>
        </section>

        {/* CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Ready to Find a Provider?
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Browse verified providers across 250+ US cities. Look for the Blue
            Badge and search with confidence.
          </p>
          <Link
            href="/view-cities"
            className="btn-primary text-base px-8 py-3"
          >
            Start Searching
          </Link>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "About RubRhythm", href: "/about" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "For Providers", href: "/for-providers" },
            { label: "Anti-Scam Guide", href: "/info/anti-scam" },
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
