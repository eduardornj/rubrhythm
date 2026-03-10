import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export default auth(async (req: any) => {
  const { pathname } = req.nextUrl

  // Allow access to auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Allow access to public routes and banned user page
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/banned') {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!req.auth) {
    if (pathname.startsWith('/myaccount') || pathname.startsWith('/my-') || pathname.startsWith('/messages')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  // Ban check — isBanned is synced to JWT from DB on every token refresh
  if (req.auth.user?.isBanned) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }
    if (pathname !== '/banned') {
      return NextResponse.redirect(new URL('/banned', req.url))
    }
  }

  return NextResponse.next()
})

// NOTE: Only page routes here — NOT /api/* routes.
// API routes are protected by auth() inside each handler (Node.js runtime).
// Middleware runs in Edge Runtime where Prisma Client cannot execute DB queries.
export const config = {
  matcher: [
    '/myaccount/:path*',
    '/admin/:path*',
    '/my-listings/:path*',
    '/my-account/:path*',
    '/messages/:path*',
    '/favorites/:path*',
    '/add-listing/:path*',
    '/get-verified/:path*',
    '/api/chat/:path*',
    '/api/messages/:path*',
    '/api/favorites/:path*',
    '/api/listing/:path*',
    '/api/user/:path*',
    '/api/notifications/:path*',
    '/api/credits/:path*',
  ],
}