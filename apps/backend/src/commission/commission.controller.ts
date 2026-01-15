import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { TenantId } from '../tenant/tenant.decorator';

@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  /**
   * Calculate commission for a payment
   */
  @Post('calculate/:paymentId')
  async calculateCommission(@Param('paymentId') paymentId: string, @TenantId() tenantId: string) {
    const calculations = await this.commissionService.calculateCommissionForPayment(
      paymentId,
      tenantId
    );

    return {
      success: true,
      data: {
        paymentId,
        calculations,
        totalCommission: calculations.reduce((sum, c) => sum + c.commissionAmount, 0),
      },
    };
  }

  /**
   * Create commission records for a payment
   */
  @Post('create/:paymentId')
  async createCommission(@Param('paymentId') paymentId: string, @TenantId() tenantId: string) {
    // Calculate first
    const calculations = await this.commissionService.calculateCommissionForPayment(
      paymentId,
      tenantId
    );

    // Create commission records
    const commissions = await this.commissionService.createCommissionRecords(
      tenantId,
      paymentId,
      calculations
    );

    return { success: true, data: commissions };
  }

  /**
   * Get commissions for a broker
   */
  @Get('broker/:brokerId')
  async getBrokerCommissions(
    @Param('brokerId') brokerId: string,
    @TenantId() tenantId: string,
    @Query('status') status?: string
  ) {
    const commissions = await this.commissionService.getCommissionsForBroker(
      brokerId,
      tenantId,
      status
    );

    return { success: true, data: commissions };
  }
}
