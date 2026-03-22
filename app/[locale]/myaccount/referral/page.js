"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ReferralPage() {
  const t = useTranslations('myaccount');
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const referralUrl = data?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register-on-rubrhythm?ref=${data.referralCode}`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent("Join RubRhythm and get 5 bonus credits! " + referralUrl)}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent("Hey! Join RubRhythm and get 5 bonus credits: " + referralUrl)}`,
      "_blank"
    );
  };

  const shareEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent("Join RubRhythm")}&body=${encodeURIComponent("Hey! Sign up on RubRhythm and get 5 bonus credits: " + referralUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-6 bg-gradient-to-r from-accent/10 via-background to-primary/10 border-accent/20">
        <h1 className="text-xl font-black text-white mb-1">{t('referralTitle')}</h1>
        <p className="text-text-muted text-sm">
          {t('referralSubtitle')}
        </p>
      </div>

      {/* How it works */}
      <div className="glass-card p-5">
        <h2 className="text-white font-semibold mb-4">{t('referralHowItWorks')}</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: "1", title: t('referralStepShare'), desc: t('referralStepShareDesc') },
            { step: "2", title: t('referralStepSignUp'), desc: t('referralStepSignUpDesc') },
            { step: "3", title: t('referralStepEarn'), desc: t('referralStepEarnDesc') },
          ].map(item => (
            <div key={item.step} className="text-center p-4 bg-white/3 rounded-xl border border-white/6">
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-sm">
                {item.step}
              </div>
              <p className="text-white font-bold text-sm">{item.title}</p>
              <p className="text-white/40 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your code + share */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="text-white font-semibold">{t('referralYourCode')}</h2>
        {!data ? (
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-white font-bold tracking-widest text-lg">
                {data.referralCode}
              </div>
            </div>

            {/* URL + Copy */}
            <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <span className="flex-1 text-xs text-white/40 truncate">{referralUrl}</span>
              <button
                onClick={copy}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                }`}
              >
                {copied ? t('referralCopied') : t('referralCopyLink')}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <p className="text-white/30 text-xs mr-1">{t('referralShareVia')}</p>
              <button
                onClick={shareTwitter}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all"
              >
                Twitter/X
              </button>
              <button
                onClick={shareWhatsApp}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
              >
                WhatsApp
              </button>
              <button
                onClick={shareEmail}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-all"
              >
                Email
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2">
              <div className="glass-card p-4 flex-1 text-center bg-accent/5 border-accent/20">
                <p className="text-2xl font-black text-white">{data.referralCount}</p>
                <p className="text-xs text-text-muted mt-1">{t('referralReferrals')}</p>
              </div>
              <div className="glass-card p-4 flex-1 text-center bg-primary/5 border-primary/20">
                <p className="text-2xl font-black text-white">{data.referralCount * data.bonusPerReferral}</p>
                <p className="text-xs text-text-muted mt-1">{t('referralCreditsEarned')}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
