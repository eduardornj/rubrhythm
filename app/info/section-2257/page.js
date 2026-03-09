import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "18 U.S.C. § 2257 Compliance | RubRhythm",
  description: "RubRhythm's compliance statement with 18 U.S.C. § 2257 and 28 C.F.R. Part 75 record-keeping requirements.",
};

export default function Section2257() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-2xl font-black text-white mb-2">18 U.S.C. § 2257</h1>
          <p className="text-text-muted text-base">Record Keeping Requirements Compliance Statement</p>
        </div>

        {/* Mandatory Legal Notice */}
        <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5 mb-6">
          <h2 className="text-white font-bold text-base mb-3 uppercase tracking-wider">⚖️ Mandatory Legal Notice</h2>
          <p className="text-text-muted text-base leading-relaxed mb-3">
            All models, performers, actors, actresses, and other persons who appear in any depiction of actual or simulated sexually explicit conduct on{" "}
            <strong className="text-white">RubRhythm</strong> were at least 18 years of age at the time of the creation of such depictions.
          </p>
          <p className="text-text-muted text-base leading-relaxed">
            Records required by 18 U.S.C. § 2257 and 28 C.F.R. Part 75 are maintained by the Designated Records Custodian listed below.
          </p>
        </div>

        {/* Compliance Requirements */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            {
              icon: "👤",
              title: "Age Verification",
              items: [
                "Mandatory ID verification with valid official document",
                "Confirmation all persons are 18+",
                "Copies of all identification documents maintained",
              ],
            },
            {
              icon: "📂",
              title: "Record Keeping",
              items: [
                "Records organized by content production date",
                "Cross-indexed by legal and professional name",
                "Secure backup in multiple locations",
              ],
            },
            {
              icon: "🏢",
              title: "Records Custodian",
              items: [
                "Designated primary custodian on file",
                "Specialized compliance training",
                "Available for federal inspection",
              ],
            },
          ].map((c) => (
            <div key={c.title} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{c.icon}</span>
                <h3 className="text-white font-bold text-base">{c.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {c.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-text-muted text-base">
                    <span className="text-primary flex-shrink-0 mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Records Custodian */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-base mb-4">📋 Records Custodian Contact</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/3 rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-2">Primary Custodian</p>
              <p className="text-text-muted text-base mb-1"><strong className="text-white">Entity:</strong> RubRhythm LLC</p>
              <p className="text-text-muted text-base mb-1"><strong className="text-white">Address:</strong> Legal Dept — [Address on file]</p>
              <p className="text-text-muted text-base">
                <strong className="text-white">Email:</strong>{" "}
                <a href="mailto:records@rubrhythm.com" className="text-primary hover:underline">records@rubrhythm.com</a>
              </p>
            </div>
            <div className="bg-white/3 rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-2">Inspection Hours</p>
              <p className="text-text-muted text-base mb-1">Monday – Friday: 9:00 AM – 5:00 PM ET</p>
              <p className="text-text-muted text-base mb-1">Saturday: 10:00 AM – 2:00 PM ET</p>
              <p className="text-text-muted text-base">Federal agents may schedule outside business hours with 24h notice.</p>
            </div>
          </div>
        </div>

        {/* Compliance Process */}
        <div className="glass-card p-5 mb-6">
          <h2 className="text-white font-bold text-base mb-4">Compliance Process</h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { step: "1", icon: "🔍", label: "Verify" },
              { step: "2", icon: "📄", label: "Document" },
              { step: "3", icon: "🔐", label: "Store" },
              { step: "4", icon: "✅", label: "Audit" },
            ].map((s) => (
              <div key={s.step}>
                <div className="w-8 h-8 bg-primary/15 border border-primary/30 text-primary text-xs font-black rounded-full flex items-center justify-center mx-auto mb-2">{s.step}</div>
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-text-muted text-base font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted Documents */}
        <div className="glass-card p-5 mb-6">
          <h2 className="text-white font-bold text-base mb-4">Accepted ID Documents</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-primary font-semibold text-xs mb-2 uppercase tracking-wider">Primary (Preferred)</p>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• US Passport</li>
                <li>• State Driver's License with photo</li>
                <li>• State-issued ID with photo</li>
                <li>• US Military ID</li>
              </ul>
            </div>
            <div>
              <p className="text-text-muted font-semibold text-xs mb-2 uppercase tracking-wider">Secondary</p>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• Foreign Passport + valid visa</li>
                <li>• Permanent Resident Card (Green Card)</li>
                <li>• Employment Authorization Document</li>
                <li>• Birth certificate + photo ID</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-amber-400 text-sm">⚠️ All documents must be valid, unexpired, and clearly legible. Suspected or altered documents will result in immediate rejection.</p>
          </div>
        </div>

        {/* Penalties */}
        <div className="glass-card p-5 border-red-500/20 bg-red-500/5 mb-8">
          <h2 className="text-white font-bold text-base mb-3">⚠️ Non-Compliance Penalties</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <ul className="space-y-1.5 text-text-muted text-base">
              <li>• Fines up to $100,000 per violation</li>
              <li>• Up to 5 years imprisonment</li>
              <li>• Platform suspension or shutdown</li>
            </ul>
            <ul className="space-y-1.5 text-text-muted text-base">
              <li>• Civil liability for damages</li>
              <li>• Loss of business licenses</li>
              <li>• Federal criminal investigation</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: "Terms of Service", href: "/info/terms" },
            { label: "Law & Legal", href: "/info/law-and-legal" },
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