import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { TenantId } from '../tenant/tenant.decorator';

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
   * Create a new broker
   */
  @Post()
  async createBroker(@TenantId() tenantId: string, @Body() data: any) {
    const broker = await this.brokersService.createBroker(tenantId, data);
    return { success: true, data: broker };
  }
}
