"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const AUTO_BUMP_COST = 5;

function formatHour(hour) {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

export default function AutoBumpPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(0);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (session?.user?.id) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listingsRes, creditsRes] = await Promise.all([
        fetch("/api/listing/auto-bump"),
        fetch(`/api/credits?userId=${session.user.id}`),
      ]);

      if (!listingsRes.ok || !creditsRes.ok)
        throw new Error("Failed to fetch data");

      const listingsData = await listingsRes.json();
      const creditsData = await creditsRes.json();

      setListings(listingsData.listings || []);
      setCredits(creditsData.balance || 0);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (listingId, enabled, hour) => {
    setProcessing(listingId);
    try {
      const res = await fetch("/api/listing/auto-bump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, enabled, hour }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update auto-bump");
      }

      const data = await res.json();

      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? {
                ...l,
                autoBumpEnabled: enabled,
                autoBumpHour: hour,
                ...data.listing,
              }
            : l
        )
      );

      if (data.balance !== undefined) {
        setCredits(data.balance);
      }
    } catch (err) {
      console.error("Error toggling auto-bump:", err);
      setError(err.message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setProcessing(null);
    }
  };

  const handleHourChange = async (listingId, hour) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, autoBumpHour: parseInt(hour) } : l
      )
    );

    if (listing.autoBumpEnabled) {
      await handleToggle(listingId, true, parseInt(hour));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-4" />
        <p className="text-text-muted animate-pulse">
          Loading auto-bump settings...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/myaccount/credits"
              className="text-text-muted hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Auto-Bump
            </h1>
          </div>
          <p className="text-text-muted text-sm sm:text-base">
            Automatically bump your listings daily at a scheduled time
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          <span className="text-white font-bold text-lg">{credits}</span>
          <span className="text-text-muted text-sm">credits</span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-amber-400 font-semibold text-sm">
            Automatic Daily Charge
          </h3>
          <p className="text-amber-400/80 text-sm mt-1 leading-relaxed">
            Auto-bump charges{" "}
            <span className="font-bold text-amber-300">
              {AUTO_BUMP_COST} credits per listing per day
            </span>
            . It renews automatically until you turn it off. Make sure you have
            enough credits.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-4 mx-auto">
            <svg
              className="w-8 h-8 text-text-muted/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No listings found
          </h3>
          <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
            You need at least one approved listing to use auto-bump.
          </p>
          <Link
            href="/myaccount/listings/add-listing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all"
          >
            Create a Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const isEnabled = listing.autoBumpEnabled;
            const isProcessing = processing === listing.id;
            const currentHour = listing.autoBumpHour ?? 9;

            return (
              <div
                key={listing.id}
                className={`bg-white/5 border rounded-2xl p-6 transition-all ${
                  isEnabled
                    ? "border-primary/30 bg-primary/5"
                    : "border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Listing info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {listing.name || listing.title || "Untitled Listing"}
                    </h3>
                    <p className="text-text-muted text-sm mt-1">
                      {listing.city}
                      {listing.state ? `, ${listing.state}` : ""}
                    </p>
                    {isEnabled && listing.lastAutoBump && (
                      <p className="text-text-muted/70 text-xs mt-2 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Last bumped:{" "}
                        {new Date(listing.lastAutoBump).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    {/* Hour selector */}
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-text-muted text-xs">
                        Bump at
                      </label>
                      <select
                        value={currentHour}
                        onChange={(e) =>
                          handleHourChange(listing.id, e.target.value)
                        }
                        disabled={isProcessing}
                        className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 8px center",
                          backgroundSize: "16px",
                          paddingRight: "32px",
                        }}
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i} className="bg-[#1a1c29]">
                            {formatHour(i)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cost */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-text-muted text-xs">Cost</span>
                      <span className="text-white font-semibold text-sm">
                        {AUTO_BUMP_COST} credits/day
                      </span>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() =>
                        handleToggle(listing.id, !isEnabled, currentHour)
                      }
                      disabled={isProcessing}
                      className="relative flex-shrink-0"
                      aria-label={`${isEnabled ? "Disable" : "Enable"} auto-bump for ${listing.name || listing.title}`}
                    >
                      <div
                        className={`w-14 h-8 rounded-full transition-all duration-300 ${
                          isEnabled
                            ? "bg-gradient-to-r from-primary to-accent"
                            : "bg-white/10"
                        } ${isProcessing ? "opacity-50" : ""}`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                            isEnabled ? "left-7" : "left-1"
                          }`}
                        >
                          {isProcessing && (
                            <div className="w-full h-full rounded-full border-2 border-transparent border-t-primary animate-spin" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info footer */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          How Auto-Bump Works
        </h3>
        <ul className="text-sm text-text-muted space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">1.</span>
            <span>
              Choose the time of day you want each listing to be bumped.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">2.</span>
            <span>
              Toggle the switch to enable. Your listing will be bumped
              automatically every day at the selected hour.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">3.</span>
            <span>
              {AUTO_BUMP_COST} credits are deducted each day per listing. If you
              run out of credits, auto-bump pauses until you top up.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">4.</span>
            <span>
              Turn it off anytime. No long-term commitment, cancel with one
              click.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
