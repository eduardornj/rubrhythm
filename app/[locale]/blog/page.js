import MainLayout from "@components/MainLayout";
import Link from "next/link";

export const metadata = {
  title: "Blog - Massage Safety, Verification & Industry Insights",
  description:
    "Safety tips, verification guides, and insights for the massage industry. Learn how to find legitimate providers and stay safe.",
  alternates: {
    canonical: "https://www.rubrhythm.com/blog",
  },
  openGraph: {
    title: "Blog - Massage Safety, Verification & Industry Insights",
    description:
      "Safety tips, verification guides, and insights for the massage industry. Learn how to find legitimate providers and stay safe.",
    url: "https://www.rubrhythm.com/blog",
    siteName: "RubRhythm",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Massage Safety, Verification & Industry Insights",
    description:
      "Safety tips, verification guides, and insights for the massage industry.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const POSTS = [
  {
    slug: "rubmd-alternative-verified-massage-directory",
    title:
      "RubMd Closed? Here's What Changed and Where to Find Verified Providers",
    excerpt:
      "RubMd is no longer available. Learn what happened and how to find ID-verified massage providers on a safe, compliant directory in 2026.",
    date: "2026-03-21",
    category: "Industry",
  },
  {
    slug: "rubratings-closed-find-verified-providers",
    title:
      "RubRatings Is Down — How to Find Safe, Reviewed Massage Providers",
    excerpt:
      "RubRatings is experiencing issues. Discover how to find massage providers with real reviews and ID verification on a compliant platform.",
    date: "2026-03-21",
    category: "Industry",
  },
  {
    slug: "safe-massage-directory-after-cityxguide",
    title:
      "Finding a Safe Massage Directory in 2026 — Lessons from CityXGuide",
    excerpt:
      "CityXGuide was seized by federal agencies. Learn the lessons and how to find a massage directory that prioritizes safety, verification, and compliance.",
    date: "2026-03-21",
    category: "Safety",
  },
  {
    slug: "how-to-find-legitimate-massage-provider",
    title: "How to Find a Legitimate Massage Provider in 2026",
    excerpt:
      "With fake listings and unverified directories everywhere, finding a real, professional massage provider can feel risky. Here's how to protect yourself.",
    date: "2026-03-20",
    category: "Safety",
  },
];

const CATEGORY_COLORS = {
  Safety: "bg-red-500/15 text-red-400 border-red-500/30",
  Verification: "bg-primary/15 text-primary border-primary/30",
  Guide: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Industry: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RubRhythm Blog",
    description:
      "Safety tips, verification guides, and insights for the massage industry.",
    url: "https://www.rubrhythm.com/blog",
    publisher: {
      "@type": "Organization",
      name: "RubRhythm",
      url: "https://www.rubrhythm.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.rubrhythm.com/icons/icon-512x512.svg",
      },
    },
    blogPost: POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `https://www.rubrhythm.com/blog/${post.slug}`,
      author: {
        "@type": "Organization",
        name: "RubRhythm",
      },
    })),
  },
];

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
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
            Blog
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Safety tips, verification guides, and insights for the massage
            industry.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="glass-card p-6 md:p-8 animate-fade-in hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    CATEGORY_COLORS[post.category] || CATEGORY_COLORS.Guide
                  }`}
                >
                  {post.category}
                </span>
                <time
                  dateTime={post.date}
                  className="text-text-muted text-sm"
                >
                  {formatDate(post.date)}
                </time>
              </div>

              <h2 className="text-white font-bold text-xl md:text-2xl mb-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              <p className="text-text-muted text-base leading-relaxed mb-4">
                {post.excerpt}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-3 justify-center mt-12">
          {[
            { label: "About RubRhythm", href: "/about" },
            { label: "For Providers", href: "/for-providers" },
            { label: "For Clients", href: "/for-clients" },
            { label: "Get Verified", href: "/get-verified" },
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
