import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Anti-Trafficking Policy | RubRhythm",
  description: "RubRhythm maintains a zero-tolerance policy against human trafficking. Learn how to identify warning signs and report suspicious activity.",
};

const hotlines = [
  {
    name: "National Human Trafficking Hotline",
    phone: "1-888-373-7888",
    text: "Text HELP to 233733",
    note: "Confidential · 24/7 · Multiple languages",
  },
  {
    name: "National Sexual Assault Hotline",
    phone: "1-800-656-4673",
    note: "Support for survivors · 24/7",
  },
  {
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    note: "24/7 · Chat available at thehotline.org",
  },
];

const victimSigns = [
  "Does not have control of their own ID or documents",
  "Not allowed to speak for themselves or appears fearful",
  "Shows signs of physical, sexual, or psychological abuse",
  "Has no control over their own money",
  "Works excessively long hours without breaks",
  "Lives in overcrowded or inadequate conditions",
  "Fears law enforcement or is reluctant to seek help",
  "Does not know their current address or location",
];

const traffSigns = [
  "Controls all aspects of another person's life",
  "Speaks on behalf of someone and doesn't allow them to talk",
  "Holds identity documents of other people",
  "Uses violence, threats, or coercion",
  "Isolates individuals from family and friends",
  "Controls money and resources of others",
  "Forces people to work against their will",
];

export default function AntiTrafficking() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Alert Header */}
        <div className="glass-card p-6 border-red-500/30 bg-red-500/8 text-center mb-10">
          <div className="text-4xl mb-3">🚨</div>
          <h1 className="text-2xl font-black text-white mb-2">Anti-Trafficking Policy</h1>
          <p className="text-red-300 font-bold text-base">
            ZERO TOLERANCE for human trafficking, sexual exploitation, or any form of coercion.
          </p>
        </div>

        {/* Emergency Hotlines */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg mb-4">📞 Need Help Immediately?</h2>
          <p className="text-text-muted text-base mb-4">
            If you or someone you know is in danger, call <strong className="text-white">911</strong> immediately, or use one of these confidential resources:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {hotlines.map((h) => (
              <div key={h.name} className="glass-card p-4 border-red-500/20 bg-red-500/5">
                <p className="text-white font-semibold text-sm mb-2">{h.name}</p>
                <a href={`tel:${h.phone}`} className="text-red-400 font-black text-lg hover:text-red-300 block mb-1">
                  {h.phone}
                </a>
                {h.text && <p className="text-text-muted text-sm mb-1">{h.text}</p>}
                <p className="text-text-muted text-sm">{h.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RubRhythm Commitment */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Our Commitment</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-primary font-semibold text-sm mb-3">Active Monitoring</h3>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• Manual review of all profiles and listings</li>
                <li>• 24/7 monitoring of suspicious activity</li>
                <li>• Rigorous identity verification for providers</li>
              </ul>
            </div>
            <div>
              <h3 className="text-primary font-semibold text-sm mb-3">Immediate Action</h3>
              <ul className="space-y-1.5 text-text-muted text-base">
                <li>• Immediate removal of suspicious content</li>
                <li>• Permanent ban of offending users</li>
                <li>• Full cooperation with FBI and authorities</li>
                <li>• Preserving digital evidence for investigations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-5">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span>❤️</span> Warning Signs — Victims
            </h3>
            <p className="text-text-muted text-base mb-3">Watch for these signs that may indicate someone is being trafficked:</p>
            <ul className="space-y-2">
              {victimSigns.map((s) => (
                <li key={s} className="flex items-start gap-2 text-text-muted text-base">
                  <span className="text-orange-400 flex-shrink-0 mt-0.5">⚠</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span>🚩</span> Warning Signs — Traffickers
            </h3>
            <p className="text-text-muted text-base mb-3">Behaviors that may indicate trafficking activity:</p>
            <ul className="space-y-2">
              {traffSigns.map((s) => (
                <li key={s} className="flex items-start gap-2 text-text-muted text-base">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to Report */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">How to Report</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { step: "1", icon: "👁️", title: "Identify", desc: "Note warning signs and document information safely without putting yourself at risk." },
              { step: "2", icon: "📢", title: "Report", desc: "Contact us immediately or call the National Hotline. All reports are confidential." },
              { step: "3", icon: "⚡", title: "Action", desc: "We take immediate action and cooperate fully with law enforcement." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 bg-primary/15 border border-primary/30 text-primary text-sm font-black rounded-full flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="text-white font-semibold text-sm mb-1">{s.title}</p>
                <p className="text-text-muted text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/3 rounded-xl p-4 flex flex-wrap gap-4 justify-center items-center">
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Report to RubRhythm</p>
              <a href="mailto:report@rubrhythm.com" className="text-primary text-xs hover:underline">report@rubrhythm.com</a>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">National Hotline</p>
              <a href="tel:1-888-373-7888" className="text-red-400 font-bold text-sm hover:underline">1-888-373-7888</a>
            </div>
          </div>
        </div>

        {/* Legal Consequences */}
        <div className="glass-card p-5 border-yellow-500/20 bg-yellow-500/5 mb-8">
          <h2 className="text-white font-bold text-base mb-3">⚖️ Legal Consequences — Human Trafficking is a Federal Crime</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-1.5 text-text-muted text-base">
              <li>• Life imprisonment in severe cases</li>
              <li>• Fines up to $250,000 per victim</li>
              <li>• Sex offender registration</li>
              <li>• Asset forfeiture</li>
            </ul>
            <ul className="space-y-1.5 text-text-muted text-base">
              <li>• Permanent platform ban</li>
              <li>• Full cooperation with FBI</li>
              <li>• Preservation of digital evidence</li>
              <li>• Support for criminal investigations</li>
            </ul>
          </div>
        </div>

        {/* Resources */}
        <div className="glass-card p-5 mb-8">
          <h2 className="text-white font-bold text-base mb-4">📚 Resources</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Polaris Project", url: "https://polarisproject.org" },
              { label: "DHS Blue Campaign", url: "https://www.dhs.gov/blue-campaign" },
              { label: "FBI Human Trafficking", url: "https://www.fbi.gov/investigate/violent-crime/human-trafficking" },
              { label: "State Dept TIP Office", url: "https://www.state.gov/humantrafficking/" },
            ].map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm hover:underline">
                <span>↗</span> {r.label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: "Terms of Service", href: "/info/terms" },
            { label: "Law & Legal", href: "/info/law-and-legal" },
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