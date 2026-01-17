import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Broker } from '@prisma/client';

@Injectable()
export class BrokersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all brokers for a tenant with hierarchy
   */
  async getBrokersForTenant(tenantId: string): Promise<Broker[]> {
    return this.prisma.broker.findMany({
      where: { tenantId },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get broker by ID
   */
  async getBrokerById(brokerId: string, tenantId: string): Promise<Broker | null> {
    return this.prisma.broker.findFirst({
      where: {
        id: brokerId,
        tenantId,
      },
    });
  }

  /**
   * Get broker hierarchy (parent and all children)
   */
  async getBrokerHierarchy(brokerId: string, tenantId: string) {
    const broker = await this.getBrokerById(brokerId, tenantId);
    if (!broker) return null;

    // Get all descendants recursively
    const descendants = await this.getDescendants(brokerId, tenantId);

    // Get parent if exists
    let parent = null;
    if (broker.parentBrokerId) {
      parent = await this.prisma.broker.findUnique({
        where: { id: broker.parentBrokerId },
      });
    }

    return {
      broker,
      parent,
      descendants,
    };
  }

  /**
   * Helper: Get all descendants of a broker
   */
  private async getDescendants(brokerId: string, tenantId: string): Promise<Broker[]> {
    const children = await this.prisma.broker.findMany({
      where: {
        parentBrokerId: brokerId,
        tenantId,
      },
    });

    const allDescendants: Broker[] = [...children];

    for (const child of children) {
      const childDescendants = await this.getDescendants(child.id, tenantId);
      allDescendants.push(...childDescendants);
    }

    return allDescendants;
  }

  /**
   * Create a new broker
   */
  async createBroker(
    tenantId: string,
    data: {
      name: string;
      code: string;
      parentBrokerId?: string;
      metadata?: any;
    }
  ): Promise<Broker> {
    // Determine level based on parent
    let level = 0;
    if (data.parentBrokerId) {
      const parent = await this.prisma.broker.findUnique({
        where: { id: data.parentBrokerId },
      });
      level = parent ? parent.level + 1 : 0;
    }

    return this.prisma.broker.create({
      data: {
        name: data.name,
        code: data.code,
        parentBrokerId: data.parentBrokerId,
        tenantId,
        level,
        metadata: data.metadata || {},
        isActive: true,
      },
    });
  }

  /**
   * Update a broker
   */
  async updateBroker(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      code?: string;
      parentBrokerId?: string;
      isActive?: boolean;
      metadata?: any;
    }
  ): Promise<Broker> {
    // Recalculate level if parent changed
    let updateData: any = { ...data };
    if (data.parentBrokerId !== undefined) {
      let level = 0;
      if (data.parentBrokerId) {
        const parent = await this.prisma.broker.findUnique({
          where: { id: data.parentBrokerId },
        });
        level = parent ? parent.level + 1 : 0;
      }
      updateData.level = level;
    }

    return this.prisma.broker.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a broker (soft delete by setting isActive = false)
   */
  async deleteBroker(id: string, tenantId: string): Promise<Broker> {
    // Check if broker has students or sub-brokers
    const [studentsCount, subBrokersCount] = await Promise.all([
      this.prisma.student.count({ where: { brokerId: id } }),
      this.prisma.broker.count({ where: { parentBrokerId: id } }),
    ]);

    if (studentsCount > 0) {
      throw new Error(`Cannot delete broker with ${studentsCount} assigned students`);
    }

    if (subBrokersCount > 0) {
      throw new Error(`Cannot delete broker with ${subBrokersCount} sub-brokers`);
    }

    return this.prisma.broker.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get broker statistics
   */
  async getBrokerStats(brokerId: string, tenantId: string) {
    const [studentsCount, commissionsData] = await Promise.all([
      this.prisma.student.count({
        where: { brokerId, tenantId },
      }),
      this.prisma.commission.aggregate({
        where: { brokerId, tenantId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const pendingCommissions = await this.prisma.commission.aggregate({
      where: { brokerId, tenantId, status: 'PENDING' },
      _sum: { amount: true },
    });

    const paidCommissions = await this.prisma.commission.aggregate({
      where: { brokerId, tenantId, status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      studentsEnrolled: studentsCount,
      totalCommissions: commissionsData._sum.amount || 0,
      commissionsCount: commissionsData._count,
      pendingCommissions: pendingCommissions._sum.amount || 0,
      paidCommissions: paidCommissions._sum.amount || 0,
    };
  }
}
