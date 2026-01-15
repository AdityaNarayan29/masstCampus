import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Mobile App Middleware for role-based routing
 *
 * This middleware:
 * 1. Checks authentication token in cookies
 * 2. Determines user role (auth, teacher, parent)
 * 3. Routes to appropriate route group
 * 4. Protects routes based on roles
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

  // Get auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Route based on user role
  const teacherRoutes = ['/teacher'];
  const parentRoutes = ['/parent'];

  if (userRole === 'teacher' && teacherRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (userRole === 'parent' && parentRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Default redirect based on role
  if (userRole === 'teacher') {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  if (userRole === 'parent') {
    return NextResponse.redirect(new URL('/parent', request.url));
  }

  // No valid role, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
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
