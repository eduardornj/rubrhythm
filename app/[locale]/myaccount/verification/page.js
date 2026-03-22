"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { analytics } from "@/lib/analytics";
import { useTranslations } from "next-intl";

import Image from "next/image";

function UploadZone({ id, label, description, file, onFile, required, t }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert(t("alertFileSize")); return; }
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type)) {
      alert(t("alertFileType")); return;
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
            <Image src={preview} alt={t("previewAlt")} fill unoptimized className="object-cover" />
            <div className="absolute bottom-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
              ✓ {t("selected")}
            </div>
          </div>
        ) : (
          <div className="py-8 px-4">
            <div className="text-4xl mb-3">📸</div>
            <p className="text-white font-medium text-sm">{t("tapToUpload")}</p>
            <p className="text-text-muted text-xs mt-1">{t("fileFormats")}</p>
          </div>
        )}
      </label>
    </div>
  );
}

export default function VerificationPage() {
  const t = useTranslations('verification');
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
      setError(t("errorBothPhotos"));
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      if (!session?.user?.id) {
        throw new Error(t("errorSessionExpired"));
      }
      const formData = new FormData();
      formData.append("userId", String(session.user.id));
      formData.append("idDocument", facePhoto);
      formData.append("selfiePhoto", selfiePhoto);

      const res = await fetch("/api/verification/request", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        const errorMsg = d.details ? `${d.error}: ${d.details.join(", ")}` : (d.error || d.message || t("errorSubmissionFailed"));
        throw new Error(errorMsg);
      }

      analytics.verificationSubmitted();
      setSuccess(true);
      await fetchStatus();
    } catch (err) {
      setError(err.message || t("errorGeneric"));
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
        <h1 className="text-2xl font-black text-white">{t("verifiedTitle")}</h1>
        <p className="text-text-muted">{t("verifiedDescription")}</p>
        <div className="glass-card p-4 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 font-semibold">✓ {t("verifiedBadgeActive")}</p>
          <p className="text-text-muted text-sm mt-1">{t("verifiedBadgeDescription")}</p>
        </div>
        <Link href="/myaccount/listings" className="btn-primary inline-block">{t("viewMyListings")}</Link>
      </div>
    );
  }

  // Pending review
  if (verificationData?.verificationRequest?.status === "pending") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">⏳</div>
        <h1 className="text-2xl font-black text-white">{t("pendingTitle")}</h1>
        <p className="text-text-muted">{t.rich("pendingDescription", { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
        <div className="glass-card p-5 border-yellow-500/20 bg-yellow-500/5 text-left">
          <p className="text-yellow-400 font-semibold mb-2">{t("pendingNextTitle")}</p>
          <ul className="space-y-2 text-text-muted text-sm">
            <li>• {t("pendingNext1")}</li>
            <li>• {t("pendingNext2")}</li>
            <li>• {t("pendingNext3")}</li>
          </ul>
        </div>
        <p className="text-text-muted text-xs">
          {t("pendingSubmitted")}: {verificationData.createdAt ? new Date(verificationData.createdAt).toLocaleDateString() : t("pendingRecently")}
        </p>
        <Link href="/myaccount" className="btn-secondary inline-block">{t("backToDashboard")}</Link>
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
        <h1 className="text-2xl font-black text-white">{t("formTitle")}</h1>
        <p className="text-text-muted mt-1">
          {t("formSubtitle")}
        </p>
      </div>

      {/* Rejection notice */}
      {isRejected && verificationData?.rejectionReason && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
          <p className="text-red-400 font-semibold text-sm">❌ {t("rejectedNotice")}</p>
          <p className="text-text-muted text-sm mt-1">{verificationData.rejectionReason}</p>
          <p className="text-text-muted text-xs mt-2">{t("rejectedResubmit")}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card p-5">
        <h2 className="text-white font-bold mb-3">📋 {t("howItWorks")}</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { step: "1", icon: "📸", text: t("step1") },
            { step: "2", icon: "🤳", text: t("step2") },
            { step: "3", icon: "✅", text: t("step3") },
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
            label={t("facePhotoLabel")}
            description={t("facePhotoDescription")}
            file={facePhoto}
            onFile={setFacePhoto}
            required
            t={t}
          />
          <UploadZone
            id="selfiePhoto"
            label={t("selfiePhotoLabel")}
            description={t("selfiePhotoDescription")}
            file={selfiePhoto}
            onFile={setSelfiePhoto}
            required
            t={t}
          />
        </div>

        {error && (
          <div className="glass-card p-4 border-red-500/20 bg-red-500/5 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="glass-card p-4 border-green-500/20 bg-green-500/5 text-green-300 text-sm">
            ✅ {t("successMessage")}
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
              {t("submitting")}
            </span>
          ) : (
            t("submitButton")
          )}
        </button>

        <p className="text-center text-xs text-text-muted">
          {t("disclaimer")}
        </p>
      </form>
    </div>
  );
}