"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useFilterStore from "../store/useFilterStore";

export default function FloatingBar() {
  const { onlyVerified, toggleOnlyVerified } = useFilterStore();
  const pathname = usePathname();

  // Hide on myaccount pages (has its own sidebar nav)
  if (pathname?.startsWith("/myaccount") || pathname?.includes("/myaccount")) return null;

  // Detect locale from pathname for locale-aware links
  const isSpanish = pathname?.startsWith("/es/") || pathname === "/es";
  const prefix = isSpanish ? "/es" : "";

  const isActive = (path) => {
    const fullPath = prefix + path;
    return pathname === fullPath || pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 px-2 py-1.5 flex justify-around items-center z-50 h-13">
      <Link href={`${prefix}/`} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive("/") ? "text-primary" : "text-gray-400 hover:text-white"}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      <Link href={`${prefix}/view-cities`} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive("/view-cities") ? "text-primary" : "text-gray-400 hover:text-white"}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-[10px] font-medium">Search</span>
      </Link>

      <button
        onClick={toggleOnlyVerified}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${onlyVerified ? "text-blue-400" : "text-gray-400 hover:text-white"}`}
        aria-label="Toggle verified profiles only"
      >
        <svg className="w-5 h-5" fill={onlyVerified ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-[10px] font-medium">Verified</span>
      </button>

      <Link href={`${prefix}/info/get-help-from-staff`} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive("/info/get-help-from-staff") ? "text-primary" : "text-gray-400 hover:text-white"}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-medium">Help</span>
      </Link>

      <Link href={`${prefix}/myaccount`} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${pathname?.includes("/myaccount") ? "text-primary" : "text-gray-400 hover:text-white"}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-[10px] font-medium">Account</span>
      </Link>
    </nav>
  );
}
