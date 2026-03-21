"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS = {
  en: "EN",
  es: "ES",
};

const LOCALE_FLAGS = {
  en: "\uD83C\uDDFA\uD83C\uDDF8",
  es: "\uD83C\uDDEA\uD83C\uDDF8",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <button
      onClick={() => handleSwitch(otherLocale)}
      className="flex items-center space-x-1.5 text-xs font-medium text-text hover:text-white bg-surface/60 border border-white/10 px-2.5 py-1.5 rounded-lg hover:bg-surface hover:border-white/20 transition-all duration-200"
      aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
    >
      <span>{LOCALE_FLAGS[otherLocale]}</span>
      <span>{LOCALE_LABELS[otherLocale]}</span>
    </button>
  );
}
