import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// ── Bot blocker + rate limiter ──────────────────────────────────────────────

// SEO/GEO scrapers and abusive clients we block. AI crawlers (GPTBot, CCBot,
// ClaudeBot, anthropic-ai, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
// Google-Extended) are intentionally NOT blocked, robots.txt + llms.txt invite
// them and that's the GEO strategy. Bytespider stays blocked because it isn't
// on the robots.txt allowlist.
const BLOCKED_BOTS = /AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|BLEXBot|DataForSeoBot|serpstatbot|Bytespider|Scrapy|python-requests|Go-http-client|Java\/|curl\/|wget\//i

// In-memory rate limit: IP -> { count, resetAt }
const ipHits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60        // max requests per window
const RATE_WINDOW = 60_000   // 1 minute

// Cleanup stale entries every 5 min
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of ipHits) {
    if (now > data.resetAt) ipHits.delete(ip)
  }
}, 5 * 60_000)

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

function blockResponse() {
  return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } })
}

// Paths that should skip i18n locale routing entirely
function shouldSkipIntl(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/myaccount-api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.') // static files
  )
}

// Strip locale prefix from pathname for auth checks
function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || '/'
    }
  }
  return pathname
}

// Auth-protected path patterns (without locale prefix)
function isProtectedPath(cleanPathname: string): boolean {
  return (
    cleanPathname.startsWith('/myaccount') ||
    cleanPathname.startsWith('/my-listings') ||
    cleanPathname.startsWith('/my-account') ||
    cleanPathname.startsWith('/messages') ||
    cleanPathname.startsWith('/favorites') ||
    cleanPathname.startsWith('/add-listing') ||
    cleanPathname.startsWith('/get-verified')
  )
}

// API paths that need auth
function isProtectedApiPath(pathname: string): boolean {
  // /api/listing/* is PUBLIC (anyone can view listings)
  // Only protect write operations
  if (pathname.startsWith('/api/listing/view')) return false
  if (pathname.startsWith('/api/listing') && !pathname.includes('/api/listings')) return false
  if (pathname.startsWith('/api/listings/similar')) return false
  if (pathname.startsWith('/api/listings/recent')) return false
  if (pathname.startsWith('/api/listings') && pathname.includes('featured=true')) return false
  if (pathname.startsWith('/api/cities')) return false
  if (pathname.startsWith('/api/reviews') && !pathname.includes('POST')) return false

  return (
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/messages') ||
    pathname.startsWith('/api/favorites') ||
    pathname.startsWith('/api/user') ||
    pathname.startsWith('/api/notifications') ||
    pathname.startsWith('/api/credits')
  )
}

export default auth(async (req: any) => {
  const { pathname } = req.nextUrl
  const ua = req.headers.get('user-agent') || ''
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // ---- Block aggressive scrapers (not Google/Bing) ----
  if (BLOCKED_BOTS.test(ua)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ---- Block empty user-agent (headless scrapers) ----
  if (!ua || ua.length < 10) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ---- Rate limit per IP (60 req/min) ----
  if (isRateLimited(ip)) {
    return blockResponse()
  }

  // ---- API auth checks (no i18n needed) ----
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // ---- Admin API routes require admin role (defense-in-depth) ----
  if (pathname.startsWith('/api/admin')) {
    if (!req.auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (req.auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.next()
  }

  if (isProtectedApiPath(pathname)) {
    if (!req.auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (req.auth.user?.isBanned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }
    return NextResponse.next()
  }

  // ---- Skip i18n for admin, api, static files ----
  if (shouldSkipIntl(pathname)) {
    return NextResponse.next()
  }

  // ---- Run i18n middleware for locale routing ----
  const intlResponse = intlMiddleware(req)

  // Get the clean pathname (without locale prefix) for auth checks
  const cleanPathname = stripLocale(pathname)

  // ---- Auth checks on protected page routes ----
  if (isProtectedPath(cleanPathname)) {
    if (!req.auth) {
      // Determine the locale to redirect to the correct login page
      const locale = pathname.startsWith('/es') ? 'es' : 'en'
      const loginPath = locale === 'en' ? '/login' : `/${locale}/login`
      return NextResponse.redirect(new URL(loginPath, req.url))
    }

    if (req.auth.user?.isBanned) {
      const locale = pathname.startsWith('/es') ? 'es' : 'en'
      const bannedPath = locale === 'en' ? '/banned' : `/${locale}/banned`
      if (cleanPathname !== '/banned') {
        return NextResponse.redirect(new URL(bannedPath, req.url))
      }
    }
  }

  // ---- Ban check for authenticated users on any page ----
  if (req.auth?.user?.isBanned && cleanPathname !== '/banned') {
    const locale = pathname.startsWith('/es') ? 'es' : 'en'
    const bannedPath = locale === 'en' ? '/banned' : `/${locale}/banned`
    return NextResponse.redirect(new URL(bannedPath, req.url))
  }

  return intlResponse
})

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
}
