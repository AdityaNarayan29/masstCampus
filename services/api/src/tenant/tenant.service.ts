import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve tenant by host header value
   * Priority:
   * 1. Check if it's a custom domain (primaryDomain)
   * 2. Check if it's a subdomain
   */
  async getTenantByHost(host: string): Promise<Tenant | null> {
    if (!host) return null;

    // Try to find by exact primary domain match (with port) first
    let tenant = await this.prisma.tenant.findFirst({
      where: {
        primaryDomain: host,
        isActive: true,
      },
    });

    if (tenant) return tenant;

    // Remove port if present
    const cleanHost = host.split(':')[0];

    // Try to find by primary domain without port
    tenant = await this.prisma.tenant.findFirst({
      where: {
        primaryDomain: cleanHost,
        isActive: true,
      },
    });

    if (tenant) return tenant;

    // Try to find by subdomain
    // Extract subdomain from host (e.g., "portal.vidyamandir.local" -> "portal.vidyamandir")
    // or "portal.vidyamandir.com" -> "portal.vidyamandir"
    const parts = cleanHost.split('.');
    if (parts.length >= 2) {
      const subdomain = parts.slice(0, -1).join('.'); // Everything except TLD
      tenant = await this.prisma.tenant.findFirst({
        where: {
          subdomain,
          isActive: true,
        },
      });
    }

    // For localhost without dots, check subdomain directly
    if (!tenant && cleanHost === 'localhost') {
      tenant = await this.prisma.tenant.findFirst({
        where: {
          subdomain: 'localhost',
          isActive: true,
        },
      });
    }

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found: ${tenantId}`);
    }

    return tenant;
  }

  /**
   * Get all active tenants
   */
  async getAllTenants(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: {
    name: string;
    primaryDomain?: string;
    subdomain: string;
    theme?: any;
    config?: any;
  }): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        primaryDomain: data.primaryDomain,
        subdomain: data.subdomain,
        theme: data.theme || {},
        config: data.config || {},
        isActive: true,
      },
    });
  }

  /**
   * Update tenant
   */
  async updateTenant(
    tenantId: string,
    data: Partial<{
      name: string;
      primaryDomain: string;
      subdomain: string;
      theme: any;
      config: any;
      isActive: boolean;
    }>
  ): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }
}
