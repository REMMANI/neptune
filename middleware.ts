import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, isValidLocale } from './src/lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Extract potential locale from pathname
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];

  // Check if pathname already has a valid locale
  if (maybeLocale && isValidLocale(maybeLocale)) {
    // Valid locale found, add headers and continue
    const response = NextResponse.next();

    // Add tenant resolution headers
    response.headers.set('x-pathname', pathname);
    response.headers.set('x-locale', maybeLocale);

    // Add dealer ID from X-Dealer-ID header or host-based resolution
    const dealerHeader = request.headers.get('x-dealer-id');
    if (dealerHeader) {
      response.headers.set('x-dealer-id', dealerHeader);
    }

    return response;
  }

  // No valid locale found in pathname, redirect to default locale
  const newPathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;

  // Preserve query parameters
  const url = request.nextUrl.clone();
  url.pathname = newPathname;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     * - Assets with file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};