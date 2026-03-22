"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MainLayout from "@components/MainLayout";
import { signIn } from "next-auth/react";
import { useRouter, Link } from "@/i18n/navigation";
import { analytics } from "@/lib/analytics";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('login');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(t('invalidCredentials'));
      setIsLoading(false);
    } else {
      analytics.login();
      router.push("/myaccount");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />
        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/4 border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/20">
                <span className="text-white text-2xl">💆</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-1">{t('title')}</h1>
              <p className="text-text-muted text-sm">{t('subtitle')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-white/80 text-sm font-medium">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder={t('emailPlaceholder')}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm font-medium">{t('password')}</label>
                  <Link href="/forgot-password" className="text-primary hover:text-accent text-xs transition-colors">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
                    placeholder={t('passwordPlaceholder')}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors text-xs font-medium"
                  >
                    {showPassword ? t('hidePassword') : t('showPassword')}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('signingIn')}
                  </span>
                ) : (
                  <>{t('signIn')} &rarr;</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-muted text-sm">
                {t('noAccount')}{" "}
                <Link href="/register-on-rubrhythm" className="text-primary hover:text-accent transition-colors font-semibold">
                  {t('createAccount')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}