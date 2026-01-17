import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParentProfile, RelationshipType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all parents for a tenant
   */
  async findAll(
    tenantId: string,
    options?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ parents: ParentProfile[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isActive: true };

    if (options?.search) {
      where.OR = [
        { user: { email: { contains: options.search, mode: 'insensitive' } } },
        { user: { profile: { path: ['firstName'], string_contains: options.search } } },
        { user: { profile: { path: ['lastName'], string_contains: options.search } } },
      ];
    }

    const [parents, total] = await Promise.all([
      this.prisma.parentProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: true,
              isActive: true,
            },
          },
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gradeLevel: true,
            },
          },
        },
      }),
      this.prisma.parentProfile.count({ where }),
    ]);

    return { parents, total };
  }

  /**
   * Get parent by ID
   */
  async findOne(id: string, tenantId: string): Promise<ParentProfile | null> {
    return this.prisma.parentProfile.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
            isActive: true,
          },
        },
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            gradeLevel: true,
            section: true,
          },
        },
      },
    });
  }

  /**
   * Create a new parent (creates user and parent profile)
   */
  async create(
    tenantId: string,
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      relationshipType: RelationshipType;
      occupation?: string;
      childrenIds?: string[];
    }
  ): Promise<ParentProfile> {
    const passwordHash = await bcrypt.hash(data.password, 12);

    return this.prisma.$transaction(async (tx) => {
      // Create user with PARENT role
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: 'PARENT',
          tenantId,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
          isActive: true,
        },
      });

      // Create parent profile
      const parentProfile = await tx.parentProfile.create({
        data: {
          userId: user.id,
          tenantId,
          relationshipType: data.relationshipType,
          occupation: data.occupation,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
      });

      // Link children if provided
      if (data.childrenIds && data.childrenIds.length > 0) {
        await tx.student.updateMany({
          where: {
            id: { in: data.childrenIds },
            tenantId,
          },
          data: {
            parentId: parentProfile.id,
          },
        });
      }

      return parentProfile;
    });
  }

  /**
   * Update a parent
   */
  async update(
    id: string,
    tenantId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      relationshipType?: RelationshipType;
      occupation?: string;
      isActive?: boolean;
      childrenIds?: string[];
    }
  ): Promise<ParentProfile> {
    const parent = await this.prisma.parentProfile.findFirst({
      where: { id, tenantId },
    });

    if (!parent) {
      throw new Error('Parent not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update user profile if name/phone changed
      if (data.firstName || data.lastName || data.phone) {
        const existingUser = await tx.user.findUnique({
          where: { id: parent.userId },
        });
        const existingProfile = (existingUser?.profile as any) || {};

        await tx.user.update({
          where: { id: parent.userId },
          data: {
            profile: {
              ...existingProfile,
              ...(data.firstName && { firstName: data.firstName }),
              ...(data.lastName && { lastName: data.lastName }),
              ...(data.phone && { phone: data.phone }),
            },
          },
        });
      }

      // Update parent profile
      const updatedParent = await tx.parentProfile.update({
        where: { id },
        data: {
          ...(data.relationshipType && { relationshipType: data.relationshipType }),
          ...(data.occupation !== undefined && { occupation: data.occupation }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Update children links if provided
      if (data.childrenIds !== undefined) {
        // Remove current links
        await tx.student.updateMany({
          where: { parentId: id, tenantId },
          data: { parentId: null },
        });

        // Add new links
        if (data.childrenIds.length > 0) {
          await tx.student.updateMany({
            where: {
              id: { in: data.childrenIds },
              tenantId,
            },
            data: { parentId: id },
          });
        }
      }

      return updatedParent;
    });
  }

  /**
   * Delete a parent (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<ParentProfile> {
    // Unlink children first
    await this.prisma.student.updateMany({
      where: { parentId: id, tenantId },
      data: { parentId: null },
    });

    // Soft delete parent profile and user
    const parent = await this.prisma.parentProfile.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.user.update({
      where: { id: parent.userId },
      data: { isActive: false },
    });

    return parent;
  }

  /**
   * Get parent's children
   */
  async getChildren(parentId: string, tenantId: string) {
    return this.prisma.student.findMany({
      where: { parentId, tenantId },
    });
  }
}
