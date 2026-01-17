import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Class } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all classes for a tenant
   */
  async findAll(
    tenantId: string,
    options?: {
      gradeLevel?: string;
      teacherId?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ classes: Class[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isActive: true };

    if (options?.gradeLevel) {
      where.gradeLevel = options.gradeLevel;
    }

    if (options?.teacherId) {
      where.teacherId = options.teacherId;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { gradeLevel: { contains: options.search, mode: 'insensitive' } },
        { section: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ gradeLevel: 'asc' }, { section: 'asc' }],
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { attendance: true } },
        },
      }),
      this.prisma.class.count({ where }),
    ]);

    return { classes, total };
  }

  /**
   * Get class by ID
   */
  async findOne(id: string, tenantId: string): Promise<Class | null> {
    return this.prisma.class.findFirst({
      where: { id, tenantId },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        attendance: {
          orderBy: { date: 'desc' },
          take: 50,
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Create a new class
   */
  async create(
    tenantId: string,
    data: {
      name: string;
      gradeLevel: string;
      section: string;
      teacherId?: string;
      schedule?: any;
    }
  ): Promise<Class> {
    return this.prisma.class.create({
      data: {
        ...data,
        tenantId,
        isActive: true,
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Update a class
   */
  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      name: string;
      gradeLevel: string;
      section: string;
      teacherId: string;
      schedule: any;
      isActive: boolean;
    }>
  ): Promise<Class> {
    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Delete a class (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<Class> {
    return this.prisma.class.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get students in a class (by grade and section)
   */
  async getStudentsInClass(classId: string, tenantId: string) {
    const classInfo = await this.prisma.class.findFirst({
      where: { id: classId, tenantId },
    });

    if (!classInfo) return [];

    return this.prisma.student.findMany({
      where: {
        tenantId,
        gradeLevel: classInfo.gradeLevel,
        section: classInfo.section,
        isActive: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  /**
   * Get class statistics
   */
  async getStats(tenantId: string) {
    const [total, byGrade] = await Promise.all([
      this.prisma.class.count({ where: { tenantId, isActive: true } }),
      this.prisma.class.groupBy({
        by: ['gradeLevel'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      byGrade: byGrade.map((g) => ({ grade: g.gradeLevel, count: g._count })),
    };
  }
}
