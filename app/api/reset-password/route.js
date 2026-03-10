import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Find token
    const record = await prisma.verificationtoken.findUnique({
      where: { identifier_token: { identifier: `reset:${email.toLowerCase().trim()}`, token } },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (new Date() > record.expires) {
      await prisma.verificationtoken.delete({ where: { identifier_token: { identifier: record.identifier, token } } });
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Update password
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: hashed },
    });

    // Delete used token
    await prisma.verificationtoken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
