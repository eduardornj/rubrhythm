import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Safety Guide - How to Stay Safe Using Massage Directories",
  description:
    "Learn how to stay safe when using massage directories. Tips for clients and providers on red flags, safety precautions, and how to report problems on RubRhythm.",
  alternates: {
    canonical: "https://www.rubrhythm.com/safety-guide",
  },
  openGraph: {
    title: "Safety Guide - How to Stay Safe Using Massage Directories",
    description:
      "Learn how to stay safe when using massage directories. Tips for clients and providers on red flags, safety precautions, and how to report problems.",
    url: "https://www.rubrhythm.com/safety-guide",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Guide - How to Stay Safe Using Massage Directories",
    description:
      "Red flags, safety tips, and reporting tools. Stay safe on RubRhythm.",
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
  headline: "Safety Guide - How to Stay Safe Using Massage Directories",
  description:
    "Learn how to stay safe when using massage directories. Tips for clients and providers on red flags, safety precautions, and how to report problems on RubRhythm.",
  url: "https://www.rubrhythm.com/safety-guide",
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
    "@id": "https://www.rubrhythm.com/safety-guide",
  },
};

const beforeYouBook = [
  "Research the provider before reaching out. Read their full profile, check their services, and look at their photos.",
  "Look for the Blue Badge. Verified providers have completed ID verification with our team. No badge means no verification.",
  "Read reviews from other clients. Reviews on RubRhythm come from verified accounts and cannot be deleted by the provider.",
  "Use the RubRhythm messaging system for all communication. This keeps a record and allows our moderation team to step in if needed.",
];

const duringYourVisit = [
  "Tell someone you trust where you are going and when you expect to be back.",
  "Meet in a professional setting. Legitimate providers operate from established locations, not random addresses that change frequently.",
  "Trust your instincts. If something feels wrong when you arrive, leave. Your safety is more important than being polite.",
  "Pay the agreed amount only. Do not pay extra fees that were not discussed beforehand. Do not send additional payments after the session.",
];

const redFlags = [
  "No verification badge on their profile",
  "Requests payment outside the platform via gift cards, crypto, or wire transfer",
  "Profile photos that look like stock images or are clearly taken from someone else",
  "Pressure to meet immediately without answering your questions",
  "Asks for personal information like your home address, workplace, or financial details upfront",
  "Prices significantly lower than other providers in the same city",
  "Refuses to communicate through the RubRhythm messaging system",
  "Profile text that is vague, generic, or copied from other listings",
];

const forProviders = [
  {
    title: "Screen Your Clients",
    desc: "Use the RubRhythm messaging system to communicate with new clients before agreeing to a session. Ask questions. Get a feel for the person. You have every right to decline a booking.",
  },
  {
    title: "Set Clear Boundaries",
    desc: "State your services, rates, and policies clearly in your listing. This prevents misunderstandings and gives you ground to stand on if a client pushes back.",
  },
  {
    title: "Use Platform Messaging",
    desc: "Keep your conversations on RubRhythm. The messaging system creates a record that protects you if a dispute arises. Moving off-platform removes that safety net.",
  },
  {
    title: "Report Suspicious Behavior",
    desc: "If a client sends inappropriate messages, tries to negotiate services you do not offer, or makes you uncomfortable in any way, use the report button. Our team investigates every report.",
  },
];

const reportingMethods = [
  {
    title: "Report Button",
    desc: "Every profile and every message thread on RubRhythm has a report button. Click it, select a reason, and our moderation team will review the report within hours.",
  },
  {
    title: "Email Admin",
    desc: "For issues that need more context, email admin@rubrhythm.com with details. Include the username or listing URL and a description of what happened.",
  },
  {
    title: "National Human Trafficking Hotline",
    desc: "If you suspect trafficking or exploitation of any kind, call the National Human Trafficking Hotline at 1-888-373-7888. You can also text 233733. This hotline is available 24/7.",
  },
];

export default function SafetyGuidePage() {
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
            Safety <span className="text-gradient">Guide</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Your safety matters more than anything else. This guide covers what
            to do before, during, and after using a massage directory.
          </p>
        </div>

        {/* Before You Book */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary/15 border border-primary/30 text-primary text-sm font-black rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <h2 className="text-white font-bold text-xl">Before You Book</h2>
          </div>
          <p className="text-text-muted text-base leading-relaxed mb-5">
            The most important safety steps happen before you ever leave your
            house. Take a few minutes to do your research.
          </p>
          <ul className="space-y-3">
            {beforeYouBook.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-3 text-text-muted text-base"
              >
                <span className="text-primary flex-shrink-0 mt-0.5">+</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* During Your Visit */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary/15 border border-primary/30 text-primary text-sm font-black rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <h2 className="text-white font-bold text-xl">
              During Your Visit
            </h2>
          </div>
          <p className="text-text-muted text-base leading-relaxed mb-5">
            Once you have done your research and decided to book, follow these
            precautions during your visit.
          </p>
          <ul className="space-y-3">
            {duringYourVisit.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-3 text-text-muted text-base"
              >
                <span className="text-primary flex-shrink-0 mt-0.5">+</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Red Flags */}
        <section className="glass-card p-6 md:p-8 mb-6 border-red-500/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">!!</span>
            <h2 className="text-white font-bold text-xl">Red Flags</h2>
          </div>
          <p className="text-text-muted text-base leading-relaxed mb-5">
            If you notice any of these warning signs, do not proceed. Report
            the account and move on. Protecting yourself is never an
            overreaction.
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

        {/* For Providers */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            For Providers
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {forProviders.map((item, i) => (
              <div key={item.title} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/15 border border-primary/30 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <h3 className="text-white font-semibold text-base">
                    {item.title}
                  </h3>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Report */}
        <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">How to Report</h2>
          <p className="text-text-muted text-base leading-relaxed mb-6">
            Reporting is not just for emergencies. If something feels off,
            report it. You are helping protect everyone on the platform.
          </p>
          <div className="space-y-5">
            {reportingMethods.map((method) => (
              <div
                key={method.title}
                className="flex items-start gap-4 bg-white/3 rounded-xl p-4"
              >
                <div>
                  <h3 className="text-white font-semibold text-base mb-1">
                    {method.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {method.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dual CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Browse With Confidence
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Every Blue Badge provider on RubRhythm has been ID-verified by our
            team. Safety starts with verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/view-cities"
              className="btn-primary text-base px-8 py-3"
            >
              Browse Verified Providers
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
            { label: "About RubRhythm", href: "/about" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Verification Guide", href: "/verification-guide" },
            { label: "For Clients", href: "/for-clients" },
            { label: "Contact Us", href: "/contact" },
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
