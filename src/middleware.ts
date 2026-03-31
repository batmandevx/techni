import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Validate environment variables
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const secretKey = process.env.CLERK_SECRET_KEY

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/health'
])

// Check if Clerk is properly configured
const isClerkConfigured = publishableKey?.startsWith('pk_') && secretKey?.startsWith('sk_')

export default clerkMiddleware(async (auth, req) => {
  // If Clerk is not configured, allow all requests (dev mode fallback)
  if (!isClerkConfigured) {
    console.warn('[Middleware] Clerk not configured, skipping auth check')
    return NextResponse.next()
  }

  try {
    const { userId, redirectToSignIn } = await auth()
    const { pathname } = req.nextUrl

    // If signed in and hitting /auth, redirect to /main
    if (userId && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/main', req.url))
    }

    // Protect all non-public routes
    if (!isPublicRoute(req) && !userId) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }
  } catch (error) {
    console.error('[Middleware] Auth error:', error)
    // Return a proper error response instead of crashing
    return new NextResponse(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
