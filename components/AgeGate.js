"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AgeGate() {
  const [show, setShow] = useState(false);
  const t = useTranslations('ageGate');

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
          <span className="text-3xl" aria-hidden="true">&#x1F51E;</span>
        </div>

        <h1 className="text-white text-2xl font-black mb-2">{t('title')}</h1>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          {t('description', { age: <strong key="age" className="text-white">{t('ageRequirement')}</strong> })}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full p-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            {t('enter')}
          </button>
          <button
            onClick={handleDecline}
            className="w-full p-3 text-white/70 hover:text-white text-sm transition-colors"
          >
            {t('exit')}
          </button>
        </div>

        <p className="mt-5 text-xs text-white/60">
          {t('agree')}{" "}
          <Link href="/info/terms" className="text-primary hover:underline">
            {t('termsOfService')}
          </Link>{" "}
          {t('and')}{" "}
          <Link href="/info/law-and-legal" className="text-primary hover:underline">
            {t('legalNotice')}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
