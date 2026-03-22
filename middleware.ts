import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

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

  // ---- API auth checks (no i18n needed) ----
  if (pathname.startsWith('/api/auth')) {
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
