import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Runtime configuration - use Node.js instead of Edge for better compatibility
export const runtime = 'nodejs'

// Public routes that don't require authentication
const PUBLIC_PATHS = ['/', '/auth', '/sign-in', '/sign-up', '/api/webhook', '/api/health']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
}

// Check if Clerk is configured
const hasClerkKey = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  process.env.CLERK_SECRET_KEY?.startsWith('sk_')
)

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // If Clerk is not configured, allow all requests (demo mode)
  if (!hasClerkKey) {
    console.log('[Middleware] Demo mode - allowing:', pathname)
    return NextResponse.next()
  }

  // Clerk is configured - use auth protection
  try {
    const { auth } = await import('@clerk/nextjs/server')
    const { userId } = await auth()

    if (!userId) {
      // Redirect to auth page
      return NextResponse.redirect(new URL('/auth?mode=sign-in', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('[Middleware] Auth error:', err)
    // On error, allow through to prevent 500
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
