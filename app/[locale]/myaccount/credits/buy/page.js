"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { analytics } from "@/lib/analytics";

const PACKAGES = [
  {
    id: "starter",
    label: "Starter",
    credits: 20,
    priceUSD: 20,
    popular: false,
    features: ["Basic boosts", "Try features"],
  },
  {
    id: "basic",
    label: "Basic",
    credits: 33,
    bonus: 3,
    priceUSD: 30,
    popular: false,
    features: ["Highlight listings", "More visibility"],
  },
  {
    id: "pro",
    label: "Pro",
    credits: 55,
    bonus: 5,
    priceUSD: 50,
    popular: true,
    features: ["Feature listings ⭐", "Maximum exposure", "Top ranking"],
  },
  {
    id: "premium",
    label: "Premium",
    credits: 120,
    bonus: 20,
    priceUSD: 100,
    popular: false,
    features: ["Feature Premium 💎", "VIP placement", "Ultimate value"],
  },
  {
    id: "ultra",
    label: "Ultra",
    credits: 260,
    bonus: 60,
    priceUSD: 200,
    popular: false,
    features: ["Dominate your city", "Maximum bonuses", "Top position"],
  },
];

export default function BuyCredits() {
  const t = useTranslations('myaccount');
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(null); // packageId being processed
  const [error, setError] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/credits?userId=${session.user.id}`)
        .then((r) => r.json())
        .then((d) => setCurrentBalance(d.balance ?? 0))
        .catch(() => { });
    }
  }, [session]);

  const handleBuy = async (pkg) => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    setLoading(pkg.id);
    setError(null);
    try {
      const res = await fetch("/api/credits/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.payAddress) {
        throw new Error(data.error || "Failed to create payment.");
      }
      analytics.creditsBuy(pkg.label, pkg.priceUSD);
      // Save payment data in sessionStorage for the checkout page
      sessionStorage.setItem(`payment_${data.orderId}`, JSON.stringify(data));
      // Redirect to internal checkout
      router.push(`/myaccount/credits/checkout/${data.orderId}`);
    } catch (e) {
      setError(e.message);
      setLoading(null);
    }
  };

  return (
    <div className="max-w-[1400px] w-full space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8 bg-gradient-to-r from-orange-500/10 via-background to-yellow-500/10 border-orange-500/20 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
          <span className="text-3xl">₿</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">{t('buyCreditsTitle')}</h1>
        <p className="text-text-muted max-w-lg mb-4 text-sm">
          {t('buyCreditsSubtitle')}
        </p>
        {currentBalance !== null && (
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl">
            <span className="text-text-muted text-sm font-medium">{t('currentBalance')}:</span>
            <span className="text-xl font-bold text-white flex items-center gap-1.5">
              <span className="text-primary text-2xl">⚡</span>
              {currentBalance} {t('credits')}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/20 p-4 flex items-center gap-3">
          <span className="text-red-400 text-xl">⚠️</span>
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Bitcoin payment info */}
      <div className="glass-card bg-orange-500/5 border border-orange-500/15 p-4 flex items-start gap-3">
        <span className="text-orange-400 text-lg mt-0.5">₿</span>
        <div>
          <p className="text-orange-300 text-sm font-semibold">{t('bitcoinPayment')}</p>
          <p className="text-orange-400/60 text-xs mt-0.5">
            {t('bitcoinPaymentDesc')}
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`glass-card p-6 flex flex-col relative transition-all duration-300 hover:scale-[1.02] ${pkg.popular
              ? "border-primary shadow-xl shadow-primary/20 bg-gradient-to-b from-primary/10 to-transparent"
              : "hover:border-white/20"
              }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-primary/30 uppercase tracking-widest whitespace-nowrap">
                {t('mostPopular')}
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white">{pkg.label}</h3>
            </div>

            <div className="text-center mb-4 flex-1 flex flex-col justify-center bg-white/5 mx-[-1.5rem] py-5 border-y border-white/5">
              <div className="text-4xl font-black text-white flex items-center justify-center gap-1">
                <span className="text-primary text-2xl">⚡</span>
                {pkg.credits}
              </div>
              {pkg.bonus && (
                <div className="text-xs text-green-400 font-bold mt-1">+{pkg.bonus} {t('bonus')}</div>
              )}
              <div className="text-2xl font-bold text-orange-400 mt-2">${pkg.priceUSD}</div>
              <div className="text-xs text-white/30 mt-0.5">${(pkg.priceUSD / pkg.credits).toFixed(2)}{t('perCredit')}</div>
            </div>

            <div className="space-y-2 mb-5">
              {pkg.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="text-primary">✓</span>
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleBuy(pkg)}
              disabled={!!loading}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${pkg.popular
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-primary/25 hover:shadow-primary/40"
                : "bg-orange-500/15 border border-orange-500/25 text-orange-300 hover:bg-orange-500/25"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === pkg.id ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('creatingPayment')}
                </>
              ) : (
                <>₿ {t('payWithBitcoin')}</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-orange-500/15 bg-orange-500/5">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <span>₿</span> {t('bitcoinLightning')}
          </h3>
          <p className="text-text-muted text-xs">{t('bitcoinLightningDesc')}</p>
        </div>
        <div className="glass-card p-5 border-green-500/15 bg-green-500/5">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <span>⚡</span> {t('automaticCredits')}
          </h3>
          <p className="text-text-muted text-xs">{t('automaticCreditsDesc')}</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <span>💡</span> {t('howToUseCredits')}
          </h3>
          <ul className="text-text-muted text-xs space-y-1">
            <li>⚡ {t('useBumpUp')}</li>
            <li>✨ {t('useHighlight')}</li>
            <li>🌟 {t('useFeature')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
