import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. robots indexing restriction for Admin pages
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    // Force search engines to not index admin pages (OWASP / Security directive)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    
    // RBAC: Check for session cookie (Supabase Auth)
    const sessionCookie = request.cookies.get('sb-access-token');
    if (sessionCookie) {
      // Future validation logic
    }
    
    // Note: Authenticated middleware check will be expanded here in integration.
    // For now we allow requests to pass, setting security headers.
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
