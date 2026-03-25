"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

function maskPhone(area, number) {
  if (!area || !number) return null;
  // Show area code, mask first 3 digits of number, show next 2, mask rest
  // e.g. 4567890 → xxx-78xx
  const n = number.replace(/\D/g, "");
  if (n.length < 7) return `(${area}) ${"x".repeat(n.length)}`;
  const masked = "xxx-" + n[3] + n[4] + "xx";
  return `(${area}) ${masked}`;
}

function formatPhone(area, number) {
  if (!area || !number) return null;
  const n = number.replace(/\D/g, "");
  if (n.length === 7) return `(${area}) ${n.slice(0, 3)}-${n.slice(3)}`;
  return `(${area}) ${number}`;
}

export default function PhoneUnlock({ area, number, listingId, city, onAnalytics }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [revealed, setRevealed] = useState(false);

  if (!area || !number) return null;

  const isSpanish = pathname?.startsWith("/es");

  const handleUnlock = () => {
    if (!session) {
      router.push(isSpanish ? "/es/register" : "/register");
      return;
    }
    setRevealed(true);
    if (onAnalytics) onAnalytics();
  };

  if (revealed) {
    return (
      <a
        href={`tel:${area}${number}`}
        className="text-white font-mono hover:text-primary transition-colors"
      >
        {formatPhone(area, number)}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 font-mono text-sm tracking-wider">
        {maskPhone(area, number)}
      </span>
      <button
        onClick={handleUnlock}
        className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
        {isSpanish ? "Desbloquear" : "Unblock"}
      </button>
    </div>
  );
}
