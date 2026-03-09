"use client";

import { useState, useEffect } from "react";
import MainLayout from "@components/MainLayout";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const RoleCard = ({ role, selected, onSelect, icon, title, description, perks }) => (
  <button
    type="button"
    onClick={() => onSelect(role)}
    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${selected
        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      }`}
  >
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl transition-all ${selected ? "bg-primary/20" : "bg-white/10"
        }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-bold">{title}</h3>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-primary bg-primary" : "border-white/30"
            }`}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <p className="text-text-muted text-sm mb-3">{description}</p>
        <ul className="space-y-1">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-xs text-text-muted">
              <span className="text-primary">✓</span>
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </button>
);

export default function RegisterOnRubrhythm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Must be selected
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captcha, setCaptcha] = useState({ a: 0, b: 0 });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
    // Generate simple math captcha
    setCaptcha({ a: Math.floor(Math.random() * 10) + 1, b: Math.floor(Math.random() * 10) + 1 });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!role) {
      setError("Please select your account type before continuing.");
      return;
    }

    if (parseInt(captchaAnswer) !== captcha.a + captcha.b) {
      setError("Incorrect answer. Please solve the math problem.");
      setCaptcha({ a: Math.floor(Math.random() * 10) + 1, b: Math.floor(Math.random() * 10) + 1 });
      setCaptchaAnswer("");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, ...(referralCode && { referralCode }) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />

        <div className="relative w-full max-w-lg">
          <div className="backdrop-blur-xl bg-white/4 border border-white/10 rounded-3xl p-8 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/20">
                <span className="text-white text-2xl">💆</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-1">Join RubRhythm</h1>
              <p className="text-text-muted text-sm">Create your account to get started</p>
            </div>

            {referralCode && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-accent text-sm flex items-center gap-2 mb-4">
                <span className="text-lg">🎁</span>
                <span>You were referred! Sign up to get <strong>5 bonus credits</strong> free.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Alerts */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm flex items-start gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-300 text-sm flex items-start gap-2">
                  <span>✅</span> {success}
                </div>
              )}

              {/* STEP 1: Account Type */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full text-xs font-black mr-2">1</span>
                  I am a...
                </p>
                <div className="space-y-3">
                  <RoleCard
                    role="provider"
                    selected={role === "provider"}
                    onSelect={setRole}
                    icon="💆"
                    title="Massage Provider"
                    description="I offer massage and body rub services"
                    perks={[
                      "Create listings in any city",
                      "Get verified with a Blue Badge",
                      "Buy credits to boost visibility",
                    ]}
                  />
                  <RoleCard
                    role="user"
                    selected={role === "user"}
                    onSelect={setRole}
                    icon="🔍"
                    title="Client"
                    description="I'm looking for massage services"
                    perks={[
                      "Browse verified providers",
                      "Save favorite profiles",
                      "Chat anonymously",
                    ]}
                  />
                </div>
              </div>

              {/* STEP 2: Personal Info */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full text-xs font-black mr-2">2</span>
                  Your details
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                    placeholder="Full name"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                      placeholder="Create a password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors text-sm"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Anti-bot check */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full text-xs font-black mr-2">3</span>
                  Quick check
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm font-mono">
                    {captcha.a} + {captcha.b} =
                  </span>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-20 p-3 bg-white/5 border border-white/10 rounded-xl text-white text-center focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                    placeholder="?"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !role}
                className="w-full p-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>

              {/* Terms */}
              <p className="text-center text-xs text-text-muted">
                By registering you agree to our{" "}
                <Link href="/info/terms" className="text-primary hover:underline">Terms of Service</Link>
              </p>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-text-muted text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-accent transition-colors font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}