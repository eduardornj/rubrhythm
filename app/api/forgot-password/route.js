import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail, sendNoAccountEmail } from "@/lib/email";

const SITE = process.env.NEXTAUTH_URL || "https://rubrhythm.com";

// Rate limit: 3 requests per IP per hour: 3 requests per IP per hour (in-memory, resets on cold start)
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count <= 3;
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Send "no account" email and return success — never reveal via HTTP response if email exists
    if (!user) {
      await sendNoAccountEmail(email.toLowerCase().trim());
      return NextResponse.json({ success: true });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this email
    await prisma.verificationtoken.deleteMany({ where: { identifier: `reset:${user.email}` } });

    // Save token
    await prisma.verificationtoken.create({
      data: { identifier: `reset:${user.email}`, token, expires },
    });

    // Send email
    const resetUrl = `${SITE}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
