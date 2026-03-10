export const metadata = {
  title: "FAQ — Frequently Asked Questions | RubRhythm",
  description: "Find answers to common questions about RubRhythm — how to post listings, credits & pricing, badges, verification, referral program, and account safety.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is RubRhythm?", acceptedAnswer: { "@type": "Answer", text: "RubRhythm is a professional massage and body rub directory that connects independent providers with clients across the United States." } },
    { "@type": "Question", name: "How much does it cost to post a listing?", acceptedAnswer: { "@type": "Answer", text: "A standard listing costs 10 credits ($10). This is a one-time fee — your listing stays active until you remove it." } },
    { "@type": "Question", name: "How do credits work?", acceptedAnswer: { "@type": "Answer", text: "1 credit = $1 USD. You purchase credits in advance and use them for posting listings and premium features. Credits never expire." } },
    { "@type": "Question", name: "What does the Verified badge mean?", acceptedAnswer: { "@type": "Answer", text: "The blue Verified badge means the provider has submitted a valid government-issued ID and has been verified by our team. This is free and strongly recommended." } },
    { "@type": "Question", name: "What is a Featured listing?", acceptedAnswer: { "@type": "Answer", text: "Featured listings appear in a premium rotation at the top of city pages with a golden Featured badge, giving maximum visibility." } },
    { "@type": "Question", name: "What is Bump Up?", acceptedAnswer: { "@type": "Answer", text: "Bump Up moves your listing to the top of search results for 24 hours, as if it were just posted. It costs 5 credits." } },
    { "@type": "Question", name: "What payment methods do you accept?", acceptedAnswer: { "@type": "Answer", text: "We currently accept cryptocurrency payments. We are actively working on adding credit card payments." } },
    { "@type": "Question", name: "Do listings need to be approved?", acceptedAnswer: { "@type": "Answer", text: "Yes. All new listings go through a review process before being published. Approval typically happens within 24 hours." } },
    { "@type": "Question", name: "Is it free to create an account?", acceptedAnswer: { "@type": "Answer", text: "Yes, creating an account is completely free. You only need credits when you want to post a listing or use premium features." } },
    { "@type": "Question", name: "Can I get a refund?", acceptedAnswer: { "@type": "Answer", text: "Credits that have already been used are non-refundable. Unused credits may be refunded within 30 days of purchase." } },
  ],
};

export default function FAQLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
