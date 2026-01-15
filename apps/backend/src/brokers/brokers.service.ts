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
}
