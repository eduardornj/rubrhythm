import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "RubRhythm",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "For Providers", href: "/for-providers" },
      { label: "For Clients", href: "/for-clients" },
      { label: "FAQ", href: "/info/faq" },
      { label: "View Letter", href: "/letter-from-staff" },
    ],
  },
  {
    title: "Safety & Trust",
    links: [
      { label: "Get Verified", href: "/get-verified", highlight: true },
      { label: "Anti-Trafficking", href: "/info/anti-trafficking" },
      { label: "Anti-Scam Guide", href: "/info/anti-scam" },
      { label: "Get Help", href: "/info/get-help-from-staff" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/info/terms" },
      { label: "Privacy Policy", href: "/info/privacy-policy" },
      { label: "Law & Legal", href: "/info/law-and-legal" },
      { label: "Section 2257", href: "/info/section-2257" },
    ],
  },
];

const TOP_CITIES = [
  { label: "New York", href: "/united-states/new-york/new-york-city" },
  { label: "Los Angeles", href: "/united-states/california/los-angeles" },
  { label: "Las Vegas", href: "/united-states/nevada/las-vegas" },
  { label: "Miami", href: "/united-states/florida/miami" },
  { label: "Chicago", href: "/united-states/illinois/chicago" },
  { label: "Houston", href: "/united-states/texas/houston" },
  { label: "Atlanta", href: "/united-states/georgia/atlanta" },
  { label: "Orlando", href: "/united-states/florida/orlando" },
  { label: "Dallas", href: "/united-states/texas/dallas" },
  { label: "Denver", href: "/united-states/colorado/denver" },
  { label: "Phoenix", href: "/united-states/arizona/phoenix" },
  { label: "San Francisco", href: "/united-states/california/san-francisco" },
  { label: "Seattle", href: "/united-states/washington/seattle" },
  { label: "Tampa", href: "/united-states/florida/tampa" },
  { label: "Philadelphia", href: "/united-states/pennsylvania/philadelphia" },
  { label: "San Diego", href: "/united-states/california/san-diego" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border text-text-muted py-12 mt-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Top: Brand + Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">

          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <h3 className="text-xl font-bold text-white mb-2">RubRhythm</h3>
            <p className="text-sm leading-relaxed mb-4">
              The only US massage directory where every provider is ID-verified. Professional. Verified. Safe.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SSL Secured
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ID-Verified Providers
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors duration-200 hover:text-white ${
                        link.highlight ? "text-primary font-medium" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Cities Column */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Top Cities</h4>
            <ul className="space-y-1.5">
              {TOP_CITIES.slice(0, 8).map((city) => (
                <li key={city.href}>
                  <Link href={city.href} className="text-sm transition-colors duration-200 hover:text-white">
                    {city.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/view-cities" className="text-sm text-primary font-medium hover:underline">
                  View all cities &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* More Cities Row (desktop only) */}
        <div className="hidden lg:flex flex-wrap items-center gap-x-4 gap-y-1 mb-8 pb-6 border-b border-border">
          <span className="text-xs font-medium text-white mr-2">More cities:</span>
          {TOP_CITIES.slice(8).map((city, i) => (
            <Link key={city.href} href={city.href} className="text-xs transition-colors hover:text-white">
              {city.label}{i < TOP_CITIES.slice(8).length - 1 ? "" : ""}
            </Link>
          ))}
          <Link href="/view-cities" className="text-xs text-primary hover:underline">
            250+ cities &rarr;
          </Link>
        </div>

        {/* Trust Disclaimer */}
        <div className="glass-card p-4 mb-8 !rounded-xl">
          <p className="text-xs leading-relaxed text-center">
            RubRhythm is a professional massage directory. All Blue Badge providers are ID-verified by our team.
            We do not support, condone, or facilitate prostitution, escort services, or any form of human trafficking.
            All users must be 18 years or older. By using this platform, you agree to our{" "}
            <Link href="/info/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/info/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
          <p className="text-xs text-center mt-2">
            <span className="text-white font-medium">National Human Trafficking Hotline:</span>{" "}
            <a href="tel:1-888-373-7888" className="text-primary hover:underline">1-888-373-7888</a>{" "}
            | Text &quot;HELP&quot; to 233733
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} RubRhythm. All rights reserved. Professional. Verified. Safe.
          </p>
        </div>
      </div>
    </footer>
  );
}
