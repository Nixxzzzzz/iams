import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './security/session';
import { AUTH_DEFAULTS } from './config/constants';

/**
 * Route Protection Proxy (Next.js 16 Convention)
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/PROJECT_RULES.md §2.5
 * Reference: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * Enforces server-side authentication boundary on all incoming requests.
 * Public routes: /login, /api/health
 * Protected routes: all portal and application routes.
 */

const PUBLIC_ROUTES = ['/login', '/api/health'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if public route
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Read session cookie
  const token = request.cookies.get(AUTH_DEFAULTS.SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 2. Public route handling
  if (isPublic) {
    // If authenticated user navigates to /login, redirect to /dashboard
    if (pathname === '/login' && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected route handling
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Ensure invalid/expired cookie is cleaned up
    if (token) {
      response.cookies.delete(AUTH_DEFAULTS.SESSION_COOKIE_NAME);
    }
    return response;
  }

  // 4. Attach verified user headers for downstream server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-user-role', session.role);
  requestHeaders.set('x-user-email', session.email);
  requestHeaders.set('x-user-name', session.name);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-user-id', session.userId);
  response.headers.set('x-user-role', session.role);
  response.headers.set('x-user-email', session.email);
  response.headers.set('x-user-name', session.name);

  return response;
}

export default proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
