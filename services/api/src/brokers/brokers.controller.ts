import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { TenantId } from '../tenant/tenant.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('brokers')
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  /**
   * Get all brokers for current tenant
   */
  @Get()
  async getBrokers(@TenantId() tenantId: string) {
    const brokers = await this.brokersService.getBrokersForTenant(tenantId);
    return { success: true, data: brokers };
  }

  /**
   * Get broker by ID
   */
  @Get(':id')
  async getBrokerById(@Param('id') id: string, @TenantId() tenantId: string) {
    const broker = await this.brokersService.getBrokerById(id, tenantId);
    if (!broker) {
      return { success: false, error: 'Broker not found' };
    }
    return { success: true, data: broker };
  }

  /**
   * Get broker hierarchy
   */
  @Get(':id/hierarchy')
  async getBrokerHierarchy(@Param('id') id: string, @TenantId() tenantId: string) {
    const hierarchy = await this.brokersService.getBrokerHierarchy(id, tenantId);

    if (!hierarchy) {
      return { success: false, error: 'Broker not found' };
    }

    return { success: true, data: hierarchy };
  }

  /**
   * Get broker statistics
   */
  @Get(':id/stats')
  async getBrokerStats(@Param('id') id: string, @TenantId() tenantId: string) {
    const stats = await this.brokersService.getBrokerStats(id, tenantId);
    return { success: true, data: stats };
  }

  /**
   * Create a new broker
   */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createBroker(@TenantId() tenantId: string, @Body() data: any) {
    const broker = await this.brokersService.createBroker(tenantId, data);
    return { success: true, data: broker };
  }

  /**
   * Update a broker
   */
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateBroker(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any
  ) {
    const broker = await this.brokersService.updateBroker(id, tenantId, data);
    return { success: true, data: broker };
  }

  /**
   * Delete a broker (soft delete)
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteBroker(@Param('id') id: string, @TenantId() tenantId: string) {
    try {
      const broker = await this.brokersService.deleteBroker(id, tenantId);
      return { success: true, data: broker };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
