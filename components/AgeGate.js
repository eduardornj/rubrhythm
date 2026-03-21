"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const confirmed = document.cookie
      .split("; ")
      .find((row) => row.startsWith("age_confirmed="));
    if (!confirmed) setShow(true);
  }, []);

  const handleConfirm = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `age_confirmed=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    setShow(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-5">
          <span className="text-3xl">🔞</span>
        </div>

        <h1 className="text-white text-2xl font-black mb-2">Adults Only</h1>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          This website contains content intended for adults only.
          You must be <strong className="text-white">18 years of age or older</strong> to enter.
          By entering, you confirm you are of legal age in your jurisdiction.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full p-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            I am 18 or older — Enter
          </button>
          <button
            onClick={handleDecline}
            className="w-full p-3 text-white/70 hover:text-white text-sm transition-colors"
          >
            I am under 18 — Exit
          </button>
        </div>

        <p className="mt-5 text-xs text-white/60">
          By entering you agree to our{" "}
          <Link href="/info/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/info/law-and-legal" className="text-primary hover:underline">
            Legal Notice
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
