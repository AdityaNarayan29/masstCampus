import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Commission, CommissionRule } from '@prisma/client';

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

  /**
   * Calculate commission for a payment across the broker hierarchy
   * This follows the commission rule logic:
   * - For each broker in the hierarchy (agent -> sub-broker -> top-broker)
   * - Find applicable commission rules based on conditions
   * - Calculate commission amount
   */
  async calculateCommissionForPayment(
    paymentId: string,
    tenantId: string
  ): Promise<CommissionCalculationResult[]> {
    // Get payment details
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            broker: true, // The broker who enrolled the student
          },
        },
        fee: true,
      },
    });

    if (!payment || !payment.student.broker) {
      return []; // No broker associated, no commission
    }

    const results: CommissionCalculationResult[] = [];

    // Get broker hierarchy (from agent up to top broker)
    const brokerHierarchy = await this.getBrokerHierarchy(payment.student.broker.id, tenantId);

    // For each broker in the hierarchy, calculate commission
    for (const broker of brokerHierarchy) {
      // Find applicable commission rules for this broker
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

  /**
   * Create commission records from calculation results
   */
  async createCommissionRecords(
    tenantId: string,
    paymentId: string,
    calculations: CommissionCalculationResult[]
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

  /**
   * Find applicable commission rule for a broker
   * Matches based on:
   * - Broker level
   * - Fee type (if specified in conditions)
   * - Amount range (if specified in conditions)
   * - Priority (highest priority rule wins)
   */
  private async findApplicableRule(
    brokerId: string,
    feeType: string,
    amount: number
  ): Promise<CommissionRule | null> {
    const rules = await this.prisma.commissionRule.findMany({
      where: {
        brokerId,
        isActive: true,
      },
      orderBy: { priority: 'desc' }, // Higher priority first
    });

    for (const rule of rules) {
      const conditions = rule.conditions as any;

      // Check fee type condition
      if (conditions.feeType && Array.isArray(conditions.feeType)) {
        if (!conditions.feeType.includes(feeType)) {
          continue; // Rule doesn't apply to this fee type
        }
      }

      // Check min amount condition
      if (conditions.minAmount && amount < conditions.minAmount) {
        continue;
      }

      // Check max amount condition
      if (conditions.maxAmount && amount > conditions.maxAmount) {
        continue;
      }

      // All conditions passed, this rule applies
      return rule;
    }

    return null;
  }

  /**
   * Get broker hierarchy from given broker up to root
   */
  private async getBrokerHierarchy(brokerId: string, tenantId: string) {
    const hierarchy: any[] = [];
    let currentBrokerId: string | null = brokerId;

    while (currentBrokerId) {
      const broker = await this.prisma.broker.findFirst({
        where: {
          id: currentBrokerId,
          tenantId,
        },
      });

      if (!broker) break;

      hierarchy.push(broker);
      currentBrokerId = broker.parentBrokerId;
    }

    return hierarchy;
  }

  /**
   * Get commissions for a broker
   */
  async getCommissionsForBroker(
    brokerId: string,
    tenantId: string,
    status?: string
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
