"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import BanCheck from "@/components/BanCheck";
import MyAccountSidebar from "./components/MyAccountSidebar";
import MyAccountHeader from "./components/MyAccountHeader";

const fetcher = (url) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function MyAccountLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: creditsData } = useSWR(
    session?.user?.id ? `/api/credits?userId=${session.user.id}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const userCredits = creditsData?.balance ?? 0;

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <span className="ml-3 text-text">Loading...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <BanCheck>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar - Fixed to left edge, full height */}
        <MyAccountSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentPath={pathname}
          userCredits={userCredits}
        />

        {/* Main Content - Full width minus sidebar */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <MyAccountHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userCredits={userCredits}
            userName={session?.user?.name}
          />
          <div className="p-4 lg:p-6 pb-28 lg:pb-6 flex-1">
            {children}
          </div>
        </div>
      </div>
    </BanCheck>
  );
}