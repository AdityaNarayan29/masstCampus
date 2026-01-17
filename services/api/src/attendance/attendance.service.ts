import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Attendance, AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get attendance records with filters
   */
  async findAll(
    tenantId: string,
    options?: {
      classId?: string;
      studentId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      status?: AttendanceStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ attendance: Attendance[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options?.classId) {
      where.classId = options.classId;
    }

    if (options?.studentId) {
      where.studentId = options.studentId;
    }

    if (options?.date) {
      where.date = new Date(options.date);
    }

    if (options?.startDate && options?.endDate) {
      where.date = {
        gte: new Date(options.startDate),
        lte: new Date(options.endDate),
      };
    }

    if (options?.status) {
      where.status = options.status;
    }

    const [attendance, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, enrollmentNumber: true } },
          class: { select: { id: true, name: true, gradeLevel: true, section: true } },
          marker: { select: { id: true, email: true } },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { attendance, total };
  }

  /**
   * Get attendance by ID
   */
  async findOne(id: string, tenantId: string): Promise<Attendance | null> {
    return this.prisma.attendance.findFirst({
      where: { id, tenantId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true, gradeLevel: true, section: true } },
        marker: { select: { id: true, email: true } },
      },
    });
  }

  /**
   * Mark attendance for a student
   */
  async markAttendance(
    tenantId: string,
    data: {
      studentId: string;
      classId: string;
      date: string;
      status: AttendanceStatus;
      markedBy: string;
      notes?: string;
    }
  ): Promise<Attendance> {
    // Upsert - update if exists, create if not
    return this.prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId: data.studentId,
          classId: data.classId,
          date: new Date(data.date),
        },
      },
      update: {
        status: data.status,
        markedBy: data.markedBy,
        notes: data.notes,
      },
      create: {
        tenantId,
        studentId: data.studentId,
        classId: data.classId,
        date: new Date(data.date),
        status: data.status,
        markedBy: data.markedBy,
        notes: data.notes,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Bulk mark attendance for a class
   */
  async bulkMarkAttendance(
    tenantId: string,
    classId: string,
    date: string,
    markedBy: string,
    records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>
  ): Promise<{ count: number }> {
    const operations = records.map((record) =>
      this.prisma.attendance.upsert({
        where: {
          studentId_classId_date: {
            studentId: record.studentId,
            classId,
            date: new Date(date),
          },
        },
        update: {
          status: record.status,
          markedBy,
          notes: record.notes,
        },
        create: {
          tenantId,
          studentId: record.studentId,
          classId,
          date: new Date(date),
          status: record.status,
          markedBy,
          notes: record.notes,
        },
      })
    );

    const results = await this.prisma.$transaction(operations);
    return { count: results.length };
  }

  /**
   * Get attendance statistics for a class on a date
   */
  async getClassAttendanceStats(tenantId: string, classId: string, date: string) {
    const attendance = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        tenantId,
        classId,
        date: new Date(date),
      },
      _count: true,
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    };

    attendance.forEach((a) => {
      const status = a.status.toLowerCase() as keyof typeof stats;
      if (status in stats) {
        stats[status] = a._count;
      }
      stats.total += a._count;
    });

    return stats;
  }

  /**
   * Get student attendance summary
   */
  async getStudentAttendanceSummary(
    tenantId: string,
    studentId: string,
    startDate?: string,
    endDate?: string
  ) {
    const where: any = { tenantId, studentId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const attendance = await this.prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      percentage: 0,
    };

    attendance.forEach((a) => {
      const status = a.status.toLowerCase() as keyof typeof summary;
      if (status in summary && typeof summary[status] === 'number') {
        (summary[status] as number) = a._count;
      }
      summary.total += a._count;
    });

    if (summary.total > 0) {
      summary.percentage = Math.round(((summary.present + summary.late) / summary.total) * 100);
    }

    return summary;
  }

  /**
   * Delete attendance record
   */
  async delete(id: string, tenantId: string): Promise<Attendance> {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}
