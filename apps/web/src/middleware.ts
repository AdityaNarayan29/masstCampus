import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware for tenant resolution
 *
 * This middleware:
 * 1. Reads x-forwarded-host (from proxy) or host header
 * 2. Resolves tenant from the backend
 * 3. Adds x-tenant-id header to the request
 * 4. Passes portal type via headers for components to read
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

  const requestHeaders = new Headers(request.headers);

  // Detect portal type based on subdomain
  // Super Admin: admin.masstcampus.com or localhost (default)
  if (targetHost.startsWith('admin.masstcampus') || targetHost.startsWith('admin.localhost')) {
    requestHeaders.set('x-portal-type', 'super-admin');
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // School Admin: portal.{school}.com or school-crm.com or vidyamandir
  if (targetHost.startsWith('portal.') || targetHost.includes('school-crm') || targetHost.includes('vidyamandir')) {
    try {
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
        requestHeaders.set('x-tenant-id', data.data.id);
        requestHeaders.set('x-tenant-name', data.data.name);
        requestHeaders.set('x-portal-type', 'school-admin');

        return NextResponse.next({
          request: { headers: requestHeaders },
        });
      } else {
        console.warn(`Tenant not found for host: ${targetHost}`);
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

  // Default: treat as super-admin for localhost development
  requestHeaders.set('x-portal-type', 'super-admin');
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
