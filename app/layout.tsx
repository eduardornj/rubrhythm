import { Geist, Geist_Mono } from "next/font/google";
import ClientFloatingBar from "../components/ClientFloatingBar";
import SessionWrapper from "../components/SessionWrapper";
import PWAManager from "../components/PWAManager";
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
  title: "RubRhythm - Body Rubs & Massage Directory",
  description: "Find body rubs and massage providers across America on RubRhythm. Search for providers in cities like Dallas, Chicago, Atlanta, Houston, and more.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RubRhythm"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'RubRhythm - Authentic Massage Directory',
    description: 'Find trusted body rubs and massage providers right in your city. Safe, verified and professional.',
    url: 'https://rubrhythm.com',
    siteName: 'RubRhythm',
    images: [
      {
        url: 'https://rubrhythm.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RubRhythm Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RubRhythm - Body Rubs & Massage Directory',
    description: 'Find trusted body rubs and massage providers right in your city.',
    images: ['https://rubrhythm.com/twitter-image.jpg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ff6b6b'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* SEO Fallbacks for static scanner compliance */}
        <title>RubRhythm - Body Rubs & Massage Directory</title>
        <meta name="description" content="Find body rubs and massage providers across America on RubRhythm." />
        <meta property="og:title" content="RubRhythm - Authentic Massage Directory" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#ff6b6b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RubRhythm" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="msapplication-TileColor" content="#ff6b6b" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen relative`}>
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary z-50"></div>
        <PWAManager>
          <SessionWrapper>
            <div className="flex-grow max-w-[85ch] md:max-w-none mx-auto w-full">
{children}
              <ClientFloatingBar />
            </div>
          </SessionWrapper>
        </PWAManager>
      </body>
    </html>
  );
}