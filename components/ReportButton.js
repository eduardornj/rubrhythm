"use client";

import { useState } from "react";

const REPORT_REASONS = [
  "Soliciting illegal services",
  "Suspected human trafficking",
  "Fake or fraudulent profile",
  "Underage individual",
  "Stolen photos / impersonation",
  "Other",
];

export default function ReportButton({ listingId, listingName }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason, details }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors"
        title="Report this listing"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {done ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-white font-bold mb-1">Report Submitted</h3>
                <p className="text-white/50 text-sm mb-4">
                  Thank you. Our team will review this report within 24 hours.
                  If you suspect human trafficking, please also contact the{" "}
                  <a href="https://www.humantraffickinghotline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    National Hotline
                  </a>.
                </p>
                <button
                  onClick={() => { setOpen(false); setDone(false); setReason(""); setDetails(""); }}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/15 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Report Listing</h3>
                  <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
                </div>
                <p className="text-white/50 text-xs mb-4">
                  Reporting: <span className="text-white/70">{listingName}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-primary"
                        />
                        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{r}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Additional details (optional)"
                    rows={2}
                    maxLength={500}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 resize-none"
                  />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 p-2.5 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !reason}
                      className="flex-1 p-2.5 bg-red-500/80 text-white rounded-xl text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-40"
                    >
                      {loading ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
