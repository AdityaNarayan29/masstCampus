import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware for tenant resolution
 *
 * This middleware:
 * 1. Reads x-forwarded-host (from proxy) or host header
 * 2. Resolves tenant from the backend
 * 3. Adds x-tenant-id header to the request
 * 4. Can optionally rewrite URLs or redirect
 *
 * IMPORTANT: This runs on the Edge runtime, so no Node.js APIs
 */
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

  // Get host from headers (priority: x-forwarded-host > host)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host');
  const targetHost = forwardedHost || host || '';

  // Detect subdomain routing
  // Super Admin: admin.masstcampus.com -> (super-admin) route group
  if (targetHost.startsWith('admin.masstcampus') || targetHost.startsWith('admin.localhost')) {
    // Rewrite to super-admin route group
    if (!pathname.startsWith('/super-admin')) {
      return NextResponse.rewrite(new URL(`/super-admin${pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // School Admin: portal.{school}.com -> (school-admin) route group
  if (targetHost.startsWith('portal.') || targetHost.includes('school-crm') || targetHost.includes('vidyamandir')) {
    try {
      // Resolve tenant from backend
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const resolveUrl = `${backendUrl}/api/v1/tenants/resolve`;

      const response = await fetch(resolveUrl, {
        headers: {
          'x-forwarded-host': targetHost,
          'host': targetHost,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Tenant found - add tenant ID to request headers and rewrite to school-admin
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-tenant-id', data.data.id);
        requestHeaders.set('x-tenant-name', data.data.name);

        if (!pathname.startsWith('/school-admin')) {
          return NextResponse.rewrite(
            new URL(`/school-admin${pathname}`, request.url),
            {
              request: {
                headers: requestHeaders,
              },
            }
          );
        }

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        // Tenant not found
        console.warn(`Tenant not found for host: ${targetHost}`);
        return NextResponse.rewrite(new URL('/school-admin/tenant-not-found', request.url));
      }
    } catch (error) {
      console.error('Tenant resolution error:', error);
      return NextResponse.next();
    }
  }

  // Default: redirect to super-admin
  return NextResponse.rewrite(new URL(`/super-admin${pathname}`, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
