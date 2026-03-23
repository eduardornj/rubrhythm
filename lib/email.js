import { Resend } from "resend";
import crypto from "crypto";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "RubRhythm <noreply@rubrhythm.com>";
const SITE = process.env.NEXTAUTH_URL || "https://rubrhythm.com";

// send() now accepts optional text (plain text) and headers
async function send(to, subject, html, text = "", extraHeaders = {}) {
  if (!resend) {
    console.warn("[Email] No RESEND_API_KEY configured, skipping email to:", to);
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: text || undefined, // Resend auto-generates from HTML if omitted
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(), // prevents duplicate threading
        ...extraHeaders,
      },
    });
    if (error) console.error("[Email] Send error:", error);
    return data;
  } catch (e) {
    console.error("[Email] Failed:", e);
    return null;
  }
}

// ── Shared layout ───────────────────────────────────────────
function layout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#e11d48,#9333ea);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
          <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px">RubRhythm</span>
          <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:4px 0 0">Premium Body Rub Directory</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px">
          ${content}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 20px">
          <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.5">
            You received this email because you have an account at <a href="${SITE}" style="color:#e11d48;text-decoration:none">rubrhythm.com</a>.<br>
            If you have questions, contact us at <a href="mailto:support@rubrhythm.com" style="color:#e11d48;text-decoration:none">support@rubrhythm.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href, text) {
  return `<a href="${href}" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#e11d48,#9333ea);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:8px 0">${text} &rarr;</a>`;
}

// Marketing emails need List-Unsubscribe headers (Gmail/Yahoo requirement)
const marketingHeaders = {
  "List-Unsubscribe": `<mailto:unsubscribe@rubrhythm.com>, <${SITE}/unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
};

// ── Templates ──────────────────────────────────────────────

export async function sendWelcomeEmail(to, name, role) {
  const isProvider = role === "provider";
  const link = `${SITE}/${isProvider ? "myaccount/listings/add-listing" : "united-states"}`;
  const cta = isProvider ? "Create Your Listing" : "Browse Providers";
  return send(
    to,
    `Welcome to RubRhythm, ${name}!`,
    layout(`
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px">Welcome, ${name}!</h1>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">
        Your RubRhythm account is ready.
        ${isProvider
          ? "Start by creating your first listing to reach clients in your area."
          : "Browse verified providers near you and find the perfect match."}
      </p>
      <div style="text-align:center;padding:20px;background:#fdf2f8;border:1px solid #fbcfe8;border-radius:10px;margin:0 0 20px">
        <p style="color:#e11d48;font-size:28px;font-weight:900;margin:0">${isProvider ? "$50" : "$5"}</p>
        <p style="color:#be185d;font-size:14px;font-weight:600;margin:4px 0 0">Free welcome credits added to your account</p>
      </div>
      <p>${btn(link, cta)}</p>
      ${isProvider ? `
      <div style="margin-top:20px;padding:16px 20px;background:#fdf2f8;border-left:4px solid #e11d48;border-radius:0 8px 8px 0">
        <p style="color:#9f1239;font-weight:700;font-size:13px;margin:0 0 6px">Quick Start</p>
        <p style="color:#881337;font-size:13px;margin:0;line-height:1.6">
          1. Create a listing (10 credits) &rarr; 2. Get Verified (free) &rarr; 3. Boost visibility
        </p>
      </div>` : ""}
    `),
    `Welcome to RubRhythm, ${name}!\n\nYou received ${isProvider ? "$50" : "$5"} in free welcome credits!\n\n${isProvider
      ? "Your account is ready. Start by creating your first listing to reach clients in your area."
      : "Your account is ready. Browse verified providers near you."}\n\n${cta}: ${link}\n\nQuestions? Email support@rubrhythm.com\n${SITE}`
  );
}

export async function sendReviewNotificationEmail(to, providerName, listingTitle, rating) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return send(
    to,
    `New ${rating}-Star Review on "${listingTitle}"`,
    layout(`
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px">New Review Received!</h1>
      <p style="color:#374151;font-size:15px;margin:0 0 20px">
        Hey ${providerName}, someone just left a review on your listing.
      </p>
      <div style="text-align:center;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;margin:0 0 20px">
        <p style="color:#e11d48;font-size:30px;margin:0;letter-spacing:4px">${stars}</p>
        <p style="color:#111827;font-size:18px;font-weight:700;margin:8px 0 4px">${rating}/5 Stars</p>
        <p style="color:#6b7280;font-size:13px;margin:0">on &ldquo;${listingTitle}&rdquo;</p>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0 0 20px">
        This review is pending admin approval. Once approved, it will be visible on your listing.
      </p>
      <p>${btn(`${SITE}/myaccount/reviews`, "View My Reviews")}</p>
    `),
    `New ${rating}-Star Review on "${listingTitle}"\n\nHey ${providerName},\n\nSomeone just left a ${rating}/5 star review (${stars}) on your listing "${listingTitle}".\n\nThis review is pending admin approval. Once approved, it will be visible on your listing.\n\nView your reviews: ${SITE}/myaccount/reviews\n\n${SITE}`
  );
}

export async function sendVerificationApprovedEmail(to, name) {
  return send(
    to,
    "You're Verified on RubRhythm!",
    layout(`
      <div style="text-align:center;margin:0 0 20px">
        <span style="font-size:52px">&#x2705;</span>
      </div>
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px;text-align:center">You're Verified!</h1>
      <p style="color:#374151;font-size:15px;text-align:center;margin:0 0 24px">
        Congratulations ${name}! Your identity has been verified. Your listing now shows a blue verification badge.
      </p>
      <div style="padding:16px 20px;background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;margin:0 0 24px">
        <p style="color:#1d4ed8;font-weight:700;font-size:13px;margin:0 0 8px">What this means:</p>
        <ul style="color:#1e40af;font-size:13px;margin:0;padding:0 0 0 18px;line-height:1.8">
          <li>Blue verified badge on your listing</li>
          <li>Higher trust score with clients</li>
          <li>Access to Premium Featured tier</li>
        </ul>
      </div>
      <p style="text-align:center">${btn(`${SITE}/myaccount`, "Go to Dashboard")}</p>
    `),
    `You're Verified on RubRhythm!\n\nCongratulations ${name}!\n\nYour identity has been verified. Your listing now shows a blue verification badge.\n\nWhat this means:\n- Blue verified badge on your listing\n- Higher trust score with clients\n- Access to Premium Featured tier\n\nGo to your dashboard: ${SITE}/myaccount\n\n${SITE}`
  );
}

