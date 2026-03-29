import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logActivity } from '@/lib/activity';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, limit: 60 }); // 60 events per minute max

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { success } = limiter.check(session.user.id);
    if (!success) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await request.json();
    const { action, path, target, metadata } = body;

    if (!action) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const allowed = [
      'page_view', 'listing_view', 'search', 'listing_start',
      'phone_unlock', 'whatsapp_click', 'telegram_click',
      'favorite_add', 'favorite_remove',
    ];

    if (!allowed.includes(action)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    logActivity(session.user.id, action, {
      path,
      target,
      metadata,
      request,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
