"use client";

import dynamic from "next/dynamic";

// Carrega o FloatingBar dinamicamente, desativando SSR
const FloatingBar = dynamic(() => import("./FloatingBar"), { ssr: false });

export default function ClientFloatingBar() {
  return <FloatingBar />;
}