import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "18 U.S.C. § 2257 Statement | RubRhythm",
  description: "RubRhythm's statement regarding 18 U.S.C. § 2257 record-keeping requirements and platform content policies.",
};

export default function Section2257() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-2xl font-black text-white mb-2">18 U.S.C. § 2257 Statement</h1>
          <p className="text-text-muted text-base">Content Policy & Age Verification Practices</p>
          <p className="text-white/20 text-xs mt-2">Last updated: March 10, 2026</p>
        </div>

        {/* Platform Position — Main Statement */}
        <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5 mb-6">
          <h2 className="text-white font-bold text-base mb-3">Platform Content Policy</h2>
          <p className="text-text-muted text-base leading-relaxed mb-4">
            <strong className="text-white">RubRhythm</strong> is a directory platform that connects clients with licensed and independent massage and body rub providers.
            Our platform <strong className="text-white">strictly prohibits</strong> sexually explicit content as defined under 18 U.S.C. § 2256, including but not limited to:
          </p>
          <ul className="space-y-2 text-text-muted text-base mb-4">
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
              Depictions of actual or simulated sexually explicit conduct
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
              Nudity presented in a sexual context
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
              Escort, prostitution, or any illegal services
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
              Any content involving minors
            </li>
          </ul>
          <p className="text-text-muted text-base leading-relaxed">
            Because RubRhythm does not permit content that falls within the scope of 18 U.S.C. § 2257,
            the formal record-keeping requirements of that statute are <strong className="text-white">not applicable</strong> to
            user-generated content on this platform. Any content found to violate this policy is removed immediately
            and the associated account is permanently suspended.
          </p>
        </div>

        {/* What We Actually Do */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-base mb-4">How We Protect Our Community</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-5">
            While formal § 2257 record-keeping does not apply to our platform, we take the safety and integrity
            of our community seriously. Here is what we actively enforce:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: "🔒",
                title: "Age Gate",
                desc: "All visitors must confirm they are 18 or older before accessing any content on the platform. Underage users are redirected away immediately.",
              },
              {
                icon: "🔵",
                title: "Identity Verification",
                desc: "Providers can submit government-issued ID for manual review. Verified providers receive a Blue Badge visible on their profile and listings.",
              },
              {
                icon: "🛡️",
                title: "Content Moderation",
                desc: "Every listing goes through manual review before publication. Our moderation checklist includes 8 criteria covering content appropriateness, identity, and legal compliance.",
              },
              {
                icon: "🚩",
                title: "Community Reporting",
                desc: "Users can report listings directly from any profile page. Reports are categorized by severity and reviewed promptly. Trafficking indicators trigger immediate escalation.",
              },
              {
                icon: "📋",
                title: "Provider Content Policy",
                desc: "During registration, providers see a clear content policy outlining what is allowed and what is not. Acceptance of Terms of Service and age confirmation is mandatory.",
              },
              {
                icon: "⚡",
                title: "Zero Tolerance Enforcement",
                desc: "Violations result in immediate content removal and permanent account suspension. We cooperate fully with law enforcement when required.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/3 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className="text-white font-bold text-sm">{item.title}</h3>
                </div>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Reference */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-base mb-3">About 18 U.S.C. § 2257</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-3">
            Section 2257 of Title 18, United States Code, requires producers of visual depictions of actual
            sexually explicit conduct to maintain records proving that all performers depicted were at least
            18 years of age at the time the depictions were created. The implementing regulations are found
            at 28 C.F.R. Part 75.
          </p>
          <p className="text-text-muted text-sm leading-relaxed mb-3">
            As stated above, RubRhythm prohibits all sexually explicit content. Our platform is designed
            for professional massage and body rub services only. Listings containing sexually explicit material
            are rejected during moderation or removed upon discovery.
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            For any questions regarding our content policies or compliance practices, contact us at{" "}
            <a href="mailto:legal@rubrhythm.com" className="text-primary hover:underline">legal@rubrhythm.com</a>.
          </p>
        </div>

        {/* Anti-Trafficking Notice */}
        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 mb-6">
          <h2 className="text-white font-bold text-sm mb-3">Anti-Trafficking Commitment</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-3">
            RubRhythm maintains a zero-tolerance policy toward human trafficking and the exploitation of minors.
            We actively monitor for indicators of trafficking and cooperate fully with law enforcement agencies.
          </p>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">If you suspect trafficking or exploitation:</p>
            <div className="space-y-1.5 text-sm">
              <p className="text-text-muted">
                <strong className="text-white">National Human Trafficking Hotline:</strong>{" "}
                <a href="tel:18883737888" className="text-primary hover:underline font-semibold">1-888-373-7888</a>
              </p>
              <p className="text-text-muted">
                <strong className="text-white">DHS Tip Line:</strong>{" "}
                <a href="tel:18663472423" className="text-primary hover:underline font-semibold">1-866-347-2423</a>
              </p>
              <p className="text-text-muted">
                <strong className="text-white">FBI Tips:</strong>{" "}
                <span className="text-primary">tips.fbi.gov</span>
              </p>
              <p className="text-text-muted">
                <strong className="text-white">Report on RubRhythm:</strong>{" "}
                <a href="mailto:report@rubrhythm.com" className="text-primary hover:underline">report@rubrhythm.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Related Legal Pages */}
        <div className="glass-card p-5 mb-8">
          <h2 className="text-white font-bold text-sm mb-3">Related Legal Documents</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { label: "Terms of Service", href: "/info/terms", desc: "Platform rules, user conduct, account policies" },
              { label: "Privacy Policy", href: "/info/privacy-policy", desc: "Data collection, storage, and your rights" },
              { label: "Law & Legal", href: "/info/law-and-legal", desc: "Applicable laws, DMCA, content moderation" },
              { label: "Anti-Trafficking Policy", href: "/info/anti-trafficking", desc: "Our commitment to fighting exploitation" },
              { label: "Anti-Scam Guide", href: "/info/anti-scam", desc: "How to stay safe on the platform" },
              { label: "Get Help", href: "/info/get-help-from-staff", desc: "Contact our support team" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">{l.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{l.desc}</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-primary mt-0.5 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
