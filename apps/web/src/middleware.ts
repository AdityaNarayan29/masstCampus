import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware for tenant resolution via subdomain routing
 *
 * This middleware:
 * 1. Extracts subdomain from the request hostname (e.g., vidyamandir.localhost:3004 -> vidyamandir)
 * 2. Sets x-tenant-subdomain header for the backend to resolve the tenant
 * 3. Passes x-forwarded-host for full host-based resolution
 * 4. Root domain (localhost:3004 with no subdomain) is the platform/super-admin landing
 *
 * IMPORTANT: This runs on the Edge runtime, so no Node.js APIs
 */

/** Paths that work without a tenant context */
const TENANT_FREE_PATHS = ['/onboarding', '/home', '/login'];

/**
 * Extract subdomain from a hostname.
 * Examples:
 *   vidyamandir.localhost       -> vidyamandir
 *   vidyamandir.localhost:3004  -> vidyamandir
 *   dps.masstcampus.com        -> dps
 *   localhost                   -> null
 *   localhost:3004              -> null
 *   admin.localhost             -> admin
 */
function extractSubdomain(hostname: string): string | null {
  // Strip port
  const clean = hostname.split(':')[0];
  const parts = clean.split('.');

  // localhost subdomains: <sub>.localhost
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  // Production subdomains: <sub>.masstcampus.com (3+ parts)
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') || '';
  const subdomain = extractSubdomain(host);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-forwarded-host', host);

  // Skip subdomain-based tenant resolution for tenant-free paths
  const isTenantFreePath = TENANT_FREE_PATHS.some((p) => pathname.startsWith(p));

  if (!subdomain || isTenantFreePath) {
    // No subdomain — this is the platform / super-admin / landing page
    requestHeaders.set('x-portal-type', 'super-admin');
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // We have a subdomain — resolve the tenant
  requestHeaders.set('x-tenant-subdomain', subdomain);

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const resolveUrl = `${backendUrl}/api/v1/tenants/resolve`;

    const response = await fetch(resolveUrl, {
      headers: {
        'x-forwarded-host': host,
        'x-tenant-subdomain': subdomain,
      },
    });

    const data = await response.json();

    if (data.success && data.data) {
      requestHeaders.set('x-tenant-id', data.data.id);
      requestHeaders.set('x-tenant-name', data.data.name);
      requestHeaders.set('x-portal-type', 'school-admin');

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } else {
      console.warn(`Tenant not found for subdomain: ${subdomain} (host: ${host})`);
      requestHeaders.set('x-portal-type', 'tenant-not-found');
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
