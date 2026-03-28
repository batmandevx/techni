import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/auth(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/upload',
  '/api/analytics(.*)',
  '/api/master-data(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Allow all public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  // Allow all routes for now (auth is optional)
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
