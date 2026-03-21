import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Verification Guide - How ID Verification Works on RubRhythm",
  description:
    "Learn how RubRhythm's ID verification works. Submit your government ID and selfie, get reviewed within 24 hours, and earn your Blue Badge for free.",
  alternates: {
    canonical: "https://www.rubrhythm.com/verification-guide",
  },
  openGraph: {
    title: "Verification Guide - How ID Verification Works on RubRhythm",
    description:
      "Learn how RubRhythm's ID verification works. Submit your government ID and selfie, get reviewed within 24 hours, and earn your Blue Badge for free.",
    url: "https://www.rubrhythm.com/verification-guide",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verification Guide - How ID Verification Works on RubRhythm",
    description:
      "Free ID verification. Reviewed in 24 hours. Blue Badge for life.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Get Verified on RubRhythm",
  description:
    "A step-by-step guide to completing ID verification on RubRhythm and earning your Blue Badge.",
  url: "https://www.rubrhythm.com/verification-guide",
  totalTime: "PT5M",
  supply: [
    {
      "@type": "HowToSupply",
      name: "Government-issued photo ID (driver's license, passport, or state ID)",
    },
    {
      "@type": "HowToSupply",
      name: "A selfie holding the ID",
    },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload Your Documents",
      text: "Log into your RubRhythm account and navigate to the verification page. Upload a clear photo of your government-issued ID and a selfie holding that ID.",
      url: "https://www.rubrhythm.com/verification-guide#upload",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Team Review",
      text: "Our moderation team reviews your submission within 24 hours. A real person compares your ID photo to your selfie and checks the document for authenticity.",
      url: "https://www.rubrhythm.com/verification-guide#review",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Blue Badge Issued",
      text: "Once approved, your Blue Badge is issued and appears on all your listings immediately. The badge confirms your identity has been verified.",
      url: "https://www.rubrhythm.com/verification-guide#badge",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Badge Appears on Your Listings",
      text: "Your Blue Badge is displayed prominently on every listing you create. Clients can see at a glance that you are a verified provider.",
      url: "https://www.rubrhythm.com/verification-guide#live",
    },
  ],
};

const whyWeVerify = [
  "Fake profiles hurt everyone. Clients get scammed, and legitimate providers lose business to impersonators who steal photos and undercut prices.",
  "Clients need confidence. When someone searches for a provider, they deserve to know the person behind the profile is real.",
  "Providers need credibility. The Blue Badge is immediate proof that you are who you say you are. It builds trust before a single message is exchanged.",
];

const whatYouNeed = [
  {
    title: "Government-Issued Photo ID",
    desc: "A driver's license, passport, or state-issued identification card. The ID must be current and not expired.",
  },
  {
    title: "A Selfie Holding the ID",
    desc: "A clear photo of you holding the ID next to your face. Both your face and the ID must be visible and legible in the same image.",
  },
];

const processSteps = [
  {
    id: "upload",
    step: "1",
    title: "Upload Your Documents",
    desc: "Log into your RubRhythm account and navigate to the verification page. Upload a clear photo of your government-issued ID and a selfie holding that ID. Make sure both images are well-lit and in focus.",
  },
  {
    id: "review",
    step: "2",
    title: "Our Team Reviews",
    desc: "A real person on our moderation team reviews your submission. We compare the photo on the ID to your selfie, check that the ID is authentic and not expired, and verify the name matches your account. This typically takes less than 24 hours.",
  },
  {
    id: "badge",
    step: "3",
    title: "Blue Badge Issued",
    desc: "Once your submission is approved, your Blue Badge is issued immediately. You will receive a notification confirming your verified status.",
  },
  {
    id: "live",
    step: "4",
    title: "Badge Appears on All Your Listings",
    desc: "Your Blue Badge is now displayed on every listing you create. Clients browsing RubRhythm can see at a glance that your identity has been confirmed by our team.",
  },
];

const whatWeCheck = [
  "Name on the ID matches the name on your RubRhythm account",
  "Photo on the ID matches the selfie you submitted",
  "The ID is not expired",
  "The ID is government-issued (not a student ID, work badge, or similar)",
];

