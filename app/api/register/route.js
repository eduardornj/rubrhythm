
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { sendWelcomeEmail, sendReferralBonusEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import { alertNewUser } from '@/lib/telegram';

const limiter = rateLimit({ interval: 60_000 * 15, limit: 5 }); // 5 registrations per 15 min

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { success } = limiter.check(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, password, role, referralCode } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // SECURITY: Enforce password complexity
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const validRoles = ["user", "provider"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findFirst({ where: { referralCode }, select: { id: true } });
    }

    // Welcome bonus: providers get $50, clients get $5
    const welcomeBonus = role === "provider" ? 50 : 5;
    const referralBonus = referrer ? 5 : 0;
    const initialCredits = welcomeBonus + referralBonus;

    const newUserId = randomUUID();
    await prisma.user.create({
      data: {
        id: newUserId,
        name,
        email,
        password: hashedPassword,
        role,
        credits: initialCredits,
        referredBy: referrer ? referralCode : null,
      },
    });

    // Create creditbalance + welcome bonus transaction
    await prisma.creditbalance.create({
      data: { id: `cb_${Date.now()}_new`, userId: newUserId, balance: initialCredits },
    }).catch(() => {});

    await prisma.credittransaction.create({
      data: {
        id: randomUUID(),
        userId: newUserId,
        amount: welcomeBonus,
        type: "WELCOME_BONUS",
        description: `Welcome bonus: $${welcomeBonus} credits (${role === "provider" ? "provider" : "client"})`,
      },
    }).catch(() => {});

    // Welcome bonus notification (so the user SEES they got credits)
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: newUserId,
        title: role === "provider"
          ? "Welcome! You received $50 in free credits"
          : "Welcome! You received $5 in free credits",
        body: role === "provider"
          ? "Your $50 welcome bonus is ready to use. Create your first listing for just 10 credits and start connecting with clients today."
          : "Your $5 welcome bonus is ready. Use it to message verified providers on RubRhythm.",
        type: "success",
        isRead: false,
      },
    }).catch(() => {});

    // Referral system
    if (referrer) {
      // Log referral bonus for new user
      await prisma.credittransaction.create({
        data: {
          id: randomUUID(),
          userId: newUserId,
          amount: 5,
          type: "REFERRAL_BONUS",
          description: "Referral signup bonus: +5 credits",
        },
      }).catch(() => {});

      // Reward referrer
      await prisma.user.update({
        where: { id: referrer.id },
        data: { credits: { increment: 10 } },
      });

      await prisma.creditbalance.upsert({
        where: { userId: referrer.id },
        update: { balance: { increment: 10 } },
        create: { userId: referrer.id, balance: 10, id: `cb_${Date.now()}_ref` },
      });

      await prisma.credittransaction.create({
        data: {
          id: randomUUID(),
          userId: referrer.id,
          amount: 10,
          type: "REFERRAL_BONUS",
          description: `Referral reward: ${name} signed up with your code`,
        },
      }).catch(() => {});

      await prisma.notification.create({
        data: {
          id: randomUUID(),
          userId: referrer.id,
          title: 'Indicacao realizada!',
          body: 'Voce ganhou 10 creditos! Um amigo se cadastrou com seu codigo.',
          type: 'referral',
        },
      });
    }

    // Send welcome email + Telegram alert (non-blocking)
    sendWelcomeEmail(email, name, role).catch(() => {});
    alertNewUser(name, email, role);

    // If referral, email the referrer too
    if (referrer) {
      const referrerData = await prisma.user.findUnique({ where: { id: referrer.id }, select: { email: true, name: true } });
      if (referrerData?.email) {
        sendReferralBonusEmail(referrerData.email, referrerData.name || "Friend", 10).catch(() => {});
      }
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error.message, error.stack);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}