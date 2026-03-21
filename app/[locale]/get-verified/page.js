"use client";

import { useState, useRef } from "react";
import MainLayout from "@components/MainLayout";
import Link from "next/link";
import { analytics } from "@/lib/analytics";

function PhotoUpload({ id, label, hint, file, onFile }) {
    const ref = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 1 * 1024 * 1024) {
            alert("File must be under 1 MB. Please compress your image first.");
            return;
        }
        if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type)) {
            alert("Only JPEG, PNG or WebP accepted.");
            return;
        }
        setPreview(URL.createObjectURL(f));
        onFile(f);
    };

    return (
        <div>
            <p className="text-white font-medium text-base mb-1">{label}</p>
            {hint && <p className="text-text-muted text-sm mb-3">{hint}</p>}
            <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" id={id} className="hidden" onChange={handleChange} />
            <label
                htmlFor={id}
                className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${file ? "border-primary/50 bg-primary/5" : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5"
                    }`}
            >
                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                        <div className="absolute bottom-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">✓ Selected</div>
                    </div>
                ) : (
                    <div className="py-8 text-center px-4">
                        <div className="text-3xl mb-2">📎</div>
                        <p className="text-white text-base font-medium">Tap to upload</p>
                        <p className="text-text-muted text-sm mt-1">JPEG · PNG · WebP · max 1 MB</p>
                    </div>
                )}
            </label>
        </div>
    );
}

export default function GetVerifiedPage() {
    const [form, setForm] = useState({ fullName: "", socialLink: "" });
    const [idFile, setIdFile] = useState(null);
    const [selfieFile, setSelfieFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idFile) { setError("Please upload your State ID or Passport."); return; }
        if (!form.fullName.trim()) { setError("Please enter your full legal name."); return; }

        setSubmitting(true);
        setError("");

        try {
            const data = new FormData();
            data.append("fullName", form.fullName.trim());
            data.append("socialLink", form.socialLink.trim());
            data.append("idDocument", idFile);
            if (selfieFile) data.append("selfiePhoto", selfieFile);

            const res = await fetch("/api/public-verification", { method: "POST", body: data });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Submission failed");
            analytics.verificationSubmitted();
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <MainLayout>
                <div className="max-w-lg mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
                        <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-white mb-3">Verification Submitted!</h1>
                    <p className="text-text-muted text-base mb-6">
                        Your verification request has been received. Our team will review it within <strong className="text-white">1-3 business days</strong>. You will be notified by email once your badge is activated.
                    </p>
                    <div className="glass-card p-5 mb-6 text-left space-y-2.5">
                        <p className="text-text-muted text-base flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            ID document uploaded securely
                        </p>
                        <p className="text-text-muted text-base flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Submitted for manual staff review
                        </p>
                        <p className="text-text-muted text-base flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Documents are confidential — staff access only
                        </p>
                    </div>
                    <Link href="/" className="btn-primary inline-block">Back to RubRhythm</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-3">Get Verified</h1>
                    <p className="text-text-muted text-base max-w-lg mx-auto">
                        Add a <strong className="text-white">blue verified badge</strong> to your profile to build trust with clients. Verification is <strong className="text-white">completely free</strong> and significantly increases your visibility and credibility.
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        {
                            text: "Verified Badge",
                            desc: "Blue checkmark on your profile",
                            icon: (
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ),
                        },
                        {
                            text: "Higher Ranking",
                            desc: "Priority in search results",
                            icon: (
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            ),
                        },
                        {
                            text: "More Clients",
                            desc: "Increased trust and contact",
                            icon: (
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ),
                        },
                    ].map((b) => (
                        <div key={b.text} className="glass-card p-4 text-center">
                            <div className="flex justify-center mb-2">{b.icon}</div>
                            <p className="text-white font-bold text-sm">{b.text}</p>
                            <p className="text-text-muted text-xs mt-0.5">{b.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Important Notice */}
                <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 mb-8">
                    <p className="text-amber-400 font-bold text-base mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Before you submit — read this
                    </p>
                    <ul className="space-y-2 text-text-muted text-base">
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            You may <strong className="text-white">black out your address</strong> on your ID — it will not be recorded
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Your <strong className="text-white">full name and date of birth must be visible</strong> for age verification
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Your documents are reviewed by <strong className="text-white">authorized staff only</strong> — never shared publicly
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Verification is entirely <strong className="text-white">free and optional</strong> — you can use RubRhythm without it
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            You must be at least <strong className="text-white">18 years old</strong> to submit
                        </li>
                    </ul>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="text-white font-medium text-base block mb-1.5">
                            Full Legal Name <span className="text-red-400">*</span>
                        </label>
                        <p className="text-text-muted text-sm mb-2">Must match the name on your ID exactly.</p>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => updateForm("fullName", e.target.value)}
                            placeholder="Jane Smith"
                            required
                            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>

                    {/* ID Upload */}
                    <PhotoUpload
                        id="idDocument"
                        label="State ID or Passport *"
                        hint="You may black out your address. Your name and birthday must be visible. Max 1 MB."
                        file={idFile}
                        onFile={setIdFile}
                    />

                    {/* Optional Selfie */}
                    <PhotoUpload
                        id="selfiePhoto"
                        label="Selfie with ID (optional but recommended)"
                        hint='Hold your ID next to your face. No paper with "RubRhythm" needed here — just a clear selfie.'
                        file={selfieFile}
                        onFile={setSelfieFile}
                    />

                    {/* Social Media */}
                    <div>
                        <label className="text-white font-medium text-base block mb-1.5">
                            Social Media Link <span className="text-text-muted font-normal">(optional)</span>
                        </label>
                        <p className="text-text-muted text-sm mb-2">
                            A link to your public social profile (Instagram, Twitter/X, etc.) helps confirm your identity faster.
                        </p>
                        <input
                            type="url"
                            value={form.socialLink}
                            onChange={(e) => updateForm("socialLink", e.target.value)}
                            placeholder="https://instagram.com/yourprofile"
                            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="glass-card p-4 border-red-500/20 bg-red-500/5 text-red-300 text-base flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !idFile || !form.fullName.trim()}
                        className="w-full btn-primary py-4 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </span>
                        ) : (
                            "Submit for Verification — Free"
                        )}
                    </button>

                    <p className="text-center text-sm text-text-muted">
                        By submitting, you confirm you are 18+ and that all information is authentic.
                        False submissions result in permanent account suspension.{" "}
                        <Link href="/info/terms" className="text-primary hover:underline">Terms</Link>
                        {" · "}
                        <Link href="/info/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                </form>

                {/* Already have an account? */}
                <div className="mt-8 glass-card p-5 text-center border-primary/20 bg-primary/5">
                    <p className="text-text-muted text-base">
                        Already have a RubRhythm account?{" "}
                        <Link href="/myaccount/verification" className="text-primary font-bold hover:underline">
                            Verify from your dashboard
                        </Link>
                    </p>
                </div>

                {/* Footer Nav */}
                <div className="mt-10 flex flex-wrap gap-3 justify-center">
                    {[
                        { label: "FAQ", href: "/info/faq" },
                        { label: "Anti-Scam Guide", href: "/info/anti-scam" },
                        { label: "Privacy Policy", href: "/info/privacy-policy" },
                        { label: "Get Help", href: "/info/get-help-from-staff" },
                    ].map((l) => (
                        <Link key={l.href} href={l.href} className="text-text-muted hover:text-primary text-xs border border-white/10 px-3 py-1.5 rounded-full hover:border-primary/30 transition-all">
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
