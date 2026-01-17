import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Student } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all students for a tenant
   */
  async findStudentsForTenant(
    tenantId: string,
    options?: {
      gradeLevel?: string;
      brokerId?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ students: Student[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options?.gradeLevel) {
      where.gradeLevel = options.gradeLevel;
    }

    if (options?.brokerId) {
      where.brokerId = options.brokerId;
    }

    // Search by name or email
    if (options?.search) {
      where.OR = [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { enrollmentNumber: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          broker: { select: { id: true, name: true } },
          parent: { select: { id: true, relationshipType: true } },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  /**
   * Get student by ID (with tenant check)
   */
  async getStudentById(studentId: string, tenantId: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
      include: {
        broker: { select: { id: true, name: true } },
        parent: { select: { id: true, relationshipType: true } },
        fees: { orderBy: { dueDate: 'desc' }, take: 5 },
        attendance: { orderBy: { date: 'desc' }, take: 10 },
      },
    });
  }

  /**
   * Create a new student
   */
  async createStudent(
    tenantId: string,
    data: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      brokerId?: string;
      enrollmentNumber: string;
      gradeLevel: string;
      section?: string;
      metadata?: any;
    }
  ): Promise<Student> {
    return this.prisma.student.create({
      data: {
        ...data,
        tenantId,
        isActive: true,
      },
    });
  }

  /**
   * Update student
   */
  async updateStudent(
    studentId: string,
    tenantId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      gradeLevel: string;
      section: string;
      isActive: boolean;
      metadata: any;
    }>
  ): Promise<Student> {
    return this.prisma.student.update({
      where: { id: studentId },
      data,
    });
  }

  /**
   * Delete student (soft delete by setting isActive to false)
   */
  async deleteStudent(studentId: string, tenantId: string): Promise<Student> {
    return this.prisma.student.update({
      where: { id: studentId },
      data: { isActive: false },
    });
  }

  /**
   * Get student statistics for dashboard
   */
  async getStudentStats(tenantId: string) {
    const [total, active, byGrade] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId, isActive: true } }),
      this.prisma.student.groupBy({
        by: ['gradeLevel'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byGrade: byGrade.map((g) => ({ grade: g.gradeLevel, count: g._count })),
    };
  }
}
