import type { Tenant } from '@school-crm/types';

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