const whatWeDontStore = [
  "We do not store your ID number, Social Security number, or any sensitive identification numbers.",
  "We do not share your verification documents with third parties, other users, or advertisers.",
  "Verification images are encrypted during transmission and review. After verification is complete, documents are securely deleted.",
];

const faqs = [
  {
    q: "Is verification free?",
    a: "Yes. Verification is completely free for all providers. There are no fees, no subscriptions, and no hidden charges.",
  },
  {
    q: "How long does verification take?",
    a: "Most submissions are reviewed within 24 hours. During high-volume periods, it may take up to 48 hours.",
  },
  {
    q: "Can I re-verify if my ID expires?",
    a: "Yes. If your ID expires or you need to update your verification, you can resubmit at any time through the same process.",
  },
  {
    q: "What if my submission is rejected?",
    a: "If your submission is rejected, you will receive a notification explaining why. The most common reasons are blurry photos, expired IDs, or mismatched names. You can resubmit immediately with clearer documentation.",
  },
  {
    q: "Can the Blue Badge be transferred or purchased?",
    a: "No. The Blue Badge is tied to your verified identity and cannot be transferred, sold, or purchased. It can only be earned through the verification process.",
  },
  {
    q: "Will other users see my real name?",
    a: "No. Your display name and provider name are separate from your legal name. Verification confirms your identity to our team, but your legal name is never shown to other users.",
  },
];

export default function VerificationGuidePage() {
  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            How <span className="text-gradient">Verification</span> Works
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            ID verification is free, takes less than 5 minutes to submit, and
            is reviewed by a real person within 24 hours.
          </p>
        </div>

        {/* Why We Verify */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-4">Why We Verify</h2>
          <div className="space-y-4 text-text-muted text-base leading-relaxed">
            {whyWeVerify.map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
          </div>
        </section>

        {/* What You Need */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">What You Need</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whatYouNeed.map((item) => (
              <div
                key={item.title}
                className="bg-white/3 rounded-xl p-5 border border-white/5"
              >
                <h3 className="text-white font-semibold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The Process */}
        <section className="mb-6">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            The Process
          </h2>
          <div className="space-y-4">
            {processSteps.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="glass-card p-5 md:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/15 border border-primary/30 text-primary text-sm font-black rounded-full flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-2">
                      {item.title}
                    </h3>
                    <p className="text-text-muted text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What We Check */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">What We Check</h2>
          <ul className="space-y-3">
            {whatWeCheck.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-text-muted text-base"
              >
                <span className="text-primary flex-shrink-0 mt-0.5">+</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* What We DON'T Store */}
        <section className="glass-card p-6 md:p-8 mb-6 border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-xl mb-5">
            What We Do NOT Store
          </h2>
          <p className="text-text-muted text-base leading-relaxed mb-5">
            Your privacy matters. Here is exactly what happens with your
            verification documents.
          </p>
          <div className="space-y-4">
            {whatWeDontStore.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 bg-white/3 rounded-xl p-4"
              >
                <span className="text-primary flex-shrink-0 mt-0.5">
                  &#10003;
                </span>
                <p className="text-text-muted text-base">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-white font-bold text-xl mb-5 px-1">
            Verification FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="glass-card p-5">
                <h3 className="text-white font-semibold text-base mb-2">
                  {faq.q}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="glass-card p-8 text-center border-primary/20 animate-fade-in">
          <h2 className="text-white font-bold text-2xl mb-3">
            Get Verified Now
          </h2>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            Verification is free and takes less than 5 minutes to submit. Join
            the growing number of Blue Badge providers on RubRhythm.
          </p>
          <Link
            href="/get-verified"
            className="btn-primary text-base px-8 py-3"
          >
            Get Verified -- It is Free
          </Link>
        </section>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            { label: "Why Verification Matters", href: "/why-verification-matters" },
            { label: "Safety Guide", href: "/safety-guide" },
            { label: "For Providers", href: "/for-providers" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "FAQ", href: "/info/faq" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-text-muted hover:text-primary text-xs border border-white/10 px-3 py-1.5 rounded-full hover:border-primary/30 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
