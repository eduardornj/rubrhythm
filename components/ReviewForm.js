"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ReviewForm({ listingId, providerId, onSuccess }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!session?.user?.id) {
    return (
      <div className="text-center py-6 text-white/40 text-sm">
        <a href="/login" className="text-primary hover:underline">Sign in</a> to leave a review.
      </div>
    );
  }

  if (session.user.id === providerId) return null;

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-white font-bold">Review submitted!</p>
        <p className="text-white/40 text-sm mt-1">It will appear after admin approval.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reviewerId: session.user.id, rating, comment, isAnonymous }),
      });
      const d = await res.json();
      if (res.ok) { setSubmitted(true); onSuccess?.(); }
      else setError(d.error || "Failed to submit review.");
    } catch {
      setError("Network error.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-white/60 mb-2 block">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className={`text-3xl transition-all ${s <= (hover || rating) ? "text-yellow-400" : "text-white/15"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-white/60 mb-1.5 block">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share your experience..."
          className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${isAnonymous ? "bg-primary" : "bg-white/15"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isAnonymous ? "left-4" : "left-0.5"}`} />
        </div>
        <span className="text-sm text-white/60">Post anonymously</span>
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/30 transition-all disabled:opacity-40"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