export async function sendCreditsConfirmedEmail(to, name, credits, amountUSD) {
  return send(
    to,
    `${credits} Credits Added to Your Account`,
    layout(`
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px">Payment Confirmed!</h1>
      <p style="color:#374151;font-size:15px;margin:0 0 20px">
        Hey ${name}, your payment has been confirmed.
      </p>
      <div style="text-align:center;padding:24px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin:0 0 24px">
        <p style="color:#16a34a;font-size:42px;font-weight:900;margin:0">${credits}</p>
        <p style="color:#15803d;font-size:14px;font-weight:600;margin:4px 0 0">credits added &mdash; $${amountUSD} USD</p>
      </div>
      <p>${btn(`${SITE}/myaccount/credits`, "View Balance")}</p>
    `),
    `Payment Confirmed!\n\nHey ${name},\n\nYour payment of $${amountUSD} USD has been confirmed. ${credits} credits have been added to your account.\n\nView your balance: ${SITE}/myaccount/credits\n\n${SITE}`
  );
}

export async function sendExpirationWarningEmail(to, name, listingTitle, featureType, expiresAt) {
  const dateStr = new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return send(
    to,
    `Your ${featureType} expires on ${dateStr}`,
    layout(`
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px">Expiring Soon</h1>
      <p style="color:#374151;font-size:15px;margin:0 0 16px">
        Hey ${name}, your <strong>${featureType}</strong> on &ldquo;${listingTitle}&rdquo; expires on <strong>${dateStr}</strong>.
      </p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
        Renew now to keep your visibility and avoid losing your position.
      </p>
      <p>${btn(`${SITE}/myaccount/listings`, "Renew Now")}</p>
    `),
    `Expiring Soon\n\nHey ${name},\n\nYour ${featureType} on "${listingTitle}" expires on ${dateStr}.\n\nRenew now to keep your visibility: ${SITE}/myaccount/listings\n\n${SITE}`,
    marketingHeaders
  );
}

export async function sendPasswordResetEmail(to, resetUrl) {
  return send(
    to,
    "Reset your RubRhythm password",
    layout(`
      <div style="text-align:center;margin:0 0 20px">
        <span style="font-size:52px">&#x1F511;</span>
      </div>
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px;text-align:center">Reset Your Password</h1>
      <p style="color:#374151;font-size:15px;text-align:center;margin:0 0 24px">
        We received a request to reset your RubRhythm password. Click the button below to set a new one.
        This link expires in <strong>1 hour</strong>.
      </p>
      <p style="text-align:center">${btn(resetUrl, "Reset Password")}</p>
      <p style="color:#9ca3af;font-size:12px;margin:20px 0 0;text-align:center">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
    `),
    `Reset your RubRhythm password\n\nWe received a request to reset your password. Click the link below to set a new one. This link expires in 1 hour.\n\nReset your password: ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email. Your password won't change.\n\n${SITE}`
  );
}

export async function sendNoAccountEmail(to) {
  return send(
    to,
    "RubRhythm password reset - no account found",
    layout(`
      <div style="text-align:center;margin:0 0 20px">
        <span style="font-size:52px">&#x1F4EC;</span>
      </div>
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px;text-align:center">No Account Found</h1>
      <p style="color:#374151;font-size:15px;text-align:center;margin:0 0 16px">
        We received a password reset request for this email address, but there's no RubRhythm account associated with it.
      </p>
      <p style="color:#374151;font-size:15px;text-align:center;margin:0 0 24px">
        Want to join? Create a free account and start connecting with clients.
      </p>
      <p style="text-align:center">${btn(`${SITE}/register-on-rubrhythm`, "Create a Free Account")}</p>
      <p style="color:#9ca3af;font-size:12px;margin:20px 0 0;text-align:center">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
    `RubRhythm - No Account Found\n\nWe received a password reset request for this email, but there's no RubRhythm account associated with it.\n\nWant to join? Create a free account: ${SITE}/register-on-rubrhythm\n\nIf you didn't request this, you can safely ignore this email.\n\n${SITE}`
  );
}

export async function sendReferralBonusEmail(to, name, credits) {
  return send(
    to,
    `You earned ${credits} credits from a referral!`,
    layout(`
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px">Referral Bonus!</h1>
      <p style="color:#374151;font-size:15px;margin:0 0 20px">
        Hey ${name}, someone signed up using your referral code. You earned <strong style="color:#e11d48">${credits} credits</strong>!
      </p>
      <p>${btn(`${SITE}/myaccount/referral`, "View Referrals")}</p>
    `),
    `Referral Bonus!\n\nHey ${name},\n\nSomeone signed up using your referral code. You earned ${credits} credits!\n\nView your referrals: ${SITE}/myaccount/referral\n\n${SITE}`,
    marketingHeaders
  );
}
