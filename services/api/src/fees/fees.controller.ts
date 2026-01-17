import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { FeesService } from './fees.service';
import { TenantId } from '../tenant/tenant.decorator';
import { Roles } from '../auth/roles.decorator';
import { FeeStatus, PaymentStatus } from '@prisma/client';

@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // ========== FEE ENDPOINTS ==========

  /**
   * Get all fees
   */
  @Get()
  async getFees(
    @TenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: FeeStatus,
    @Query('type') type?: string,
    @Query('academicYear') academicYear?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.feesService.findAllFees(tenantId, {
      studentId,
      status,
      type,
      academicYear,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: result.fees,
      meta: {
        total: result.total,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    };
  }

  /**
   * Get fee statistics
   */
  @Get('stats')
  async getFeeStats(
    @TenantId() tenantId: string,
    @Query('academicYear') academicYear?: string
  ) {
    const stats = await this.feesService.getFeeStats(tenantId, academicYear);
    return { success: true, data: stats };
  }

  /**
   * Get fee by ID
   */
  @Get(':id')
  async getFeeById(@Param('id') id: string, @TenantId() tenantId: string) {
    const fee = await this.feesService.findOneFee(id, tenantId);

    if (!fee) {
      throw new NotFoundException('Fee not found');
    }

    return { success: true, data: fee };
  }

  /**
   * Create a new fee
   */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createFee(@TenantId() tenantId: string, @Body() data: any) {
    const fee = await this.feesService.createFee(tenantId, data);
    return { success: true, data: fee };
  }

  /**
   * Update a fee
   */
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateFee(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any
  ) {
    const existing = await this.feesService.findOneFee(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Fee not found');
    }

    const fee = await this.feesService.updateFee(id, tenantId, data);
    return { success: true, data: fee };
  }

  /**
   * Delete a fee
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteFee(@Param('id') id: string, @TenantId() tenantId: string) {
    const existing = await this.feesService.findOneFee(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Fee not found');
    }

    await this.feesService.deleteFee(id, tenantId);
    return { success: true, message: 'Fee deleted successfully' };
  }

  /**
   * Mark overdue fees
   */
  @Post('mark-overdue')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async markOverdueFees(@TenantId() tenantId: string) {
    const result = await this.feesService.markOverdueFees(tenantId);
    return { success: true, data: result };
  }

  // ========== PAYMENT ENDPOINTS ==========

  /**
   * Get all payments
   */
  @Get('payments/all')
  async getPayments(
    @TenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('feeId') feeId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.feesService.findAllPayments(tenantId, {
      studentId,
      feeId,
      status,
      startDate,
      endDate,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: result.payments,
      meta: {
        total: result.total,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    };
  }

  /**
   * Record a payment
   */
  @Post('payments')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async recordPayment(@TenantId() tenantId: string, @Body() data: any) {
    const payment = await this.feesService.recordPayment(tenantId, data);
    return { success: true, data: payment };
  }

  /**
   * Get student fee summary
   */
  @Get('student/:studentId/summary')
  async getStudentFeeSummary(
    @Param('studentId') studentId: string,
    @TenantId() tenantId: string
  ) {
    const summary = await this.feesService.getStudentFeeSummary(tenantId, studentId);
    return { success: true, data: summary };
  }
}
