import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | RubRhythm",
  description: "Read RubRhythm's Terms of Service — the rules and guidelines for using our massage directory platform.",
};

const Section = ({ number, title, children }) => (
  <div className="glass-card p-6">
    <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
      <span className="w-7 h-7 bg-primary/15 border border-primary/30 text-primary text-sm font-black rounded-lg flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      {title}
    </h2>
    <div className="text-text-muted text-base leading-relaxed space-y-2 pl-10">{children}</div>
  </div>
);

export default function Terms() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-text-muted text-base">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>

        {/* Alert */}
        <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5 mb-8">
          <p className="text-amber-400 text-base font-medium">
            ⚠️ By using RubRhythm, you confirm you are 18+ years old and agree to these terms.
          </p>
        </div>

        <div className="space-y-4">
          <Section number="1" title="Acceptance of Terms">
            <p>By accessing and using RubRhythm ("we", "our", "the Site"), you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, do not use our service.</p>
          </Section>

          <Section number="2" title="What RubRhythm Is">
            <p>RubRhythm is an <strong className="text-white">online directory</strong> that connects clients with independent massage providers. We are <strong className="text-white">not</strong> a massage booking agency and do not employ, manage, or supervise any providers listed on the platform.</p>
            <ul className="space-y-1 mt-2">
              <li>• All service arrangements are made directly between clients and providers</li>
              <li>• RubRhythm is not responsible for the quality or nature of services provided</li>
              <li>• Credits purchased are used for advertising features only</li>
            </ul>
          </Section>

          <Section number="3" title="Eligibility">
            <ul className="space-y-1">
              <li>• You must be at least <strong className="text-white">18 years old</strong> to use RubRhythm</li>
              <li>• You must provide accurate information when registering</li>
              <li>• You are responsible for keeping your login credentials secure</li>
              <li>• Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </Section>

          <Section number="4" title="User Conduct">
            <p className="mb-2">By using RubRhythm, you agree NOT to:</p>
            <ul className="space-y-1">
              <li>• Post false, misleading, or defamatory content</li>
              <li>• Use the platform for illegal activities</li>
              <li>• Harass, threaten, or intimidate other users</li>
              <li>• Create multiple accounts to manipulate reviews</li>
              <li>• Solicit or promote sexual services or illegal activities</li>
              <li>• Attempt to hack or damage the platform</li>
            </ul>
          </Section>

          <Section number="5" title="Zero Tolerance — Trafficking">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-3">
              <p className="text-red-400 font-bold text-center">ZERO TOLERANCE for human trafficking or exploitation of any kind.</p>
            </div>
            <p>Any user found engaged in trafficking will be immediately banned, reported to law enforcement, and subject to full legal action. If you suspect trafficking, contact <strong className="text-white">1-888-373-7888</strong> (National Trafficking Hotline).</p>
          </Section>

          <Section number="6" title="Credits & Payments">
            <ul className="space-y-1">
              <li>• Credits are used exclusively for advertising features (Bump Up, Highlight, Feature, Verification)</li>
              <li>• 1 credit = $1 USD. Credits do not expire.</li>
              <li>• No refunds on used credits. Unused credits may be refunded within 30 days of purchase.</li>
              <li>• RubRhythm does not process payments between clients and service providers</li>
            </ul>
          </Section>

          <Section number="7" title="Privacy & Data">
            <p>Your privacy is important. We collect only the data necessary to operate the platform. Verification documents are stored securely and used only for identity verification purposes. We do not sell personal data to third parties.</p>
          </Section>

          <Section number="8" title="Limitation of Liability">
            <p>RubRhythm acts as a directory platform only. We are not responsible for:</p>
            <ul className="space-y-1 mt-2">
              <li>• Services rendered by providers listed on the platform</li>
              <li>• Disputes between clients and providers</li>
              <li>• Actions taken outside of our platform</li>
            </ul>
          </Section>

          <Section number="9" title="Modifications & Termination">
            <p>We reserve the right to modify these terms at any time. Changes are effective immediately upon posting. We may suspend or terminate accounts that violate these terms at any time.</p>
          </Section>

          <Section number="10" title="Contact — Legal">
            <p>For questions about these terms:</p>
            <p className="mt-2"><strong className="text-white">Email:</strong> <a href="mailto:legal@rubrhythm.com" className="text-primary hover:underline">legal@rubrhythm.com</a></p>
          </Section>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          {[
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