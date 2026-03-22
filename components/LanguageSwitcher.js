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
      className="flex items-center space-x-1.5 text-xs font-bold text-white hover:text-white/80 bg-white/20 border border-white/30 px-2.5 py-1 rounded-full hover:bg-white/30 transition-all duration-200"
      aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
    >
      <span>{LOCALE_FLAGS[otherLocale]}</span>
      <span>{LOCALE_LABELS[otherLocale]}</span>
    </button>
  );
}
