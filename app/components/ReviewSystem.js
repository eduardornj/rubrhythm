"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ReviewSystem({ listingId, listingOwnerId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    isAnonymous: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?listingId=${listingId}&status=approved`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!session) {
      setError("Please login to submit a review");
      return;
    }

    if (session.user.id === listingOwnerId) {
      setError("You cannot review your own listing");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          reviewerId: session.user.id,
          ...newReview,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Review submitted successfully! It will be visible after approval.");
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: "", isAnonymous: true });
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-all duration-200 ${
              star <= rating ? "text-yellow-400" : "text-gray-400"
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-dark-gray p-6 rounded-lg">
        <p className="text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-gray p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-text flex items-center">
          <svg className="w-6 h-6 text-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Reviews ({reviews.length})
        </h3>
        {session && session.user.id !== listingOwnerId && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors duration-200"
          >
            Write Review
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mb-4">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-700/50 p-6 rounded-lg mb-6">
          <h4 className="text-lg font-semibold text-text mb-4">Write a Review</h4>
          
          <div className="mb-4">
            <label className="block text-text mb-2">Rating</label>
            {renderStars(newReview.rating, true, (rating) => 
              setNewReview({ ...newReview, rating })
            )}
          </div>

          <div className="mb-4">
            <label className="block text-text mb-2">Comment (Optional)</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full p-3 bg-gray-600 text-text rounded-lg border border-gray-500 focus:border-primary focus:outline-none"
              rows="4"
              placeholder="Share your experience..."
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center text-text">
              <input
                type="checkbox"
                checked={newReview.isAnonymous}
                onChange={(e) => setNewReview({ ...newReview, isAnonymous: e.target.checked })}
                className="mr-2"
              />
              Post anonymously
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors duration-200 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <p className="text-gray-400 text-lg">No reviews yet</p>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">
                      {review.reviewer.name ? review.reviewer.name.charAt(0).toUpperCase() : "A"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-text font-medium mr-2">
                        {review.reviewer.name || "Anonymous User"}
                      </span>
                      {review.isVerified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="text-gray-400 text-sm ml-2">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-300 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}