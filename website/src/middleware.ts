import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Enable/disable password protection (set to 'false' to disable)
const ENABLE_PASSWORD_PROTECTION = process.env.ENABLE_PASSWORD_PROTECTION !== 'false';

// Password for development access
const DEV_PASSWORD = process.env.DEV_ACCESS_PASSWORD || 'dev2024';

export function middleware(request: NextRequest) {
  // Skip all protection if disabled
  if (!ENABLE_PASSWORD_PROTECTION) {
    return NextResponse.next();
  }

  // Skip middleware for API routes and health check
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip middleware for the access page itself and static assets
  if (
    request.nextUrl.pathname === '/dev-access' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if user has access cookie
  const accessToken = request.cookies.get('dev_access');
  
  if (accessToken?.value === DEV_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to access page if no valid access token
  return NextResponse.redirect(new URL('/dev-access', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
