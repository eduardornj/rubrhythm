import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// ── Bot blocker ────────────────────────────────────────────────────────────

// SEO/GEO scrapers and abusive clients we block. AI crawlers (GPTBot, CCBot,
// ClaudeBot, anthropic-ai, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
// Google-Extended) are intentionally NOT blocked, robots.txt + llms.txt invite
// them and that's the GEO strategy. Bytespider stays blocked because it isn't
// on the robots.txt allowlist.
const BLOCKED_BOTS = /AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|BLEXBot|DataForSeoBot|serpstatbot|Bytespider|Scrapy|python-requests|Go-http-client|Java\/|curl\/|wget\//i

// NOTE: previous in-memory `Map` based per-IP rate limit was removed. It did
// nothing useful in serverless: each cold start, each region and each
// concurrent instance had its own Map, and `setInterval` does not run reliably
// in lambda. It only gave a false sense of security. Vercel's built-in DDoS
// protection covers the basic case. If/when real per-IP limiting is needed,
// wire Upstash Redis or Vercel KV here, not an in-process Map.

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

  // ---- Block aggressive scrapers (not Google/Bing/AI crawlers) ----
  if (BLOCKED_BOTS.test(ua)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // NOTE: empty/short user-agent check was removed. It blocked legitimate link
  // unfurlers (WhatsApp, iMessage, Slack, Discord) which often send short or
  // missing UAs, killing rich link previews when the site is shared. The
  // BLOCKED_BOTS regex above already catches the actually-malicious cases
  // (curl, wget, python-requests, Go-http-client, Java).

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
