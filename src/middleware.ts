import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Admin Security Headers ───
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // ─── 2. API Routes: Skip i18n, add security headers ───
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // ─── 3. Public routes: Apply i18n ───
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except static files
    '/((?!_next|api/webhooks|favicon.ico|logo.jpg|robots.txt|sitemap.xml|.*\\..*).*)',
    '/admin/:path*',
    '/api/:path*',
  ],
};
