"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GetVerifiedPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) return;
        fetch("/api/user/profile")
            .then(r => r.json())
            .then(data => {
                setUser(data.user || data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [session]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const isVerified = user?.verified === true;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-fade-in">

            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                    <svg className="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Get Verified</h1>
                <p className="text-white/50 text-sm">
                    Verified providers get the green badge, priority in search, and access to Feature Premium.
                </p>
            </div>

            {/* Already verified */}
            {isVerified ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h2 className="text-emerald-400 font-bold text-xl mb-2">You're already verified!</h2>
                    <p className="text-white/50 text-sm mb-4">
                        Your account has the Verified badge. You can now activate Feature Premium on your listings.
                    </p>
                    <Link href="/myaccount/listings" className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold px-6 py-3 rounded-xl hover:bg-emerald-500/30 transition-all">
                        Go to My Listings →
                    </Link>
                </div>
            ) : (
                /* Not yet verified */
                <div className="space-y-4">
                    {/* Status */}
                    <div className="glass-card p-5 border border-white/8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-white font-semibold text-sm">Verification Status: Pending</span>
                        </div>
                        <p className="text-white/50 text-xs">
                            Your identity verification must be approved by an administrator before the badge appears on your profile.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="glass-card p-6">
                        <h2 className="text-white font-bold text-base mb-4">Why get verified?</h2>
                        <ul className="space-y-3">
                            {[
                                { icon: "💎", text: "Access to Feature Premium (priority placement, 63% rotation weight)" },
                                { icon: "✅", text: "Green Verified badge on all your listing cards" },
                                { icon: "🔝", text: "Higher trust with clients — verified profiles get 2x more views" },
                                { icon: "📈", text: "Priority in search results over unverified listings" },
                            ].map((b, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-lg flex-shrink-0">{b.icon}</span>
                                    <span className="text-white/70 text-sm leading-relaxed">{b.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* How it works */}
                    <div className="glass-card p-6">
                        <h2 className="text-white font-bold text-base mb-4">How it works</h2>
                        <ol className="space-y-3">
                            {[
                                "Submit your verification request below",
                                "Our team reviews your identity within 24–48 hours",
                                "You receive an email when your badge is activated",
                                "Feature Premium becomes available in your Boost Hub",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 flex-shrink-0 bg-primary/20 border border-primary/30 text-primary text-xs font-black rounded-full flex items-center justify-center">{i + 1}</span>
                                    <span className="text-white/70 text-sm leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* CTA */}
                    <div className="glass-card p-6 border border-primary/20 bg-primary/5 text-center">
                        <p className="text-white/60 text-sm mb-4">
                            Ready to get verified? Upload your documents for admin review.
                        </p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link
                                href="/myaccount/verification"
                                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                            >
                                Submit Verification Documents →
                            </Link>
                            <Link
                                href="/myaccount"
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-all"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
