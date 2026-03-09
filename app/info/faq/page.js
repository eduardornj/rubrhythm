"use client";
import { useState } from "react";
import MainLayout from "@components/MainLayout";
import Link from "next/link";

const faqs = [
  {
    category: "Getting Started",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    questions: [
      {
        q: "What is RubRhythm?",
        a: "RubRhythm is a professional massage and body rub directory that connects independent providers with clients across the United States. We are a peer-to-peer platform — we do not employ, manage, or supervise any providers listed on the site."
      },
      {
        q: "How do I create an account?",
        a: "Click the Sign Up button at the top of the page. You can register using your email, or sign in with Google for a faster setup. Once your account is created, you can immediately start building your listing."
      },
      {
        q: "How do I post a listing?",
        a: "After signing in, go to My Account and click \"Add New Listing\". Fill in your details — title, description, photos, location, rates, and contact info. Your listing will be submitted for review and published once approved."
      },
      {
        q: "Is it free to create an account?",
        a: "Yes, creating an account is completely free. You only need credits when you want to post a listing or use premium features like Bump Up, Highlight, or Feature."
      },
    ],
  },
  {
    category: "Credits & Pricing",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    questions: [
      {
        q: "How much does it cost to post a listing?",
        a: "A standard listing costs 10 credits ($10). This is a one-time fee — your listing stays active until you remove it."
      },
      {
        q: "How do credits work?",
        a: "1 credit = $1 USD. You purchase credits in advance and use them for posting listings and premium features. Credits never expire."
      },
      {
        q: "What are the premium feature costs?",
        a: "Here are the current prices:\n\n• Bump Up — 5 credits: Moves your listing to the top of search results for 24 hours.\n• Highlight — 15 credits (7 days) or 45 credits (30 days): Adds a colored border so your listing stands out.\n• Feature — 20 credits (7 days) or 60 credits (30 days): Puts your listing in permanent rotation at the top with a Featured badge.\n• Verification — Free: Submit your ID to get a blue Verified badge that boosts trust and clicks."
      },
      {
        q: "What payment methods do you accept?",
        a: "We currently accept cryptocurrency payments. We are actively working on adding credit card payments for your convenience."
      },
      {
        q: "Can I get a refund?",
        a: "Credits that have already been used (for posting or premium features) are non-refundable. Unused credits may be refunded within 30 days of purchase. Contact our support team for refund requests."
      },
    ],
  },
  {
    category: "Badges & Visibility",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    questions: [
      {
        q: "What does the Verified badge mean?",
        a: "The blue Verified badge means the provider has submitted a valid government-issued ID and has been verified by our team. This is free and strongly recommended — verified listings get significantly more views and trust from clients."
      },
      {
        q: "What is a Featured listing?",
        a: "Featured listings appear in a premium rotation at the top of city pages with a golden Featured badge. This gives you maximum visibility and priority placement in search results."
      },
      {
        q: "What does Highlight do?",
        a: "Highlighted listings have a glowing colored border that makes them visually stand out from standard listings in search results. It draws attention without changing your position."
      },
      {
        q: "What is Bump Up?",
        a: "Bump Up moves your listing to the top of search results for 24 hours, as if it were just posted. It is the most affordable way to get a quick visibility boost."
      },
      {
        q: "What does Available Now mean?",
        a: "The \"Available Now\" badge is a real-time indicator that shows clients you are currently available for appointments. You can toggle it on and off from your dashboard — it automatically expires after 12 hours."
      },
    ],
  },
  {
    category: "Listing Rules & Guidelines",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    questions: [
      {
        q: "What photos can I upload?",
        a: "Photos must be professional and tasteful. No explicit, nude, or sexually suggestive content is allowed. Photos should represent you accurately and show your face or professional appearance. Listings with inappropriate photos will be rejected or removed."
      },
      {
        q: "Can I use the word \"Verified\" in my title?",
        a: "No. The word \"Verified\" is reserved exclusively for providers who have completed our identity verification process. Using it in your listing title is automatically blocked and will result in your listing being rejected."
      },
      {
        q: "What should I include in my description?",
        a: "Focus on the massage services you offer, your experience, specialties, and what makes your service unique. Do not include phone numbers, links, email addresses, or any explicit/sexual content in your description."
      },
      {
        q: "Do listings need to be approved?",
        a: "Yes. All new listings go through a review process before being published. This ensures quality, safety, and compliance with our guidelines. Approval typically happens within 24 hours."
      },
      {
        q: "Can I edit my listing after it is published?",
        a: "Yes. Go to My Account, find your listing, and click Edit. You can update your title, description, photos, rates, location, and contact information at any time."
      },
      {
        q: "How do I delete my listing?",
        a: "Go to My Account, find the listing you want to remove, and click Delete. This action is permanent and cannot be undone. Credits used to create the listing are not refunded."
      },
    ],
  },
  {
    category: "Referral Program",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    questions: [
      {
        q: "How does the referral program work?",
        a: "Every user gets a unique referral link. When someone registers using your link and makes their first credit purchase, you earn bonus credits as a reward. Share your link from the Referral page in your dashboard."
      },
      {
        q: "How much do I earn per referral?",
        a: "You earn bonus credits when your referred users make their first purchase. Check the Referral section in your dashboard for current reward amounts and to track your referrals."
      },
    ],
  },
  {
    category: "Account & Safety",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    questions: [
      {
        q: "How do I get verified?",
        a: "Go to your dashboard and click \"Get Verified\" or visit the Get Verified page. You will need to submit a clear photo of a valid government-issued ID. Our team reviews submissions and grants the blue Verified badge once confirmed. Verification is completely free."
      },
      {
        q: "Is my personal information safe?",
        a: "Yes. We take privacy very seriously. Verification documents are stored securely and used only for identity verification purposes. We do not sell, share, or display your personal data to third parties. Only your public listing information is visible to clients."
      },
      {
        q: "What is your policy on trafficking?",
        a: "RubRhythm has a strict zero-tolerance policy for human trafficking or exploitation of any kind. Any user found engaging in such activities will be immediately banned and reported to law enforcement. If you suspect trafficking, contact the National Trafficking Hotline at 1-888-373-7888."
      },
      {
        q: "How do I contact support?",
        a: "You can reach our team through the \"Get Help From Staff\" page in the footer, or email us at legal@rubrhythm.com for legal inquiries. We aim to respond within 24 hours."
      },
    ],
  },
];

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <span className={`font-bold text-base transition-colors ${isOpen ? "text-primary" : "text-white group-hover:text-white/90"}`}>
          {question}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-white/40"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-5 pb-5 text-white/60 text-base leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const all = {};
    faqs.forEach((cat, ci) =>
      cat.questions.forEach((_, qi) => {
        all[`${ci}-${qi}`] = true;
      })
    );
    setOpenItems(all);
  };

  const collapseAll = () => setOpenItems({});

  const totalQuestions = faqs.reduce((sum, cat) => sum + cat.questions.length, 0);
  const openCount = Object.values(openItems).filter(Boolean).length;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">
            Everything you need to know about RubRhythm. Can't find your answer?{" "}
            <Link href="/info/get-help-from-staff" className="text-primary hover:underline">
              Contact our team
            </Link>
            .
          </p>
        </div>

        {/* Expand/Collapse All */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/30 text-xs font-medium uppercase tracking-wider">
            {totalQuestions} questions
          </span>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              Expand All
            </button>
            {openCount > 0 && (
              <button
                onClick={collapseAll}
                className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                Collapse All
              </button>
            )}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, ci) => (
            <div key={ci}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  {category.icon}
                </span>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">{category.category}</h2>
              </div>
              <div className="space-y-2">
                {category.questions.map((faq, qi) => (
                  <FAQItem
                    key={qi}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={!!openItems[`${ci}-${qi}`]}
                    onClick={() => toggleItem(`${ci}-${qi}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Box */}
        <div className="mt-12 glass-card p-8 text-center border-primary/20">
          <h3 className="text-white font-black text-lg mb-2">Ready to get started?</h3>
          <p className="text-white/50 text-base mb-6 max-w-md mx-auto">
            Create your free account and post your listing in minutes. Join thousands of providers already on RubRhythm.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/register-on-rubrhythm"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all text-sm"
            >
              Create Free Account
            </Link>
            <Link
              href="/info/terms"
              className="px-6 py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold rounded-xl transition-all text-sm"
            >
              Read Terms
            </Link>
          </div>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          {[
            { label: "Terms", href: "/info/terms" },
            { label: "Privacy Policy", href: "/info/privacy-policy" },
            { label: "Anti-Trafficking", href: "/info/anti-trafficking" },
            { label: "Anti-Scam Guide", href: "/info/anti-scam" },
            { label: "Law & Legal", href: "/info/law-and-legal" },
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
