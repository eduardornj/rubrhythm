"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MyAccountSidebar from "./MyAccountSidebar";
import MyAccountHeader from "./MyAccountHeader";

export default function MyAccountLayout({ children, title = "My Account" }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalFavorites: 0,
    isVerified: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin?callbackUrl=/myaccount");
      return;
    }
  }, [session, status, router]);

  // Fetch user data
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch credits
      const creditsResponse = await fetch(`/api/credits?userId=${session.user.id}`);
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        setCredits(creditsData.balance || 0);
      }

      // Fetch user stats
      const statsResponse = await fetch(`/api/user/stats?userId=${session.user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats({
          totalListings: statsData.totalListings || 0,
          activeListings: statsData.activeListings || 0,
          totalFavorites: statsData.totalFavorites || 0,
          isVerified: statsData.isVerified || false
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsUpdate = (newBalance) => {
    setCredits(newBalance);
  };

  const handleStatsUpdate = (newStats) => {
    setUserStats(prev => ({ ...prev, ...newStats }));
  };

  // Show loading spinner while checking authentication
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-text opacity-75">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MyAccountHeader
        title={title}
        credits={credits}
        onMenuClick={() => setSidebarOpen(true)}
        loading={loading}
      />

      <div className="flex">
        {/* Sidebar */}
        <MyAccountSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          credits={credits}
          userStats={userStats}
          loading={loading}
          onCreditsUpdate={handleCreditsUpdate}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Desktop Header Spacer */}
          <div className="h-16 lg:hidden"></div>

          {/* Content Container */}
          <div className="p-4 lg:p-8">
            {/* Page Title (Desktop) */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-accent">{title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-text opacity-75">
                      Welcome back, {session.user.name || session.user.email}
                    </span>
                    {userStats.isVerified && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Credits Display */}
                <div className="flex items-center space-x-4">
                  <div className="bg-dark-gray rounded-lg px-4 py-2 border border-secondary">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-text font-medium">
                        {loading ? (
                          <div className="animate-pulse bg-secondary rounded w-8 h-4"></div>
                        ) : (
                          `${credits} Credits`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Higher Order Component for easy wrapping
export function withMyAccountLayout(Component, title) {
  return function WrappedComponent(props) {
    return (
      <MyAccountLayout title={title}>
        <Component {...props} />
      </MyAccountLayout>
    );
  };
}

// Hook for accessing layout functions
export function useMyAccountLayout() {
  const [credits, setCredits] = useState(0);
  const [userStats, setUserStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalFavorites: 0,
    isVerified: false
  });

  const updateCredits = (newBalance) => {
    setCredits(newBalance);
  };

  const updateStats = (newStats) => {
    setUserStats(prev => ({ ...prev, ...newStats }));
  };

  const refreshData = async (userId) => {
    try {
      // Fetch credits
      const creditsResponse = await fetch(`/api/credits?userId=${userId}`);
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        setCredits(creditsData.balance || 0);
      }

      // Fetch user stats
      const statsResponse = await fetch(`/api/user/stats?userId=${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats({
          totalListings: statsData.totalListings || 0,
          activeListings: statsData.activeListings || 0,
          totalFavorites: statsData.totalFavorites || 0,
          isVerified: statsData.isVerified || false
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return {
    credits,
    userStats,
    updateCredits,
    updateStats,
    refreshData
  };
}