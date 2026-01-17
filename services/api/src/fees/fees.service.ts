import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Fee, FeeStatus, Payment, PaymentStatus } from '@prisma/client';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all fees for a tenant
   */
  async findAllFees(
    tenantId: string,
    options?: {
      studentId?: string;
      status?: FeeStatus;
      type?: string;
      academicYear?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ fees: Fee[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options?.studentId) {
      where.studentId = options.studentId;
    }

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.academicYear) {
      where.academicYear = options.academicYear;
    }

    const [fees, total] = await Promise.all([
      this.prisma.fee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, enrollmentNumber: true } },
          payments: { orderBy: { paidAt: 'desc' } },
        },
      }),
      this.prisma.fee.count({ where }),
    ]);

    return { fees, total };
  }

  /**
   * Get fee by ID
   */
  async findOneFee(id: string, tenantId: string): Promise<Fee | null> {
    return this.prisma.fee.findFirst({
      where: { id, tenantId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, enrollmentNumber: true, email: true } },
        payments: {
          orderBy: { paidAt: 'desc' },
          include: {
            commissions: { include: { broker: { select: { id: true, name: true } } } },
          },
        },
      },
    });
  }

  /**
   * Create a new fee
   */
  async createFee(
    tenantId: string,
    data: {
      studentId: string;
      type: string;
      amount: number;
      dueDate: string;
      description?: string;
      academicYear: string;
    }
  ): Promise<Fee> {
    return this.prisma.fee.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        tenantId,
        status: 'PENDING',
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Update a fee
   */
  async updateFee(
    id: string,
    tenantId: string,
    data: Partial<{
      type: string;
      amount: number;
      dueDate: string;
      status: FeeStatus;
      description: string;
      academicYear: string;
    }>
  ): Promise<Fee> {
    const updateData: any = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    return this.prisma.fee.update({
      where: { id },
      data: updateData,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Delete a fee
   */
  async deleteFee(id: string, tenantId: string): Promise<Fee> {
    return this.prisma.fee.delete({
      where: { id },
    });
  }

  /**
   * Record a payment
   */
  async recordPayment(
    tenantId: string,
    data: {
      feeId: string;
      studentId: string;
      amount: number;
      paymentMethod: string;
      transactionId?: string;
      paidAt?: string;
    }
  ): Promise<Payment> {
    // Create payment and update fee status in a transaction
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          feeId: data.feeId,
          studentId: data.studentId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
          status: 'COMPLETED',
        },
        include: {
          fee: true,
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Check if fee is fully paid
      const fee = await tx.fee.findUnique({
        where: { id: data.feeId },
        include: { payments: { where: { status: 'COMPLETED' } } },
      });

      if (fee) {
        const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= fee.amount) {
          await tx.fee.update({
            where: { id: data.feeId },
            data: { status: 'PAID' },
          });
        }
      }

      return payment;
    });
  }

  /**
   * Get all payments
   */
  async findAllPayments(
    tenantId: string,
    options?: {
      studentId?: string;
      feeId?: string;
      status?: PaymentStatus;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ payments: Payment[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options?.studentId) {
      where.studentId = options.studentId;
    }

    if (options?.feeId) {
      where.feeId = options.feeId;
    }

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.startDate && options?.endDate) {
      where.paidAt = {
        gte: new Date(options.startDate),
        lte: new Date(options.endDate),
      };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: 'desc' },
        include: {
          fee: { select: { id: true, type: true, amount: true } },
          student: { select: { id: true, firstName: true, lastName: true, enrollmentNumber: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  /**
   * Get fee statistics
   */
  async getFeeStats(tenantId: string, academicYear?: string) {
    const where: any = { tenantId };
    if (academicYear) {
      where.academicYear = academicYear;
    }

    const [totalFees, paidFees, pendingFees, overdueFees, feesByType] = await Promise.all([
      this.prisma.fee.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.fee.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.fee.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.fee.aggregate({
        where: { ...where, status: 'OVERDUE' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.fee.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      total: {
        amount: totalFees._sum.amount || 0,
        count: totalFees._count,
      },
      paid: {
        amount: paidFees._sum.amount || 0,
        count: paidFees._count,
      },
      pending: {
        amount: pendingFees._sum.amount || 0,
        count: pendingFees._count,
      },
      overdue: {
        amount: overdueFees._sum.amount || 0,
        count: overdueFees._count,
      },
      byType: feesByType.map((f) => ({
        type: f.type,
        amount: f._sum.amount || 0,
        count: f._count,
      })),
      collectionRate: totalFees._sum.amount
        ? Math.round(((paidFees._sum.amount || 0) / totalFees._sum.amount) * 100)
        : 0,
    };
  }

  /**
   * Get student's fee summary
   */
  async getStudentFeeSummary(tenantId: string, studentId: string) {
    const [fees, payments] = await Promise.all([
      this.prisma.fee.aggregate({
        where: { tenantId, studentId },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { tenantId, studentId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const totalDue = fees._sum.amount || 0;
    const totalPaid = payments._sum.amount || 0;

    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
    };
  }

  /**
   * Mark overdue fees
   */
  async markOverdueFees(tenantId: string): Promise<{ count: number }> {
    const result = await this.prisma.fee.updateMany({
      where: {
        tenantId,
        status: 'PENDING',
        dueDate: { lt: new Date() },
      },
      data: { status: 'OVERDUE' },
    });

    return { count: result.count };
  }
}
