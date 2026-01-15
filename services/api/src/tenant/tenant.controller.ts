import { Controller, Get, Headers } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Resolve tenant by host header
   * Used by frontend to get tenant info before auth
   */
  @Get('resolve')
  async resolveTenant(
    @Headers('x-forwarded-host') forwardedHost?: string,
    @Headers('host') host?: string
  ) {
    // Priority: x-forwarded-host > host
    const targetHost = forwardedHost || host;

    if (!targetHost) {
      return { success: false, error: 'No host header provided' };
    }

    const tenant = await this.tenantService.getTenantByHost(targetHost);

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    return {
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        primaryDomain: tenant.primaryDomain,
        theme: tenant.theme,
        config: tenant.config,
      },
    };
  }

  /**
   * Get all tenants (admin only - add auth guard in production)
   */
  @Get()
  async getAllTenants() {
    const tenants = await this.tenantService.getAllTenants();
    return { success: true, data: tenants };
  }
}
