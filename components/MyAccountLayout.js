"use client";

import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import BanCheck from "@/components/BanCheck";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MyAccountLayout({ children }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  const tabs = [
    { id: '/my-account', label: 'Profile', icon: '👤' },
    { id: '/my-account/payment-history', label: 'Payment History', icon: '💳' },
    { id: '/my-account/favorites', label: 'Favorites', icon: '❤️' },
    { id: '/my-account/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <MainLayout>
      <BanCheck>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      href={tab.id}
                      className={`${
                        pathname === tab.id
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </BanCheck>
    </MainLayout>
  );
}