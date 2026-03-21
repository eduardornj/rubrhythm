import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Contact RubRhythm - Get Help & Support",
  description:
    "Contact RubRhythm for account issues, listing help, verification questions, safety concerns, and business inquiries. Email admin@rubrhythm.com.",
  alternates: {
    canonical: "https://www.rubrhythm.com/contact",
  },
  openGraph: {
    title: "Contact RubRhythm - Get Help & Support",
    description:
      "Contact RubRhythm for account issues, listing help, verification questions, safety concerns, and business inquiries.",
    url: "https://www.rubrhythm.com/contact",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact RubRhythm - Get Help & Support",
    description:
      "Account issues, safety concerns, law enforcement, business inquiries.",
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
    "@type": "ContactPage",
    name: "Contact RubRhythm",
    description:
      "Contact RubRhythm for account issues, listing help, verification questions, safety concerns, and business inquiries.",
    url: "https://www.rubrhythm.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "RubRhythm",
      url: "https://www.rubrhythm.com",
      logo: "https://www.rubrhythm.com/icons/icon-512x512.svg",
      email: "admin@rubrhythm.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "admin@rubrhythm.com",
          contactType: "customer support",
          availableLanguage: "English",
        },
        {
          "@type": "ContactPoint",
          email: "admin@rubrhythm.com",
          contactType: "sales",
          availableLanguage: "English",
        },
      ],
    },
  },
];

const contactSections = [
  {
    title: "Get in Touch",
    desc: "For account issues, listing help, verification questions, or general support, email us directly. We respond to most inquiries within 24 hours.",
    email: "admin@rubrhythm.com",
    emailLabel: "admin@rubrhythm.com",
    details: [
      "Account recovery and access issues",
      "Listing creation and editing help",
      "Verification status and questions",
      "Credit purchases and billing",
      "General questions about RubRhythm",
    ],
  },
  {
    title: "Report a Problem",
    desc: "Found something that does not belong on the platform? Every profile and message thread has a built-in report button. For more detailed reports, email us with the listing URL and a description of the issue.",
    email: "admin@rubrhythm.com",
    emailLabel: "Report via Email",
    details: [
      "Use the Report button on any profile or message",
      "Include the username or listing URL in your email",
      "Describe what happened with as much detail as possible",
      "Our moderation team investigates every report",
    ],
  },
];

export default function ContactPage() {
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
            Contact <span className="text-gradient">Us</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            We are here to help. Whether you have a question, a problem, or a
            business inquiry, reach out and we will get back to you.
          </p>
        </div>

        {/* Get in Touch + Report */}
        {contactSections.map((section) => (
          <section
            key={section.title}
            className="glass-card p-6 md:p-8 mb-6 animate-fade-in"
          >
            <h2 className="text-white font-bold text-xl mb-4">
              {section.title}
            </h2>
            <p className="text-text-muted text-base leading-relaxed mb-5">
              {section.desc}
            </p>
            <a
              href={`mailto:${section.email}`}
              className="inline-block btn-primary text-sm px-6 py-2.5 mb-5"
            >
              {section.emailLabel}
            </a>
            <ul className="space-y-2">
              {section.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-2 text-text-muted text-sm"
                >
                  <span className="text-primary flex-shrink-0 mt-0.5">+</span>
                  {detail}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Safety Concerns */}
        <section className="glass-card p-6 md:p-8 mb-6 border-red-500/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">!!</span>
            <h2 className="text-white font-bold text-xl">Safety Concerns</h2>
          </div>
          <p className="text-text-muted text-base leading-relaxed mb-5">
            For urgent safety issues, including suspected trafficking or
            exploitation, do not wait for an email response. Contact the
            authorities directly.
          </p>
          <div className="bg-white/3 rounded-xl p-5 border border-white/5 mb-4">
            <h3 className="text-white font-semibold text-base mb-2">
              National Human Trafficking Hotline
            </h3>
            <p className="text-text-muted text-base mb-1">
              Call:{" "}
              <a
                href="tel:1-888-373-7888"
                className="text-primary font-semibold hover:underline"
              >
                1-888-373-7888
              </a>
            </p>
            <p className="text-text-muted text-base mb-1">
              Text: <span className="text-white font-medium">233733</span>
            </p>
            <p className="text-text-muted text-sm mt-2">
              Available 24 hours a day, 7 days a week. Interpreters available in
              over 200 languages.
            </p>
          </div>
          <p className="text-text-muted text-sm">
            You can also report safety concerns to us at{" "}
            <a
              href="mailto:admin@rubrhythm.com"
              className="text-primary hover:underline"
            >
              admin@rubrhythm.com
            </a>{" "}
            and we will investigate immediately.
          </p>
        </section>

        {/* Law Enforcement */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">
            For Law Enforcement
          </h2>
          <p className="text-text-muted text-base leading-relaxed mb-4">
            RubRhythm cooperates fully with law enforcement investigations. If
            you are a law enforcement officer and need information related to a
            case, contact us with your badge number, department, and case
            reference.
          </p>
          <a
            href="mailto:admin@rubrhythm.com"
            className="inline-block btn-secondary text-sm px-6 py-2.5"
          >
            admin@rubrhythm.com
          </a>
          <p className="text-text-muted text-sm mt-4">
            Please include your badge or ID number, department name, and case
            number in your email. We prioritize law enforcement requests and
            respond as quickly as possible.
          </p>
        </section>

        {/* Business Inquiries */}
        <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">
            Business Inquiries
          </h2>
          <p className="text-text-muted text-base leading-relaxed mb-4">
            For partnerships, advertising opportunities, press inquiries, or
            other business matters, email us at the address below.
          </p>
          <a
            href="mailto:admin@rubrhythm.com"
            className="inline-block btn-secondary text-sm px-6 py-2.5"
          >
            admin@rubrhythm.com
          </a>
          <ul className="space-y-2 mt-5">
            {[
              "Partnership and integration opportunities",
              "Advertising and sponsorship inquiries",
              "Press and media requests",
              "Bulk listing inquiries for businesses",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-text-muted text-sm"
              >
                <span className="text-primary flex-shrink-0 mt-0.5">+</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "About RubRhythm", href: "/about" },
            { label: "Safety Guide", href: "/safety-guide" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "FAQ", href: "/info/faq" },
            { label: "Anti-Trafficking Policy", href: "/info/anti-trafficking" },
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
