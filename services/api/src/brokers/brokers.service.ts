import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Broker } from '@prisma/client';

const MAX_HIERARCHY_DEPTH = 10;

@Injectable()
export class BrokersService {
  constructor(private prisma: PrismaService) {}

  async getBrokersForTenant(tenantId: string) {
    return this.prisma.broker.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { students: true, commissions: true } },
      },
    });
  }

  async getBrokerById(brokerId: string, tenantId: string): Promise<Broker | null> {
    return this.prisma.broker.findFirst({
      where: {
        id: brokerId,
        tenantId,
        isActive: true,
      },
    });
  }

  async getBrokerHierarchy(brokerId: string, tenantId: string) {
    const broker = await this.getBrokerById(brokerId, tenantId);
    if (!broker) return null;

    const descendants = await this.getDescendants(brokerId, tenantId);

    let parent = null;
    if (broker.parentBrokerId) {
      parent = await this.prisma.broker.findFirst({
        where: { id: broker.parentBrokerId, isActive: true },
      });
    }

    return {
      broker,
      parent,
      descendants,
    };
  }

  private async getDescendants(
    brokerId: string,
    tenantId: string,
    depth = 0,
    visited = new Set<string>(),
  ): Promise<Broker[]> {
    if (depth >= MAX_HIERARCHY_DEPTH || visited.has(brokerId)) {
      return [];
    }

    visited.add(brokerId);

    const children = await this.prisma.broker.findMany({
      where: {
        parentBrokerId: brokerId,
        tenantId,
        isActive: true,
      },
    });

    const allDescendants: Broker[] = [...children];

    for (const child of children) {
      const childDescendants = await this.getDescendants(child.id, tenantId, depth + 1, visited);
      allDescendants.push(...childDescendants);
    }

    return allDescendants;
  }

  async createBroker(
    tenantId: string,
    data: {
      name: string;
      code: string;
      parentBrokerId?: string;
      metadata?: any;
    },
  ): Promise<Broker> {
    let level = 0;
    if (data.parentBrokerId) {
      if (data.parentBrokerId === tenantId) {
        throw new BadRequestException('Broker cannot be its own parent');
      }
      const parent = await this.prisma.broker.findUnique({
        where: { id: data.parentBrokerId },
      });
      if (!parent) throw new BadRequestException('Parent broker not found');
      if (parent.level >= MAX_HIERARCHY_DEPTH) {
        throw new BadRequestException('Maximum broker hierarchy depth exceeded');
      }
      level = parent.level + 1;
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

  async updateBroker(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      code?: string;
      parentBrokerId?: string;
      isActive?: boolean;
      metadata?: any;
    },
  ): Promise<Broker> {
    let updateData: any = { ...data };

    if (data.parentBrokerId !== undefined) {
      if (data.parentBrokerId === id) {
        throw new BadRequestException('Broker cannot be its own parent');
      }

      let level = 0;
      if (data.parentBrokerId) {
        // Prevent circular: check new parent isn't a descendant
        const descendants = await this.getDescendants(id, tenantId);
        if (descendants.some((d) => d.id === data.parentBrokerId)) {
          throw new BadRequestException('Cannot set a descendant as parent (circular hierarchy)');
        }

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

  async deleteBroker(id: string, tenantId: string): Promise<Broker> {
    const [studentsCount, subBrokersCount] = await Promise.all([
      this.prisma.student.count({ where: { brokerId: id } }),
      this.prisma.broker.count({ where: { parentBrokerId: id, isActive: true } }),
    ]);

    if (studentsCount > 0) {
      throw new BadRequestException(`Cannot delete broker with ${studentsCount} assigned students`);
    }

    if (subBrokersCount > 0) {
      throw new BadRequestException(`Cannot delete broker with ${subBrokersCount} active sub-brokers`);
    }

    return this.prisma.broker.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getBrokerStats(brokerId: string, tenantId: string) {
    const [studentsCount, commissionsData] = await Promise.all([
      this.prisma.student.count({
        where: { brokerId, tenantId, isActive: true },
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
