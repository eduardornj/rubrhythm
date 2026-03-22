"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function CreditsDashboard() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalPurchased: 0,
    thisMonth: 0,
    lastTransaction: null
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchCreditsData();
    }
  }, [session]);

  const fetchCreditsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [creditsResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/credits?userId=${session.user.id}`),
        fetch(`/api/credits/transactions?userId=${session.user.id}&limit=10`)
      ]);

      if (!creditsResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch credits data');
      }

      const creditsData = await creditsResponse.json();
      const transactionsData = await transactionsResponse.json();

      setCredits(creditsData.balance || 0);
      setTransactions(transactionsData.transactions || []);

      // Calculate stats
      const spent = transactionsData.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const purchased = transactionsData.transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const thisMonth = transactionsData.transactions
        .filter(t => {
          const transactionDate = new Date(t.createdAt);
          const now = new Date();
          return transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const lastTransaction = transactionsData.transactions[0] || null;

      setStats({
        totalSpent: spent,
        totalPurchased: purchased,
        thisMonth,
        lastTransaction
      });
    } catch (error) {
      console.error('Error fetching credits data:', error);
      setError(t('creditsErrorTitle'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type, description) => {
    if (type === 'purchase') {
      return (
        <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    }

    if (description?.includes('bump')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
      );
    }

    if (description?.includes('highlight')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      );
    }

    if (description?.includes('feature')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-gray-500/20 text-gray-400 flex items-center justify-center border border-gray-500/30">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">{t('creditsDashboardLoading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-400 font-semibold text-lg">{t('creditsErrorTitle')}</h3>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchCreditsData}
          className="mt-6 px-5 py-2.5 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
        >
          {t('creditsErrorRetry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            {t('creditsDashboardTitle')}
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            {t('creditsDashboardSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/myaccount/credits/history"
            className="px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 bg-white/5 text-white hover:bg-white/10 border border-white/10"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('creditsHistory')}
          </Link>
          <Link
            href="/myaccount/credits/buy"
            className="px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-[0_0_20px_rgba(255,42,127,0.3)] hover:shadow-[0_0_25px_rgba(255,42,127,0.5)] border border-primary/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('creditsBuy')}
          </Link>
        </div>
      </div>

      {/* Primary Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1c29] to-[#0f111a] rounded-3xl border border-white/10 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <svg className="w-64 h-64 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-3.47-1.78-3.47-3.29 0-1.79 1.58-2.67 3.22-2.97V4h2.67v2.07c1.51.32 2.73 1.3 2.88 2.81h-1.96c-.15-.82-.77-1.55-2.26-1.55-1.76 0-2.22.9-2.22 1.48 0 .86.58 1.46 2.68 2.01 2.37.62 3.46 1.7 3.46 3.4-.01 1.82-1.39 2.85-3.37 3.19z" />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-text-muted text-sm font-medium tracking-wide uppercase mb-2">{t('creditsAvailableBalance')}</p>
          <div className="flex items-end gap-3 mb-6">
            <h2 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {credits}
            </h2>
            <span className="text-xl sm:text-2xl text-text-muted font-medium mb-1.5">{t('creditsUnit')}</span>
          </div>

          {stats.lastTransaction && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-sm text-text-muted">
                {t('creditsLastActivity')} <span className="text-white font-medium">{formatDate(stats.lastTransaction.createdAt)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium mb-2">{t('creditsTotalPurchased')}</p>
              <h3 className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">{stats.totalPurchased}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium mb-2">{t('creditsTotalSpent')}</p>
              <h3 className="text-3xl font-bold text-white group-hover:text-red-400 transition-colors">{stats.totalSpent}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:bg-red-500/10 group-hover:text-red-400 group-hover:border-red-500/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium mb-2">{t('creditsThisMonthNet')}</p>
              <h3 className={`text-3xl font-bold transition-colors ${stats.thisMonth > 0 ? 'text-green-400' : stats.thisMonth < 0 ? 'text-red-400' : 'text-white'
                }`}>
                {stats.thisMonth > 0 ? '+' : ''}{stats.thisMonth}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${stats.thisMonth > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              stats.thisMonth < 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-white/5 text-text-muted border-white/10'
              }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions (Sidebar area) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-5">{t('creditsQuickActions')}</h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/myaccount/listings/bump-up"
                className="group flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-white">{t('creditsBumpUpLabel')}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{t('creditsBumpUpDesc')}</p>
              </Link>

              <Link
                href="/myaccount/listings/highlight"
                className="group flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-white">{t('creditsHighlightLabel')}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{t('creditsHighlightDesc')}</p>
              </Link>

              <Link
                href="/myaccount/listings/feature"
                className="group flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-white">{t('creditsFeatureLabel')}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{t('creditsFeatureDesc')}</p>
              </Link>

              <Link
                href="/myaccount/listings/auto-bump"
                className="group flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="font-semibold text-white">{t('creditsAutoBumpLabel')}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{t('creditsAutoBumpDesc')}</p>
              </Link>

              <Link
                href="/myaccount/blocklist"
                className="group flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-white">{t('creditsBlockListLabel')}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{t('creditsBlockListDesc')}</p>
              </Link>
            </div>
          </div>

          {/* Credit Usage Guide */}
          <div className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('creditsPricingInfo')}
              </h3>
              <ul className="text-sm space-y-3">
                <li className="flex justify-between items-center text-text-muted">
                  <span>{t('creditsPriceCreateListing')}</span>
                  <span className="text-white font-medium">{t('creditsPriceCreateListingVal')}</span>
                </li>
                <li className="flex justify-between items-center text-text-muted">
                  <span>{t('creditsPriceBumpUp')}</span>
                  <span className="text-white font-medium">{t('creditsPriceBumpUpVal')}</span>
                </li>
                <li className="flex justify-between items-center text-text-muted">
                  <span>{t('creditsPriceAvailableNow')}</span>
                  <span className="text-white font-medium">{t('creditsPriceAvailableNowVal')} <span className="text-text-muted/70 text-xs">{t('creditsPriceAvailableNowTime')}</span></span>
                </li>
                <li className="flex justify-between items-center text-text-muted">
                  <span>{t('creditsPriceHighlight')}</span>
                  <span className="text-white font-medium">{t('creditsPriceHighlightVal')}</span>
                </li>
                <li className="flex justify-between items-center text-text-muted">
                  <span>{t('creditsPriceFeature')}</span>
                  <span className="text-white font-medium">{t('creditsPriceFeatureVal')}</span>
                </li>
                <li className="flex justify-between items-center text-text-muted">
                  <span>{t('creditsPriceAutoBump')}</span>
                  <span className="text-white font-medium">{t('creditsPriceAutoBumpVal')}</span>
                </li>
              </ul>
              <p className="text-xs text-text-muted/70 mt-4 border-t border-white/10 pt-4 leading-relaxed">
                {t('creditsNeverExpire')}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{t('creditsRecentTransactions')}</h3>
              <Link
                href="/myaccount/credits/history"
                className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-1"
              >
                {t('creditsViewAll')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-4">
                  <svg className="w-8 h-8 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{t('creditsNoHistory')}</h4>
                <p className="text-text-muted max-w-sm mb-6 text-sm">{t('creditsNoHistoryDesc')}</p>
                <Link
                  href="/myaccount/credits/buy"
                  className="px-6 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  {t('creditsBuyFirstPack')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="group p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type, transaction.description)}
                      <div>
                        <p className="font-semibold text-white text-sm sm:text-base">{transaction.description}</p>
                        <p className="text-xs text-text-muted mt-0.5">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${transaction.type === 'purchase' ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {transaction.type === 'purchase' ? '+' : '-'}{Math.abs(transaction.amount)}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {t('creditsBalanceLabel')} {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}