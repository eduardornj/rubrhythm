import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Anti-Scam Guide — Protect Yourself | RubRhythm",
  description: "Learn how to identify and avoid scams on massage platforms. RubRhythm's complete guide to staying safe — for both providers and clients.",
};

const RedFlag = ({ children }) => (
  <li className="flex items-start gap-3">
    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <span>{children}</span>
  </li>
);

const SafeTip = ({ children }) => (
  <li className="flex items-start gap-3">
    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <span>{children}</span>
  </li>
);

export default function AntiScamPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Anti-Scam Guide</h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">
            Your safety matters. Learn how to identify and avoid common scams to protect yourself on any massage platform.
          </p>
        </div>

        {/* Alert Box */}
        <div className="glass-card p-5 border-red-500/20 bg-red-500/5 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-400 font-bold text-base mb-1">RubRhythm is a directory only.</p>
              <p className="text-white/60 text-sm">We do not provide massage services, employ providers, or process payments between users. We will <strong className="text-white">never</strong> contact you asking for payment for services. If someone claims to represent RubRhythm and asks for money, it is a scam.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1 — Red Flags */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-white font-black text-lg mb-5 flex items-center gap-3">
              <span className="w-9 h-9 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </span>
              Red Flags — Common Scam Tactics
            </h2>
            <ul className="space-y-4 text-white/60 text-base leading-relaxed">
              <RedFlag>
                <strong className="text-white">Prepayment requests.</strong> Anyone asking for deposits, gift cards, CashApp, Venmo, or cryptocurrency before you have met in person is likely running a scam. Legitimate providers do not require upfront payment through untraceable methods.
              </RedFlag>
              <RedFlag>
                <strong className="text-white">Fake "Verified" badges.</strong> Some scammers photoshop "Verified" text or checkmark icons into their profile photos to appear legitimate. On RubRhythm, the Verified badge is displayed by our platform — never edited into photos. If you see it in the photo itself, report the profile immediately.
              </RedFlag>
              <RedFlag>
                <strong className="text-white">Too-good-to-be-true pricing.</strong> Extremely low rates compared to the market average are often bait. The scammer collects a "deposit" and then disappears or sends a different person.
              </RedFlag>
              <RedFlag>
                <strong className="text-white">Pressure to move off-platform.</strong> Scammers often try to quickly move conversations to WhatsApp, Telegram, or text messages to avoid platform moderation. While providers may share their phone number, be cautious of anyone who insists on leaving the platform before you have verified their identity.
              </RedFlag>
              <RedFlag>
                <strong className="text-white">Stock photos or stolen images.</strong> Reverse-image search the profile photos if something feels off. Scammers frequently use photos stolen from social media or other platforms.
              </RedFlag>
              <RedFlag>
                <strong className="text-white">Vague or copy-pasted descriptions.</strong> Profiles with generic descriptions that could apply to anyone, or text that reads like it was copied from another listing, are often fake.
              </RedFlag>
              <RedFlag>
                <strong className="text-white">Claiming to be from the platform.</strong> No RubRhythm staff member will ever contact you asking for payment, login credentials, or personal information through messages or calls.
              </RedFlag>
            </ul>
          </div>

          {/* Section 2 — For Clients */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-white font-black text-lg mb-5 flex items-center gap-3">
              <span className="w-9 h-9 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Safety Tips for Clients
            </h2>
            <ul className="space-y-4 text-white/60 text-base leading-relaxed">
              <SafeTip>
                <strong className="text-white">Look for the Verified badge.</strong> Verified providers have submitted a valid government-issued ID and have been confirmed by our team. This is the strongest trust signal on the platform.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Never send money before meeting.</strong> Do not send deposits, gift cards, or any form of payment to someone you have never met in person. No legitimate provider requires prepayment through untraceable methods.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Read reviews carefully.</strong> Check if the provider has genuine reviews from other clients. Look for specific details in reviews rather than generic praise.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Trust your instincts.</strong> If something feels wrong — the pricing is unusually low, the person is overly aggressive, or the story keeps changing — walk away. Your safety is more important than any appointment.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Meet in a safe location.</strong> For your first meeting with any new provider, choose a professional location. Be cautious of providers who insist on unusual meeting arrangements.
              </SafeTip>
            </ul>
          </div>

          {/* Section 3 — For Providers */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-white font-black text-lg mb-5 flex items-center gap-3">
              <span className="w-9 h-9 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              Safety Tips for Providers
            </h2>
            <ul className="space-y-4 text-white/60 text-base leading-relaxed">
              <SafeTip>
                <strong className="text-white">Get verified.</strong> The blue Verified badge is free and significantly increases your credibility. Clients are increasingly filtering for verified providers only.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Screen your clients.</strong> It is perfectly acceptable to ask for basic information before accepting an appointment. Trust your judgment and do not feel pressured to accept clients who make you uncomfortable.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Never share your login credentials.</strong> No one from RubRhythm will ever ask for your password. If someone contacts you claiming to be from our team asking for your login, it is a scam.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Report impersonators.</strong> If you discover someone using your photos, name, or identity on a fake profile, report it to us immediately. We will take it down and ban the offending account.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Keep your account secure.</strong> Use a strong, unique password and enable any available security features. Do not reuse passwords from other sites.
              </SafeTip>
            </ul>
          </div>

          {/* Section 4 — What RubRhythm Does */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-white font-black text-lg mb-5 flex items-center gap-3">
              <span className="w-9 h-9 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              How RubRhythm Protects You
            </h2>
            <ul className="space-y-4 text-white/60 text-base leading-relaxed">
              <SafeTip>
                <strong className="text-white">Manual listing review.</strong> Every new listing is manually reviewed by our team before being published. This catches fake profiles, inappropriate content, and policy violations before they go live.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Identity verification.</strong> Our free verification system confirms provider identity through government-issued ID. Verified providers display a blue badge that cannot be faked.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Automated content blocking.</strong> Our system automatically blocks the use of "Verified" in listing titles and flags suspicious content patterns.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Zero tolerance for fraud.</strong> Accounts found engaging in scams, using fake photos, or impersonating verified providers are permanently banned without warning.
              </SafeTip>
              <SafeTip>
                <strong className="text-white">Community reporting.</strong> Users can report suspicious profiles at any time. Our team investigates every report and takes action within 24 hours.
              </SafeTip>
            </ul>
          </div>

          {/* Report Section */}
          <div className="glass-card p-6 md:p-8 border-amber-500/20 bg-amber-500/5">
            <h2 className="text-white font-black text-lg mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              How to Report a Scam
            </h2>
            <div className="text-white/60 text-base leading-relaxed space-y-4">
              <p>If you encounter a suspicious profile or believe you have been targeted by a scam, take these steps:</p>
              <ol className="space-y-3 pl-1">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-black rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span><strong className="text-white">Do not send any money.</strong> If you have not already sent payment, stop all communication with the person immediately.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-black rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span><strong className="text-white">Save evidence.</strong> Take screenshots of the conversation, profile, and any payment requests. This helps our team investigate.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-black rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span><strong className="text-white">Report to RubRhythm.</strong> Email <a href="mailto:safety@rubrhythm.com" className="text-primary hover:underline">safety@rubrhythm.com</a> with your screenshots and a description of what happened.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-black rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span><strong className="text-white">Report to authorities.</strong> If you lost money, file a report with the <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FBI Internet Crime Complaint Center (IC3)</a> or your local law enforcement.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          {[
            { label: "Letter From Staff", href: "/letter-from-staff" },
            { label: "Anti-Trafficking", href: "/info/anti-trafficking" },
            { label: "Terms of Service", href: "/info/terms" },
            { label: "FAQ", href: "/info/faq" },
            { label: "Get Help", href: "/info/get-help-from-staff" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-white/40 hover:text-primary text-xs border border-white/10 px-3 py-1.5 rounded-full hover:border-primary/30 transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
