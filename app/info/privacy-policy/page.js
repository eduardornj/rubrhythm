import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | RubRhythm",
    description: "RubRhythm's Privacy Policy covering data collection, use, storage, and your rights under CCPA, GDPR, and applicable privacy laws.",
};

const lastUpdated = "February 23, 2026";

const Section = ({ title, children }) => (
    <div className="glass-card p-5 space-y-3">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <div className="text-text-muted text-base leading-relaxed space-y-2">{children}</div>
    </div>
);

export default function PrivacyPolicy() {
    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-4xl mb-4">🔐</div>
                    <h1 className="text-2xl font-black text-white mb-2">Privacy Policy</h1>
                    <p className="text-text-muted text-base">Last updated: {lastUpdated}</p>
                </div>

                {/* Intro */}
                <div className="glass-card p-4 border-primary/20 bg-primary/5 mb-8">
                    <p className="text-text-muted text-base">
                        RubRhythm LLC ("<strong className="text-white">RubRhythm</strong>", "<strong className="text-white">we</strong>", "<strong className="text-white">our</strong>") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights. This policy applies to all users of <strong className="text-white">rubrhythm.com</strong>.
                    </p>
                </div>

                <div className="space-y-4">
                    <Section title="1. Who This Policy Applies To">
                        <p>
                            This Privacy Policy applies to all visitors and users of RubRhythm, including registered providers, clients, and unregistered visitors. If you are a California resident, the additional rights under the <strong className="text-white">California Consumer Privacy Act (CCPA)</strong> apply to you. If you are an EU/EEA resident, <strong className="text-white">GDPR</strong> rights apply.
                        </p>
                    </Section>

                    <Section title="2. What Data We Collect">
                        <p><strong className="text-white">Account Data:</strong></p>
                        <ul className="space-y-1">
                            <li>• Name, email address, password (hashed — never stored as plain text)</li>
                            <li>• User role (Provider or Client)</li>
                            <li>• Account creation date and last login</li>
                        </ul>
                        <p className="pt-1"><strong className="text-white">Provider Listing Data:</strong></p>
                        <ul className="space-y-1">
                            <li>• Service category, city/state, listing description, and contact preferences</li>
                            <li>• Photos uploaded to your profile</li>
                            <li>• Credit balance and transaction history</li>
                        </ul>
                        <p className="pt-1"><strong className="text-white">Verification Data (if submitted voluntarily):</strong></p>
                        <ul className="space-y-1">
                            <li>• Government-issued ID document (stored securely, reviewed by staff only)</li>
                            <li>• Self-photo/selfie submitted for identity confirmation</li>
                            <li>• Full legal name as it appears on ID</li>
                            <li>• Optional: Social media profile link</li>
                        </ul>
                        <p className="pt-1"><strong className="text-white">Technical Data (automatically collected):</strong></p>
                        <ul className="space-y-1">
                            <li>• IP address, browser type, operating system</li>
                            <li>• Pages visited, time on site, referral source</li>
                            <li>• Device type (mobile/desktop)</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Data">
                        <ul className="space-y-1.5">
                            <li>• To operate and maintain your account and listings</li>
                            <li>• To process credit purchases and advertising features</li>
                            <li>• To verify your identity and issue Verified Badges</li>
                            <li>• To detect and prevent fraud, abuse, and illegal activity</li>
                            <li>• To communicate important account and platform updates</li>
                            <li>• To comply with applicable laws and cooperate with law enforcement when required</li>
                            <li>• To analyze aggregate, anonymized usage data to improve the platform</li>
                        </ul>
                        <p className="pt-2 text-sm">
                            We do <strong className="text-white">not</strong> sell your personal data to third parties. We do not use your data for behavioral advertising.
                        </p>
                    </Section>

                    <Section title="4. Verification Documents — Special Category Data">
                        <p>Government ID documents submitted for verification are treated as <strong className="text-white">special category data</strong> with enhanced protections:</p>
                        <ul className="space-y-1.5 mt-1">
                            <li>• Stored in an encrypted, access-controlled directory</li>
                            <li>• Accessible to authorized staff only for verification purposes</li>
                            <li>• <strong className="text-white">Never shared publicly or with third parties</strong></li>
                            <li>• Deleted or anonymized upon request (see Section 8)</li>
                            <li>• Retained for no longer than 5 years or as required by 18 U.S.C. § 2257</li>
                        </ul>
                    </Section>

                    <Section title="5. Cookies & Tracking">
                        <p>We use the following types of cookies:</p>
                        <ul className="space-y-1.5 mt-1">
                            <li>• <strong className="text-white">Essential cookies:</strong> Required for login sessions and security (cannot be disabled)</li>
                            <li>• <strong className="text-white">Analytics cookies:</strong> Anonymous usage data to improve the platform (you may opt out)</li>
                        </ul>
                        <p className="mt-2 text-sm">We do not use advertising or tracking cookies. We do not participate in cross-site user tracking.</p>
                    </Section>

                    <Section title="6. Data Sharing">
                        <p>We only share your data in the following limited circumstances:</p>
                        <ul className="space-y-1.5 mt-1">
                            <li>• <strong className="text-white">Legal compliance:</strong> When required by valid legal process (court order, law enforcement request)</li>
                            <li>• <strong className="text-white">Anti-trafficking:</strong> We will proactively share information with authorities when we suspect trafficking or exploitation</li>
                            <li>• <strong className="text-white">Service providers:</strong> Limited technical vendors (hosting, database) under strict data processing agreements</li>
                        </ul>
                        <p className="mt-2 text-sm">We never sell, rent, or trade personal data.</p>
                    </Section>

                    <Section title="7. Data Retention">
                        <ul className="space-y-1.5">
                            <li>• <strong className="text-white">Account data:</strong> Retained while your account is active</li>
                            <li>• <strong className="text-white">Deleted accounts:</strong> Personal data removed within 30 days of account deletion</li>
                            <li>• <strong className="text-white">Verification documents:</strong> Retained as required by 18 U.S.C. § 2257 (maximum 5 years)</li>
                            <li>• <strong className="text-white">Transaction records:</strong> Retained for 7 years for financial compliance</li>
                            <li>• <strong className="text-white">Logs:</strong> Security and access logs retained for 90 days</li>
                        </ul>
                    </Section>

                    <Section title="8. Your Rights">
                        <p>Depending on your location, you have the following rights:</p>
                        <ul className="space-y-1.5 mt-1">
                            <li>• <strong className="text-white">Access:</strong> Request a copy of all data we hold about you</li>
                            <li>• <strong className="text-white">Correction:</strong> Update or correct inaccurate personal information</li>
                            <li>• <strong className="text-white">Deletion:</strong> Request deletion of your account and associated data (CCPA/GDPR right to erasure)</li>
                            <li>• <strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format</li>
                            <li>• <strong className="text-white">Opt-out:</strong> Opt out of non-essential cookies and analytics</li>
                            <li>• <strong className="text-white">Complaint:</strong> Lodge a complaint with your relevant data protection authority</li>
                        </ul>
                        <p className="mt-2">To exercise any of these rights, email: <a href="mailto:privacy@rubrhythm.com" className="text-primary hover:underline">privacy@rubrhythm.com</a></p>
                    </Section>

                    <Section title="9. California Residents — CCPA Rights">
                        <p>If you are a California resident, you additionally have the right to:</p>
                        <ul className="space-y-1.5 mt-1">
                            <li>• Know what personal information is collected, used, and shared</li>
                            <li>• Opt out of the sale of personal information (we do not sell data)</li>
                            <li>• Non-discrimination for exercising privacy rights</li>
                        </ul>
                        <p className="mt-2 text-sm">To submit a CCPA request: <a href="mailto:privacy@rubrhythm.com" className="text-primary hover:underline">privacy@rubrhythm.com</a> — we respond within 45 days.</p>
                    </Section>

                    <Section title="10. Children's Privacy">
                        <p>
                            RubRhythm is strictly an <strong className="text-white">18+ platform</strong>. We do not knowingly collect data from anyone under 18. If we discover a minor has created an account, we will immediately delete all associated data and ban the account. If you believe a minor has used our platform, contact <a href="mailto:safety@rubrhythm.com" className="text-primary hover:underline">safety@rubrhythm.com</a> immediately.
                        </p>
                    </Section>

                    <Section title="11. Data Security">
                        <p>We implement the following security measures:</p>
                        <ul className="space-y-1.5 mt-1">
                            <li>• All data transmitted over HTTPS/TLS encryption</li>
                            <li>• Passwords stored using bcrypt hashing</li>
                            <li>• Verification documents stored in access-controlled encrypted directories</li>
                            <li>• Regular security audits and penetration testing</li>
                            <li>• Strict employee access controls (principle of least privilege)</li>
                        </ul>
                    </Section>

                    <Section title="12. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy periodically. Significant changes will be announced on the platform with at least 7 days notice. Continued use of RubRhythm after changes constitutes acceptance of the updated policy.
                        </p>
                    </Section>

                    <Section title="13. Contact — Privacy">
                        <p>For all privacy-related requests or questions:</p>
                        <div className="mt-2 space-y-1">
                            <p><strong className="text-white">Email:</strong> <a href="mailto:privacy@rubrhythm.com" className="text-primary hover:underline">privacy@rubrhythm.com</a></p>
                            <p><strong className="text-white">Response time:</strong> 48 hours for general inquiries · 45 days for formal CCPA/GDPR requests</p>
                        </div>
                    </Section>
                </div>

                {/* Footer Nav */}
                <div className="mt-10 flex flex-wrap gap-3 justify-center">
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
