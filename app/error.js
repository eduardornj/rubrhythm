"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-black text-red-500/80">500</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
