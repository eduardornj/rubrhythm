import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Law & Legal | RubRhythm",
  description: "RubRhythm's legal framework, compliance policies, content moderation, DMCA, and applicable laws.",
};

export default function LawAndLegal() {
  const compliance = [
    {
      icon: "⚖️",
      title: "Legal Compliance",
      items: [
        "Full compliance with federal, state, and local laws",
        "Consumer protection regulation adherence",
        "Privacy and data protection law compliance",
        "Online advertising guideline adherence",
      ],
    },
    {
      icon: "🛡️",
      title: "Data Protection",
      items: [
        "Encryption of personal and financial data",
        "Strict data retention policies",
        "Role-based access controls",
        "Regular security audits",
      ],
    },
    {
      icon: "👤",
      title: "User Rights",
      items: [
        "Right to access your personal data",
        "Right to correct inaccurate information",
        "Right to data deletion (right to be forgotten)",
        "Right to data portability",
      ],
    },
  ];

  const laws = [
    {
      region: "United States",
      items: [
        "Communications Decency Act (CDA) § 230",
        "Digital Millennium Copyright Act (DMCA)",
        "Children's Online Privacy Protection Act (COPPA)",
      ],
    },
    {
      region: "California",
      items: [
        "California Consumer Privacy Act (CCPA)",
        "California Privacy Rights Act (CPRA)",
        "Unruh Civil Rights Act",
      ],
    },
    {
      region: "European Union",
      items: [
        "General Data Protection Regulation (GDPR)",
        "Digital Services Act (DSA)",
        "ePrivacy Directive",
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">⚖️</div>
          <h1 className="text-3xl font-black text-white mb-2">Law & Legal</h1>
          <p className="text-text-muted max-w-2xl mx-auto text-base">
            RubRhythm operates in full compliance with applicable laws and maintains the highest standards of legal integrity.
          </p>
        </div>

        {/* Notice */}
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5 mb-8 text-center">
          <p className="text-red-400 font-bold text-base">
            ⚠️ This platform contains adult content. Access is restricted to persons 18 years of age or older.
          </p>
        </div>

        {/* Compliance Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {compliance.map((c) => (
            <div key={c.title} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{c.icon}</span>
                <h3 className="text-white font-bold text-base">{c.title}</h3>
              </div>
              <ul className="space-y-2">
                {c.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-text-muted text-base">
                    <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Age & 2257 Compliance */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Age Verification & 18 U.S.C. § 2257</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-primary font-semibold text-sm mb-3">Age Requirements</h3>
              <ul className="space-y-2 text-text-muted text-base">
                <li>• All users must be 18 or older</li>
                <li>• Mandatory identity verification for providers</li>
                <li>• Immediate ban for underage users</li>
                <li>• Active monitoring and reporting systems</li>
              </ul>
            </div>
            <div>
              <h3 className="text-primary font-semibold text-sm mb-3">§ 2257 Compliance</h3>
              <ul className="space-y-2 text-text-muted text-base">
                <li>• Age records maintained for all content</li>
                <li>• Designated and licensed records custodian</li>
                <li>• Regular compliance audits</li>
                <li>• Full cooperation with federal authorities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Applicable Laws */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">🌐 Applicable Jurisdictions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {laws.map((j) => (
              <div key={j.region} className="bg-white/3 rounded-xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">{j.region}</h3>
                <ul className="space-y-1.5">
                  {j.items.map((law) => (
                    <li key={law} className="text-text-muted text-base leading-snug">• {law}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* DMCA */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">📄 DMCA Policy</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-text-muted text-base mb-3">We respect intellectual property rights and respond promptly to valid DMCA takedown notices.</p>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• Immediate removal of infringing content</li>
                <li>• Counter-notification process available</li>
                <li>• Three-strike policy for repeat infringers</li>
                <li>• Registered DMCA agent on file</li>
              </ul>
            </div>
            <div className="bg-white/3 rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-2">Report DMCA Violation</p>
              <p className="text-text-muted text-base mb-1"><strong className="text-white">Email:</strong> <a href="mailto:dmca@rubrhythm.com" className="text-primary hover:underline">dmca@rubrhythm.com</a></p>
              <p className="text-text-muted text-base">Include all information required by the DMCA in your notice.</p>
            </div>
          </div>
        </div>

        {/* Content Moderation */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-white font-bold text-lg mb-4">🔍 Content Moderation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-red-400 font-semibold text-sm mb-3">Prohibited Content</h3>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• Any content involving minors</li>
                <li>• Content promoting violence or hate</li>
                <li>• Non-consensual or illegally obtained material</li>
                <li>• Private personal info (doxxing)</li>
                <li>• Spam, malware, or fraudulent content</li>
                <li>• Copyright violations</li>
                <li>• Illegal activities</li>
              </ul>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold text-sm mb-3">Moderation Process</h3>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• Human moderation by trained team</li>
                <li>• Community reporting system</li>
                <li>• Transparent appeal process</li>
                <li>• Immediate removal of illegal content</li>
                <li>• Cooperation with authorities when required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Contacts */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "General Legal", email: "legal@rubrhythm.com", time: "24–48h response" },
            { label: "DMCA Violations", email: "dmca@rubrhythm.com", time: "24h response" },
            { label: "Legal Emergencies", email: "emergency@rubrhythm.com", time: "Immediate" },
          ].map((c) => (
            <div key={c.label} className="glass-card p-4 text-center">
              <p className="text-white font-semibold text-sm mb-1">{c.label}</p>
              <a href={`mailto:${c.email}`} className="text-primary text-xs hover:underline block">{c.email}</a>
              <p className="text-text-muted text-base mt-1">{c.time}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: "Terms of Service", href: "/info/terms" },
            { label: "Anti-Trafficking", href: "/info/anti-trafficking" },
            { label: "Anti-Scam Guide", href: "/info/anti-scam" },
            { label: "FAQ", href: "/info/faq" },
            { label: "Get Help", href: "/info/get-help-from-staff" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-text-muted hover:text-primary text-xs border border-white/10 px-3 py-1.5 rounded-full hover:border-primary/30 transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}