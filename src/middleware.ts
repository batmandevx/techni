import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth', '/login', '/signup', '/api'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow public routes and static files
  if (isPublicRoute || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // For now, allow all routes without strict auth check
  // Auth is handled client-side with localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
