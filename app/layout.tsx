import { Geist, Geist_Mono } from "next/font/google";
import ClientFloatingBar from "../components/ClientFloatingBar";
import SessionWrapper from "../components/SessionWrapper";
import ActivityTracker from "../components/ActivityTracker";
import PWAManager from "../components/PWAManager";
import { getLocale } from "next-intl/server";
import "./tailwind.css";
import { ReactNode } from "react";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rubrhythm.com"),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/icons/icon-192x192.svg',
  },
  title: {
    default: "RubRhythm - Verified Massage & Body Rub Directory",
    template: "%s | RubRhythm"
  },
  description: "The only US massage directory where every provider is ID-verified. Browse Blue Badge providers across 250+ cities. Professional. Verified. Safe.",
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RubRhythm"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'RubRhythm - Verified Massage & Body Rub Directory',
    description: 'The only US massage directory where every provider is ID-verified. Browse Blue Badge providers across 250+ cities. Professional. Verified. Safe.',
    url: 'https://www.rubrhythm.com',
    siteName: 'RubRhythm',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RubRhythm - Verified Massage & Body Rub Directory',
    description: 'The only US massage directory where every provider is ID-verified. Professional. Verified. Safe.',
  },
  alternates: {
    canonical: 'https://www.rubrhythm.com',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ff6b6b'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="msapplication-TileColor" content="#ff6b6b" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.svg" />
        {/* WebMCP — AI agent tool discovery */}
        <link rel="mcp-manifest" href="/mcp.json" type="application/json" />
        {/* Hreflang — multilingual SEO */}
        <link rel="alternate" hrefLang="en" href="https://www.rubrhythm.com/" />
        <link rel="alternate" hrefLang="es" href="https://www.rubrhythm.com/es/" />
        <link rel="alternate" hrefLang="x-default" href="https://www.rubrhythm.com/" />
        {/* Speculation Rules — prefetch for near-instant navigation */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          prerender: [
            { where: { href_matches: "/about" } },
            { where: { href_matches: "/get-verified" } },
            { where: { href_matches: "/contact" } },
          ],
          prefetch: [
            { where: { selector_matches: "a[href^='/united-states']" }, eagerness: "moderate" },
            { where: { selector_matches: "a[href^='/search-results']" }, eagerness: "moderate" },
          ]
        }) }} />
        {/* Preconnect to GA4 (reduces latency) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {/* GA4 — RubRhythm (deferred to not block render) */}
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JL4NCC79LB');window.addEventListener('load',function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=G-JL4NCC79LB';s.async=true;document.head.appendChild(s);});` }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen relative`}>
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary z-50"></div>
        <PWAManager>
          <SessionWrapper>
            <ActivityTracker />
            <div className="flex-grow max-w-[85ch] md:max-w-none mx-auto w-full pb-14">
{children}
              <ClientFloatingBar />
            </div>
          </SessionWrapper>
        </PWAManager>
      </body>
    </html>
  );
}