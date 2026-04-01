import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Commission, CommissionRule } from '@prisma/client';

const MAX_HIERARCHY_DEPTH = 10;

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED'],
  APPROVED: ['PAID'],
  PAID: [],
};

export interface CommissionCalculationResult {
  brokerId: string;
  brokerName: string;
  level: number;
  ruleId: string | null;
  ruleName: string | null;
  percentage: number;
  baseAmount: number;
  commissionAmount: number;
}

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  async calculateCommissionForPayment(
    paymentId: string,
    tenantId: string,
  ): Promise<CommissionCalculationResult[]> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            broker: true,
          },
        },
        fee: true,
      },
    });

    if (!payment || !payment.student.broker) {
      return [];
    }

    if (payment.tenantId !== tenantId) {
      throw new ForbiddenException('Payment does not belong to this tenant');
    }

    const results: CommissionCalculationResult[] = [];
    const brokerHierarchy = await this.getBrokerHierarchy(payment.student.broker.id, tenantId);

    for (const broker of brokerHierarchy) {
      const applicableRule = await this.findApplicableRule(broker.id, payment.fee.type, payment.amount);

      if (applicableRule) {
        const commissionAmount = (payment.amount * applicableRule.percentage) / 100;

        results.push({
          brokerId: broker.id,
          brokerName: broker.name,
          level: broker.level,
          ruleId: applicableRule.id,
          ruleName: applicableRule.name,
          percentage: applicableRule.percentage,
          baseAmount: payment.amount,
          commissionAmount,
        });
      }
    }

    return results;
  }

  async createCommissionRecords(
    tenantId: string,
    paymentId: string,
    calculations: CommissionCalculationResult[],
  ): Promise<Commission[]> {
    const commissions: Commission[] = [];

    for (const calc of calculations) {
      const commission = await this.prisma.commission.create({
        data: {
          tenantId,
          brokerId: calc.brokerId,
          paymentId,
          ruleId: calc.ruleId,
          amount: calc.commissionAmount,
          percentage: calc.percentage,
          baseAmount: calc.baseAmount,
          status: 'PENDING',
          metadata: {
            brokerName: calc.brokerName,
            level: calc.level,
            ruleName: calc.ruleName,
          },
        },
      });

      commissions.push(commission);
    }

    return commissions;
  }

  async updateCommissionStatus(commissionId: string, tenantId: string, newStatus: string) {
    const commission = await this.prisma.commission.findFirst({
      where: { id: commissionId, tenantId },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    const allowed = VALID_STATUS_TRANSITIONS[commission.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${commission.status} to ${newStatus}`,
      );
    }

    return this.prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: newStatus,
        ...(newStatus === 'PAID' && { paidAt: new Date() }),
      },
    });
  }

  private async findApplicableRule(
    brokerId: string,
    feeType: string,
    amount: number,
  ): Promise<CommissionRule | null> {
    const rules = await this.prisma.commissionRule.findMany({
      where: {
        brokerId,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      const conditions = rule.conditions as any;

      if (conditions.feeType && Array.isArray(conditions.feeType)) {
        if (!conditions.feeType.includes(feeType)) continue;
      }

      if (conditions.minAmount && amount < conditions.minAmount) continue;
      if (conditions.maxAmount && amount > conditions.maxAmount) continue;

      return rule;
    }

    return null;
  }

  private async getBrokerHierarchy(brokerId: string, tenantId: string) {
    const hierarchy: any[] = [];
    let currentBrokerId: string | null = brokerId;
    const visited = new Set<string>();
    let depth = 0;

    while (currentBrokerId) {
      if (visited.has(currentBrokerId) || depth >= MAX_HIERARCHY_DEPTH) break;

      const broker = await this.prisma.broker.findFirst({
        where: {
          id: currentBrokerId,
          tenantId,
          isActive: true,
        },
      });

      if (!broker) break;

      visited.add(currentBrokerId);
      hierarchy.push(broker);
      currentBrokerId = broker.parentBrokerId;
      depth++;
    }

    return hierarchy;
  }

  async getCommissionsForBroker(
    brokerId: string,
    tenantId: string,
    status?: string,
  ): Promise<Commission[]> {
    const where: any = {
      brokerId,
      tenantId,
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.commission.findMany({
      where,
      include: {
        payment: {
          include: {
            student: true,
            fee: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
