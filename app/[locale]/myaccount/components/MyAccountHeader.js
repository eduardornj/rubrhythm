"use client";

import { useSession } from "next-auth/react";
import NotificationManager from "@/components/NotificationManager";

export default function MyAccountHeader({ sidebarOpen, setSidebarOpen, userCredits, userName }) {
  const { data: session } = useSession();
  const isProvider = session?.user?.role === "provider";
  const displayName = userName || session?.user?.name || "My Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    // Only visible on mobile, provides a top bar and hamburger menu
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {session?.user?.image ? (
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 shadow-lg shadow-primary/20 relative">
            <img src={session.user.image} alt={displayName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <span className="text-white font-black text-xs">{initial}</span>
          </div>
        )}
        <span className="text-white font-bold text-sm tracking-wide truncate max-w-[140px]">{displayName}</span>
      </div>

      <div className="flex items-center gap-2">
        {isProvider && typeof userCredits === "number" && (
          <div className="bg-primary/20 border border-primary/30 px-2 py-1 rounded-md text-xs font-bold text-primary">
            {userCredits} credits
          </div>
        )}
        <NotificationManager />
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}