"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import Image from "next/image";

function UploadZone({ id, label, description, file, onFile, required }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert("File must be under 10MB"); return; }
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type)) {
      alert("Only JPEG, PNG or WebP images allowed"); return;
    }
    setPreview(URL.createObjectURL(f));
    onFile(f);
  };

  return (
    <div>
      <p className="text-white font-medium text-sm mb-2">{label}</p>
      <p className="text-text-muted text-xs mb-3">{description}</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" id={id} onChange={handleChange} required={required} />
      <label
        htmlFor={id}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all text-center overflow-hidden h-48 relative ${file ? "border-primary/50 bg-primary/5" : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5"
          }`}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
            <div className="absolute bottom-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
              ✓ Selected
            </div>
          </div>
        ) : (
          <div className="py-8 px-4">
            <div className="text-4xl mb-3">📸</div>
            <p className="text-white font-medium text-sm">Tap to upload photo</p>
            <p className="text-text-muted text-xs mt-1">JPEG, PNG or WebP · max 10MB</p>
          </div>
        )}
      </label>
    </div>
  );
}

export default function VerificationPage() {
  const { data: session } = useSession();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [facePhoto, setFacePhoto] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/verification?userId=${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationData(data);
      }
    } catch { }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) fetchStatus();
  }, [session?.user?.id, fetchStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facePhoto || !selfiePhoto) {
      setError("Please upload both photos before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("userId", session.user.id);
      formData.append("idDocument", facePhoto);
      formData.append("selfiePhoto", selfiePhoto);

      const res = await fetch("/api/verification/request", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        const errorMsg = d.details ? `${d.error}: ${d.details.join(", ")}` : (d.error || d.message || "Submission failed");
        throw new Error(errorMsg);
      }

      setSuccess(true);
      await fetchStatus();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Already verified — read from user.verified field (fresh DB read), NOT stale session JWT
  if (verificationData?.user?.verified === true || verificationData?.verificationRequest?.status === "approved") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">✅</div>
        <h1 className="text-2xl font-black text-white">You're Verified!</h1>
        <p className="text-text-muted">Your Verified badge is active. Verified providers receive significantly more contact requests and access to Feature Premium.</p>
        <div className="glass-card p-4 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 font-semibold">✓ Verified Badge Active</p>
          <p className="text-text-muted text-sm mt-1">Your green badge appears on all your listings</p>
        </div>
        <Link href="/myaccount/listings" className="btn-primary inline-block">View My Listings</Link>
      </div>
    );
  }

  // Pending review
  if (verificationData?.verificationRequest?.status === "pending") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">⏳</div>
        <h1 className="text-2xl font-black text-white">Under Review</h1>
        <p className="text-text-muted">Your documents have been submitted and are being reviewed. This takes <strong className="text-white">1–3 business days</strong>.</p>
        <div className="glass-card p-5 border-yellow-500/20 bg-yellow-500/5 text-left">
          <p className="text-yellow-400 font-semibold mb-2">What happens next?</p>
          <ul className="space-y-2 text-text-muted text-sm">
            <li>• Our team will review your submitted photos</li>
            <li>• You'll receive a notification when approved</li>
            <li>• If rejected, we'll explain why so you can resubmit</li>
          </ul>
        </div>
        <p className="text-text-muted text-xs">
          Submitted: {verificationData.createdAt ? new Date(verificationData.createdAt).toLocaleDateString() : "Recently"}
        </p>
        <Link href="/myaccount" className="btn-secondary inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  // Rejected — can resubmit
  const isRejected = verificationData?.verificationRequest?.status === "rejected";
  const rejectionReason = verificationData?.verificationRequest?.rejectionReason;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-4">🔵</div>
        <h1 className="text-2xl font-black text-white">Get Verified</h1>
        <p className="text-text-muted mt-1">
          Submit your photos for a manual review (1–3 business days)
        </p>
      </div>

      {/* Rejection notice */}
      {isRejected && verificationData?.rejectionReason && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
          <p className="text-red-400 font-semibold text-sm">❌ Previous submission rejected</p>
          <p className="text-text-muted text-sm mt-1">{verificationData.rejectionReason}</p>
          <p className="text-text-muted text-xs mt-2">Please resubmit with the correct photos.</p>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card p-5">
        <h2 className="text-white font-bold mb-3">📋 How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { step: "1", icon: "📸", text: "Upload a clear face photo" },
            { step: "2", icon: "🤳", text: 'Selfie holding paper with "RubRhythm" + today\'s date' },
            { step: "3", icon: "✅", text: "Our team reviews in 1–3 days" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-2">
              <span className="w-7 h-7 bg-primary text-white rounded-full text-xs font-black flex items-center justify-center">{s.step}</span>
              <span className="text-2xl">{s.icon}</span>
              <p className="text-text-muted text-xs">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <UploadZone
            id="facePhoto"
            label="1. Clear Face Photo"
            description="A recent, clear photo of your face. No filters."
            file={facePhoto}
            onFile={setFacePhoto}
            required
          />
          <UploadZone
            id="selfiePhoto"
            label='2. Selfie with "RubRhythm" Paper'
            description={'Hold a paper with "RubRhythm" and today\'s date written on it.'}
            file={selfiePhoto}
            onFile={setSelfiePhoto}
            required
          />
        </div>

        {error && (
          <div className="glass-card p-4 border-red-500/20 bg-red-500/5 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="glass-card p-4 border-green-500/20 bg-green-500/5 text-green-300 text-sm">
            ✅ Submitted! We'll review within 1–3 business days.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !facePhoto || !selfiePhoto}
          className="w-full btn-primary py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit for Verification (Free)"
          )}
        </button>

        <p className="text-center text-xs text-text-muted">
          By submitting, you confirm that all photos are authentic and belong to you.
          Any false documents will result in permanent account suspension.
        </p>
      </form>
    </div>
  );
}