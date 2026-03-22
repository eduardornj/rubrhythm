"use client";
import { useState, useEffect } from "react";

const STARS = (n) => "★".repeat(n) + "☆".repeat(5 - n);

function StatBox({ label, value, sub, color = "text-white" }) {
  return (
    <div className="glass-card p-5 text-center">
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-white/50 text-sm mt-1">{label}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function MyReviewsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch("/api/reviews/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, response: replyText.trim() }),
      });
      if (res.ok) {
        // Update the review in local state
        setData((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId
              ? { ...r, providerResponse: replyText.trim(), providerRespondedAt: new Date().toISOString() }
              : r
          ),
        }));
        setReplyingTo(null);
        setReplyText("");
      }
    } catch {}
    setReplySending(false);
  };

  useEffect(() => {
    fetch("/myaccount-api/reviews")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 glass-card rounded-2xl bg-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 glass-card rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="h-60 glass-card rounded-2xl bg-white/5" />
      </div>
    );
  }

  const stats = data?.stats || { total: 0, approved: 0, pending: 0, averageRating: 0 };
  const reviews = data?.reviews || [];
  const listings = data?.listings || [];

  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  // Rating bar chart data
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews
    .filter((r) => r.status === "approved")
    .forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++;
    });
  const maxCount = Math.max(...ratingCounts, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">My Reviews</h1>
        <p className="text-white/40 text-sm mt-0.5">
          See what clients are saying about your services
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          label="Average Rating"
          value={stats.averageRating > 0 ? `${stats.averageRating}/5` : "--"}
          sub={stats.approved > 0 ? `Based on ${stats.approved} approved` : "No approved reviews yet"}
          color="text-yellow-400"
        />
        <StatBox label="Total Reviews" value={stats.total} color="text-white" />
        <StatBox
          label="Approved"
          value={stats.approved}
          sub="Visible to clients"
          color="text-green-400"
        />
        <StatBox
          label="Pending"
          value={stats.pending}
          sub="Awaiting admin approval"
          color="text-yellow-400"
        />
      </div>

      {/* Rating Breakdown */}
      {stats.approved > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star - 1];
              const pct = stats.approved > 0 ? (count / stats.approved) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-yellow-400 text-xs w-12 text-right font-mono">
                    {star} {star === 1 ? "star" : "stars"}
                  </span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs w-8 text-right font-mono">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-white/3 p-1 rounded-xl">
          {[
            { key: "all", label: "All" },
            { key: "approved", label: "Approved" },
            { key: "pending", label: "Pending" },
            { key: "rejected", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-white/30 text-xs">
          {filtered.length} review{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-30">
            {stats.total === 0 ? "★" : "📋"}
          </div>
          <p className="text-white/40 text-sm">
            {stats.total === 0
              ? "No reviews yet. Share your listing to get your first review!"
              : `No ${filter} reviews.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`glass-card p-4 border-l-2 ${
                r.status === "approved"
                  ? "border-l-green-500"
                  : r.status === "pending"
                  ? "border-l-yellow-500"
                  : "border-l-red-500/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Stars + Status */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-yellow-400 text-sm tracking-wider">
                      {STARS(r.rating)}
                    </span>
                    <span className="text-white/30 text-xs">{r.rating}/5</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.status === "approved"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : r.status === "pending"
                          ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                          : "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      {r.status === "approved"
                        ? "Visible"
                        : r.status === "pending"
                        ? "Pending"
                        : "Rejected"}
                    </span>
                  </div>

                  {/* Comment */}
                  {r.comment && (
                    <p className="text-white/70 text-sm mb-2 leading-relaxed">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
                    <span>
                      By:{" "}
                      {r.isAnonymous
                        ? "Anonymous"
                        : r.user_review_reviewerIdTouser?.name || "Unknown"}
                    </span>
                    {r.listing?.title && <span>On: {r.listing.title}</span>}
                    {r.createdAt && (
                      <span>
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Provider Response */}
                  {r.providerResponse && (
                    <div className="mt-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                      <p className="text-[10px] font-bold text-primary mb-1">Your Response:</p>
                      <p className="text-white/60 text-xs leading-relaxed">{r.providerResponse}</p>
                    </div>
                  )}

                  {/* Reply Button / Form */}
                  {r.status === "approved" && !r.providerResponse && (
                    replyingTo === r.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your response to this review..."
                          maxLength={1000}
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 resize-none"
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReply(r.id)}
                            disabled={replySending || !replyText.trim()}
                            className="px-4 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30 hover:bg-primary/30 transition-all disabled:opacity-40"
                          >
                            {replySending ? "Sending..." : "Submit Response"}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="px-3 py-1.5 text-white/40 text-xs hover:text-white/60 transition-all"
                          >
                            Cancel
                          </button>
                          <span className="text-white/20 text-[10px] ml-auto">{replyText.length}/1000</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(r.id)}
                        className="mt-2 text-xs text-primary/60 hover:text-primary transition-all"
                      >
                        Reply to this review
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Per-listing breakdown */}
      {listings.length > 1 && stats.total > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">
            Reviews by Listing
          </h3>
          <div className="space-y-2">
            {listings
              .filter((l) => l.totalReviews > 0)
              .sort((a, b) => b.totalReviews - a.totalReviews)
              .map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">
                      {l.title}
                    </p>
                    <p className="text-white/30 text-xs">
                      {l.city}, {l.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-yellow-400 text-xs font-bold">
                      {l.averageRating
                        ? `${l.averageRating.toFixed(1)}/5`
                        : "--"}
                    </span>
                    <span className="text-white/30 text-xs">
                      {l.totalReviews} review{l.totalReviews !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
