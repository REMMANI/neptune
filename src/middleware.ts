import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes with authentication
  if (pathname.startsWith('/admin')) {
    // Allow login and unauthorized pages
    if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {      
      return NextResponse.next();
    }

    // Check for admin session
    const sessionId = request.cookies.get('admin-session')?.value;
    if (!sessionId) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // For admin API routes, we'll check permissions in the route handlers
    return NextResponse.next();
  }

  // Handle tenant resolution from subdomain
  const url = request.nextUrl;
  const tenantFromQuery = url.searchParams.get('tenant');
  if (tenantFromQuery) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') || '';
  const sub = host.split(':')[0].split('.')[0];

  // Extract subdomain for tenant resolution
  if (sub && sub !== 'localhost' && sub !== 'www' && sub !== '127') {
    url.searchParams.set('tenant', sub);
    return NextResponse.rewrite(url);
  }

  // Handle locale routing
  const locales = ['en', 'fr', 'es', 'ar'];
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale and not an API route
  if (pathnameIsMissingLocale && !pathname.startsWith('/api')) {
    const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en';
    const supportedLocale = locales.includes(locale) ? locale : 'en';

    return NextResponse.redirect(
      new URL(`/${supportedLocale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  // Add headers for tenant resolution
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};