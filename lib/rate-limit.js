/**
 * In-memory rate limiter for Next.js App Router API routes.
 * Uses a Map with automatic cleanup to prevent memory leaks.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rate-limit';
 *   const limiter = rateLimit({ interval: 60_000, limit: 5 });
 *
 *   // Inside your route handler:
 *   const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
 *   const { success } = limiter.check(ip);
 *   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

const limiters = new Map();

export function rateLimit({ interval = 60_000, limit = 10 } = {}) {
  const tokens = new Map();

  // Cleanup expired entries every interval
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tokens) {
      if (now - entry.timestamp > interval) {
        tokens.delete(key);
      }
    }
  }, interval);

  // Prevent the interval from keeping Node.js alive
  if (cleanup.unref) cleanup.unref();

  return {
    check(key) {
      const now = Date.now();
      const entry = tokens.get(key);

      if (!entry || now - entry.timestamp > interval) {
        tokens.set(key, { count: 1, timestamp: now });
        return { success: true, remaining: limit - 1 };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 };
      }

      entry.count++;
      return { success: true, remaining: limit - entry.count };
    },
  };
}
