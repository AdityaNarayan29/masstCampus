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

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      data: {
        ...data,
        // Ensure tenant can't be changed
        tenantId,
      },
    });
  }
}
