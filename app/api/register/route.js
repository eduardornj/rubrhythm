
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { sendWelcomeEmail, sendReferralBonusEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

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

    await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
        role,
        credits: referrer ? 5 : 0,
        referredBy: referrer ? referralCode : null,
      },
    });

    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: { credits: { increment: 10 } },
      });

      await prisma.notification.create({
        data: {
          id: randomUUID(),
          userId: referrer.id,
          title: 'Indicação realizada!',
          body: 'Você ganhou 10 créditos! Um amigo se cadastrou com seu código.',
          type: 'referral',
        },
      });
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name, role).catch(() => {});

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