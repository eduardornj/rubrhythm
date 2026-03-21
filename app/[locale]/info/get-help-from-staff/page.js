import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Get Help From Staff | RubRhythm",
  description: "Contact RubRhythm's support team for account help, technical issues, safety concerns, and more.",
};

const supportTypes = [
  {
    icon: "🔧",
    title: "Technical Support",
    desc: "Site issues, bugs, navigation problems",
    time: "2–4 hours",
    badge: "Normal",
    badgeColor: "text-text-muted",
  },
  {
    icon: "🛡️",
    title: "Safety & Security",
    desc: "Reports, suspicious accounts, policy violations",
    time: "30 minutes",
    badge: "High Priority",
    badgeColor: "text-red-400",
  },
  {
    icon: "👤",
    title: "Account Support",
    desc: "Verification, profile issues, login problems",
    time: "1–2 hours",
    badge: "High Priority",
    badgeColor: "text-red-400",
  },
  {
    icon: "💳",
    title: "Credits & Billing",
    desc: "Credit purchases, payments, refunds",
    time: "4–6 hours",
    badge: "Normal",
    badgeColor: "text-text-muted",
  },
];

const faqs = [
  {
    q: "How do I get my account verified?",
    a: 'Go to your Account → Verification. Upload a clear face photo and a selfie holding a paper with "RubRhythm" and today\'s date. Review takes 1–3 business days. Cost: 50 credits.',
  },
  {
    q: "I forgot my password. How do I recover it?",
    a: 'Use the "Forgot password?" link on the login page. Keep your credentials private and never share them.',
  },
  {
    q: "How do I report a suspicious user?",
    a: "Use the Report button on the user's profile, or email safety@rubrhythm.com. We take all reports seriously and investigate within 30 minutes for safety issues.",
  },
  {
    q: "Can I get a refund on credits?",
    a: "Unused credits may be refunded within 30 days of purchase. Used credits (spent on Bump Up, Highlight, Verification, etc.) are non-refundable. Contact billing@rubrhythm.com.",
  },
];

export default function GetHelpFromStaff() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-2xl font-black text-white mb-2">Get Help From Staff</h1>
          <p className="text-text-muted text-base">
            Our team is available to help. We prioritize safety issues — all reports reviewed immediately.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <a
            href="mailto:support@rubrhythm.com"
            className="glass-card p-5 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-white font-bold text-sm">Email Support</p>
                <p className="text-primary text-xs mt-0.5">support@rubrhythm.com</p>
                <p className="text-text-muted text-sm mt-1">Response within 2–6 hours</p>
              </div>
            </div>
          </a>

          <a
            href="mailto:safety@rubrhythm.com"
            className="glass-card p-5 border-red-500/20 bg-red-500/5 hover:border-red-500/40 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-white font-bold text-sm">Safety Emergency</p>
                <p className="text-red-400 text-xs mt-0.5">safety@rubrhythm.com</p>
                <p className="text-text-muted text-sm mt-1">Immediate response · 24/7</p>
              </div>
            </div>
          </a>
        </div>

        {/* Support Types */}
        <div className="glass-card p-5 mb-8">
          <h2 className="text-white font-bold text-lg mb-4">What Can We Help With?</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {supportTypes.map((s) => (
              <div key={s.title} className="bg-white/3 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    <span className={`text-xs flex-shrink-0 ${s.badgeColor}`}>{s.badge}</span>
                  </div>
                  <p className="text-text-muted text-sm mb-1">{s.desc}</p>
                  <p className="text-text-muted text-sm">⏱ ~{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.q} className="glass-card p-4">
                <p className="text-white font-semibold text-sm mb-2">{f.q}</p>
                <p className="text-text-muted text-base leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Emails Grid */}
        <div className="glass-card p-5 mb-8">
          <h2 className="text-white font-bold text-lg mb-4">All Contact Channels</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { label: "General Support", email: "support@rubrhythm.com", time: "2–6h" },
              { label: "Safety & Reports", email: "safety@rubrhythm.com", time: "Immediate" },
              { label: "Account Issues", email: "accounts@rubrhythm.com", time: "1–2h" },
              { label: "Credits & Billing", email: "billing@rubrhythm.com", time: "4–6h" },
              { label: "DMCA", email: "dmca@rubrhythm.com", time: "24h" },
              { label: "Legal", email: "legal@rubrhythm.com", time: "24–48h" },
            ].map((c) => (
              <div key={c.email} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3 gap-3">
                <div>
                  <p className="text-white text-xs font-medium">{c.label}</p>
                  <a href={`mailto:${c.email}`} className="text-primary text-xs hover:underline">{c.email}</a>
                </div>
                <span className="text-text-muted text-sm flex-shrink-0">{c.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick CTA */}
        <div className="glass-card p-5 border-primary/20 bg-primary/5 text-center mb-6">
          <p className="text-white font-bold mb-1">Are you in immediate danger?</p>
          <p className="text-text-muted text-base mb-3">Contact law enforcement first, then us.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="tel:911" className="bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-4 py-2 rounded-xl text-sm hover:bg-red-500/30 transition-colors">
              Call 911
            </a>
            <a href="tel:1-888-373-7888" className="bg-white/5 border border-white/10 text-white font-medium px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
              Trafficking Hotline: 1-888-373-7888
            </a>
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