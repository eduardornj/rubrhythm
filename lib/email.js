import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "RubRhythm <noreply@rubrhythm.com>";
const SITE = process.env.NEXTAUTH_URL || "https://rubrhythm.com";

async function send(to, subject, html) {
  if (!resend) {
    console.warn("[Email] No RESEND_API_KEY configured, skipping email to:", to);
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[Email] Send error:", error);
    return data;
  } catch (e) {
    console.error("[Email] Failed:", e);
    return null;
  }
}

// ── Templates ──────────────────────────────────────────────

export async function sendWelcomeEmail(to, name, role) {
  const isProvider = role === "provider";
  return send(to, "Welcome to RubRhythm!", `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <h1 style="color:#fff;font-size:24px;margin:0 0 8px">Welcome, ${name}!</h1>
      <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px">
        Your RubRhythm account is ready. ${isProvider
          ? "Start by creating your first listing to reach clients in your area."
          : "Browse verified providers near you and find the perfect match."}
      </p>
      <a href="${SITE}/${isProvider ? "myaccount/listings/add-listing" : "united-states"}"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        ${isProvider ? "Create Your Listing" : "Browse Providers"} &rarr;
      </a>
      ${isProvider ? `
      <div style="margin-top:24px;padding:16px;background:#1a1a2e;border-radius:12px;border:1px solid #333">
        <p style="color:#f59e0b;font-weight:700;font-size:13px;margin:0 0 4px">Quick Start</p>
        <p style="color:#888;font-size:12px;margin:0;line-height:1.5">
          1. Create a listing &rarr; 2. Get Verified (free) &rarr; 3. Buy credits to boost visibility
        </p>
      </div>` : ""}
      <p style="color:#555;font-size:11px;margin:32px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}

export async function sendReviewNotificationEmail(to, providerName, listingTitle, rating) {
  const stars = "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);
  return send(to, `New ${rating}-Star Review on "${listingTitle}"`, `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <h1 style="color:#fff;font-size:20px;margin:0 0 8px">New Review Received!</h1>
      <p style="color:#aaa;font-size:14px;margin:0 0 16px">
        Hey ${providerName}, someone just left a review on your listing.
      </p>
      <div style="text-align:center;padding:20px;background:#1a1a2e;border-radius:12px;border:1px solid #333;margin:0 0 20px">
        <p style="color:#f59e0b;font-size:28px;margin:0;letter-spacing:4px">${stars}</p>
        <p style="color:#fff;font-size:16px;font-weight:700;margin:8px 0 4px">${rating}/5 Stars</p>
        <p style="color:#888;font-size:12px;margin:0">on "${listingTitle}"</p>
      </div>
      <p style="color:#888;font-size:13px;margin:0 0 20px">
        This review is pending admin approval. Once approved, it will be visible on your listing.
      </p>
      <a href="${SITE}/myaccount/reviews"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        View My Reviews &rarr;
      </a>
      <p style="color:#555;font-size:11px;margin:32px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}

export async function sendVerificationApprovedEmail(to, name) {
  return send(to, "Verification Approved! You're Now Verified", `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <div style="text-align:center;margin:0 0 20px">
        <span style="font-size:48px">&#x2714;&#xFE0F;</span>
      </div>
      <h1 style="color:#fff;font-size:22px;margin:0 0 8px;text-align:center">You're Verified!</h1>
      <p style="color:#aaa;font-size:14px;text-align:center;margin:0 0 24px">
        Congratulations ${name}, your identity has been verified. Your listing now shows a blue verification badge.
      </p>
      <div style="padding:16px;background:#1a1a2e;border-radius:12px;border:1px solid #3b82f6;margin:0 0 20px">
        <p style="color:#3b82f6;font-weight:700;font-size:13px;margin:0 0 4px">What this means:</p>
        <ul style="color:#888;font-size:12px;margin:0;padding:0 0 0 16px;line-height:1.8">
          <li>Blue verified badge on your listing</li>
          <li>Higher trust score with clients</li>
          <li>Access to Premium Featured tier</li>
        </ul>
      </div>
      <a href="${SITE}/myaccount"
         style="display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        Go to Dashboard &rarr;
      </a>
      <p style="color:#555;font-size:11px;margin:32px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}

export async function sendCreditsConfirmedEmail(to, name, credits, amountUSD) {
  return send(to, `${credits} Credits Added to Your Account`, `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <h1 style="color:#fff;font-size:22px;margin:0 0 8px">Payment Confirmed!</h1>
      <p style="color:#aaa;font-size:14px;margin:0 0 20px">
        Hey ${name}, your Bitcoin payment has been confirmed.
      </p>
      <div style="text-align:center;padding:20px;background:#1a1a2e;border-radius:12px;border:1px solid #22c55e;margin:0 0 20px">
        <p style="color:#22c55e;font-size:36px;font-weight:900;margin:0">${credits}</p>
        <p style="color:#888;font-size:13px;margin:4px 0 0">credits added ($${amountUSD} USD)</p>
      </div>
      <a href="${SITE}/myaccount/credits"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        View Balance &rarr;
      </a>
      <p style="color:#555;font-size:11px;margin:32px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}

export async function sendExpirationWarningEmail(to, name, listingTitle, featureType, expiresAt) {
  const dateStr = new Date(expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return send(to, `Your ${featureType} expires on ${dateStr}`, `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <h1 style="color:#fff;font-size:22px;margin:0 0 8px">Expiring Soon!</h1>
      <p style="color:#aaa;font-size:14px;margin:0 0 20px">
        Hey ${name}, your <strong style="color:#f59e0b">${featureType}</strong> on "${listingTitle}" expires on <strong style="color:#fff">${dateStr}</strong>.
      </p>
      <p style="color:#888;font-size:13px;margin:0 0 20px">
        Renew now to keep your visibility and avoid losing your position.
      </p>
      <a href="${SITE}/myaccount/listings"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        Renew Now &rarr;
      </a>
      <p style="color:#555;font-size:11px;margin:32px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}

export async function sendPasswordResetEmail(to, resetUrl) {
  return send(to, "Reset your RubRhythm password", `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <div style="text-align:center;margin:0 0 20px">
        <span style="font-size:48px">&#x1F510;</span>
      </div>
      <h1 style="color:#fff;font-size:22px;margin:0 0 8px;text-align:center">Reset Your Password</h1>
      <p style="color:#aaa;font-size:14px;margin:0 0 24px;text-align:center">
        You requested a password reset for your RubRhythm account. Click the button below to set a new password. This link expires in <strong style="color:#fff">1 hour</strong>.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        Reset Password &rarr;
      </a>
      <p style="color:#666;font-size:12px;margin:24px 0 0">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
      <p style="color:#555;font-size:11px;margin:16px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}

export async function sendReferralBonusEmail(to, name, credits) {
  return send(to, `You earned ${credits} credits from a referral!`, `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:16px">
      <h1 style="color:#fff;font-size:22px;margin:0 0 8px">Referral Bonus!</h1>
      <p style="color:#aaa;font-size:14px;margin:0 0 20px">
        Hey ${name}, someone signed up using your referral code. You earned <strong style="color:#f59e0b">${credits} credits</strong>!
      </p>
      <a href="${SITE}/myaccount/referral"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">
        View Referrals &rarr;
      </a>
      <p style="color:#555;font-size:11px;margin:32px 0 0;border-top:1px solid #222;padding-top:16px">
        RubRhythm &mdash; Premium Body Rub Directory
      </p>
    </div>
  `);
}
