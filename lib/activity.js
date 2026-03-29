import prisma from '@/lib/prisma';

/**
 * Log a user activity to the database.
 * Non-blocking, fire-and-forget. Never throws.
 *
 * @param {string} userId
 * @param {string} action - page_view | listing_view | search | listing_start | listing_create | listing_edit | phone_unlock | whatsapp_click | telegram_click | favorite_add | favorite_remove | chat_start | message_send | credits_buy | verification_submit | login | register | profile_edit | report_submit
 * @param {object} opts
 * @param {string} [opts.path] - page path e.g. /en/listing/abc123
 * @param {string} [opts.target] - target ID e.g. listing ID, search query
 * @param {object} [opts.metadata] - extra context: city, state, referrer, utm, etc.
 * @param {Request} [opts.request] - Next.js request object (extracts IP + user agent)
 */
export function logActivity(userId, action, opts = {}) {
  if (!userId || !action) return;

  const { path, target, metadata, request } = opts;

  let ipAddress = null;
  let userAgent = null;

  if (request) {
    const forwarded = request.headers?.get?.('x-forwarded-for');
    ipAddress = forwarded ? forwarded.split(',')[0].trim() : null;
    userAgent = request.headers?.get?.('user-agent') || null;
  }

  prisma.activitylog.create({
    data: {
      userId,
      action,
      path: path || null,
      target: target || null,
      metadata: metadata || undefined,
      ipAddress,
      userAgent,
    },
  }).catch((err) => {
    console.error('[Activity] Failed to log:', err.message);
  });
}

/**
 * Helper to extract IP from request
 */
export function getClientIP(request) {
  const forwarded = request.headers?.get?.('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}
