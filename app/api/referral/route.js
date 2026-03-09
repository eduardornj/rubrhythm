import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

// GET - get current user's referral code (generate if missing)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, referralCode: true } });

  if (!user.referralCode) {
    const code = session.user.name?.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') + randomUUID().substring(0, 6).toUpperCase();
    user = await prisma.user.update({ where: { id: session.user.id }, data: { referralCode: code }, select: { id: true, referralCode: true } });
  }

  const referralCount = await prisma.user.count({ where: { referredBy: user.referralCode } });

  return NextResponse.json({ referralCode: user.referralCode, referralCount, bonusPerReferral: 10 });
}
