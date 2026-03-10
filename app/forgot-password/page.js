"use client";
import { useState } from "react";
import Link from "next/link";
import MainLayout from "@components/MainLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("done");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />
        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/4 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/20">
                <span className="text-white text-2xl">🔑</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-1">Forgot Password</h1>
              <p className="text-text-muted text-sm">Enter your email and we'll send you a reset link.</p>
            </div>

            {status === "done" ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <p className="text-green-400 font-bold mb-2">Check your email</p>
                <p className="text-white/50 text-sm mb-4">
                  If an account exists for <strong className="text-white/70">{email}</strong>, you'll receive a reset link shortly.
                </p>
                <Link href="/login" className="text-primary hover:text-accent text-sm transition-colors font-semibold">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-white/80 text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full p-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link →"
                  )}
                </button>

                <div className="text-center">
                  <p className="text-text-muted text-sm">
                    Remember your password?{" "}
                    <Link href="/login" className="text-primary hover:text-accent transition-colors font-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
