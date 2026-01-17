import { Controller, Get, Post, Put, Delete, Body, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Resolve tenant by host header
   * Used by frontend to get tenant info before auth
   */
  @Public()
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
   * Get all tenants (super admin only)
   */
  @Get()
  @Roles('SUPER_ADMIN')
  async getAllTenants() {
    const tenants = await this.tenantService.getAllTenants();
    return { success: true, data: tenants };
  }

  /**
   * Get tenant by ID
   */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getTenantById(@Param('id') id: string) {
    try {
      const tenant = await this.tenantService.getTenantById(id);
      return { success: true, data: tenant };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new tenant (school)
   */
  @Post()
  @Roles('SUPER_ADMIN')
  async createTenant(@Body() data: any) {
    try {
      const tenant = await this.tenantService.createTenant(data);
      return { success: true, data: tenant };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Update a tenant
   */
  @Put(':id')
  @Roles('SUPER_ADMIN')
  async updateTenant(@Param('id') id: string, @Body() data: any) {
    try {
      const tenant = await this.tenantService.updateTenant(id, data);
      return { success: true, data: tenant };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Delete (deactivate) a tenant
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async deleteTenant(@Param('id') id: string) {
    try {
      const tenant = await this.tenantService.updateTenant(id, { isActive: false });
      return { success: true, data: tenant };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
