"use client";
import { useState } from "react";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#08080d" }}>
      <div className="w-full max-w-md">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-1">Forgot Password</h1>
            <p className="text-white/40 text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          {status === "done" ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-400 font-semibold mb-1">Check your email</p>
              <p className="text-white/50 text-sm">If an account exists for <strong className="text-white/70">{email}</strong>, you'll receive a reset link shortly.</p>
              <Link href="/auth/signin" className="block mt-4 text-sm text-primary hover:underline">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #e11d48, #f59e0b)" }}
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-white/30 text-sm">
                Remember your password?{" "}
                <Link href="/auth/signin" className="text-primary hover:underline">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
