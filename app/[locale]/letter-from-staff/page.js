import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Letter From the Staff | RubRhythm",
  description: "A message from the RubRhythm team — our mission, safety commitments, scam prevention, and platform updates.",
};

export default function LetterFromStaff() {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const updates = [
    "Identity verification system with government ID submission",
    "Role-based dashboards for Providers and Clients",
    "Advanced search filters across all US cities",
    "Mobile-first design with bottom navigation bar",
    "Credit-based promotion system: Bump Up, Highlight, Feature",
    "Available Now real-time status indicator",
    "Referral program with bonus credits",
    "Anti-scam measures and automated content moderation",
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Letter From the Staff</h1>
          <p className="text-text-muted text-base">{date}</p>
        </div>

        {/* Letter Body */}
        <div className="glass-card p-6 md:p-8 mb-6">
          <p className="text-white font-semibold mb-5 text-lg">Dear RubRhythm Community,</p>

          <div className="space-y-5 text-text-muted text-base leading-relaxed">
            <p>
              Thank you for being part of RubRhythm. Whether you are a provider building your client base or a client looking for quality massage services, we are here to make that connection safe, simple, and professional.
            </p>

            <p>
              <strong className="text-white">Our Mission.</strong> RubRhythm is an <strong className="text-white">independent directory platform</strong> that connects massage providers with clients across the United States. We are not affiliated with any other sites or services. We do not employ, manage, or supervise any providers. Our sole purpose is to provide a professional, trustworthy space for the massage community.
            </p>

            <p>
              <strong className="text-white">Safety Is Our Foundation.</strong> Every listing on RubRhythm goes through a manual review process before being published. We offer free identity verification so clients can easily identify trusted providers. Our team actively monitors content and investigates every report. Suspicious or fraudulent accounts are removed immediately.
            </p>

            <p>
              <strong className="text-white">Zero Tolerance Policy.</strong> We have an absolute zero-tolerance policy for human trafficking, exploitation, or any illegal activity. Any user found engaging in such behavior is immediately banned and reported to law enforcement. If you suspect trafficking, call the National Trafficking Hotline at <strong className="text-white">1-888-373-7888</strong>.
            </p>

            <p>
              <strong className="text-white">Verification Matters.</strong> With the growing number of verified providers on RubRhythm, unverified listings naturally receive less visibility. We strongly encourage all providers to get verified — it is <strong className="text-white">completely free</strong>, takes only a few minutes, and significantly increases your views and client trust. Submit a valid government-issued ID through your dashboard to get started.
            </p>

            <p>
              <strong className="text-white">Protecting Our Community From Scams.</strong> Unfortunately, there are individuals who try to deceive others through fake profiles, requests for prepayment, or by editing "Verified" badges into their photos. We take this extremely seriously:
            </p>
            <ul className="space-y-1.5 pl-4">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                Providers who photoshop "Verified" or checkmarks into their photos will have their <strong className="text-white">entire account permanently deleted</strong>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                Using the word "Verified" in listing titles is <strong className="text-white">automatically blocked</strong> by our system
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                RubRhythm will <strong className="text-white">never</strong> ask you to prepay for massage services — we are a directory only
              </li>
            </ul>
            <p>
              For a complete guide on how to protect yourself, visit our <Link href="/info/anti-scam" className="text-primary hover:underline font-medium">Anti-Scam Guide</Link>.
            </p>

            <p>
              <strong className="text-white">Transparency.</strong> Our processes — from listing approval to credit allocation — follow clear published guidelines. We maintain full compliance with all applicable US federal and state regulations, including 18 U.S.C. § 2257. Our <Link href="/info/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/info/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> are always available for review.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Growing Community",
              value: "Active",
              icon: (
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              label: "SSL Secured",
              value: "256-bit",
              icon: (
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
            {
              label: "Content Moderation",
              value: "24/7",
              icon: (
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ),
            },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-white font-black text-lg">{s.value}</p>
              <p className="text-text-muted text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Updates */}
        <div className="glass-card p-5 md:p-6 mb-6">
          <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Recent Updates
          </h2>
          <ul className="space-y-2">
            {updates.map((u) => (
              <li key={u} className="flex items-start gap-2.5 text-text-muted text-base">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {u}
              </li>
            ))}
          </ul>
        </div>

        {/* Important Notice */}
        <div className="glass-card p-5 md:p-6 border-amber-500/20 bg-amber-500/5 mb-6">
          <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Important Notices
          </h2>
          <ul className="space-y-2 text-text-muted text-base">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 flex-shrink-0">&#8226;</span>
              <span><strong className="text-white">All users must be 18+</strong> to access this platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 flex-shrink-0">&#8226;</span>
              <span>Provider verification is <strong className="text-white">free</strong> and requires a valid government-issued ID</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 flex-shrink-0">&#8226;</span>
              <span>Credits are platform-specific and used only for advertising features (1 credit = $1)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 flex-shrink-0">&#8226;</span>
              <span>Never send prepayment to someone you have not met — read our <Link href="/info/anti-scam" className="text-primary hover:underline">Anti-Scam Guide</Link></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 flex-shrink-0">&#8226;</span>
              <span>Report suspicious activity immediately to <a href="mailto:safety@rubrhythm.com" className="text-primary hover:underline">safety@rubrhythm.com</a></span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="glass-card p-5 md:p-6 mb-8">
          <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "General Support", email: "support@rubrhythm.com", icon: "💬" },
              { label: "Safety Issues", email: "safety@rubrhythm.com", icon: "🛡" },
              { label: "Feedback", email: "feedback@rubrhythm.com", icon: "📝" },
            ].map((c) => (
              <div key={c.email} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white font-medium text-xs mb-1">{c.label}</p>
                <a href={`mailto:${c.email}`} className="text-primary text-xs hover:underline break-all">{c.email}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Sign Off */}
        <div className="glass-card p-6 md:p-8 text-center border-primary/20 bg-primary/5 mb-8">
          <p className="text-text-muted text-base mb-1">With gratitude and respect,</p>
          <p className="text-white font-black text-xl">The RubRhythm Team</p>
          <p className="text-text-muted text-xs mt-2">Building a safer, more professional massage community.</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: "Terms of Service", href: "/info/terms" },
            { label: "Anti-Scam Guide", href: "/info/anti-scam" },
            { label: "Anti-Trafficking", href: "/info/anti-trafficking" },
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
