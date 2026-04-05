import type { Tenant } from '../types/tenant';

/**
 * Get tenant by host on the server side
 * Reads x-forwarded-host (proxy) or host header
 */
export async function getTenantByHost(host: string): Promise<Tenant | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    const response = await fetch(`${backendUrl}/api/v1/tenants/resolve`, {
      headers: {
        'x-forwarded-host': host,
        'host': host,
      },
    });

    const data = await response.json();

    if (data.success && data.data) {
      return data.data as Tenant;
    }

    return null;
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

/**
 * Get tenant by host on the client side
 * Uses the current window.location.host
 */
export async function getTenantClient(): Promise<Tenant | null> {
  try {
    const response = await fetch('/api/backend/tenants/resolve', {
      headers: {
        'x-forwarded-host': window.location.host,
      },
    });

    const data = await response.json();

    if (data.success && data.data) {
      return data.data as Tenant;
    }

    return null;
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

/**
 * Extract host from Next.js headers
 */
export function getHostFromHeaders(headers: Headers): string {
  // Priority: x-forwarded-host > host
  return headers.get('x-forwarded-host') || headers.get('host') || '';
}

// ============ Client-side subdomain helpers ============

/**
 * Returns the subdomain slug from the current browser hostname, or null if
 * the page is being served from the root/main domain.
 *
 * Examples:
 *   vidyamandir.localhost:3004  -> "vidyamandir"
 *   dps.masstcampus.com        -> "dps"
 *   localhost:3004              -> null
 */
export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;

  // localhost subdomains: vidyamandir.localhost -> vidyamandir
  const parts = hostname.split('.');
  if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }

  // Production: vidyamandir.masstcampus.com -> vidyamandir
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

/**
 * Returns true when the page is served from the main/root domain
 * (no subdomain), i.e. the platform landing or super-admin area.
 */
export function isMainDomain(): boolean {
  return getSubdomain() === null;
}
