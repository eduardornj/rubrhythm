"use client";

import dynamic from "next/dynamic";

// Carrega o Header dinamicamente, desativando SSR
const Header = dynamic(() => import("./Header"), { ssr: false });
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-16 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}