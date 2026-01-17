import { Controller, Get, Post, Delete, Body, Param, Query, NotFoundException, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { TenantId } from '../tenant/tenant.decorator';
import { Roles } from '../auth/roles.decorator';
import { AttendanceStatus } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Get attendance records
   */
  @Get()
  async getAttendance(
    @TenantId() tenantId: string,
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: AttendanceStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.attendanceService.findAll(tenantId, {
      classId,
      studentId,
      date,
      startDate,
      endDate,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: result.attendance,
      meta: {
        total: result.total,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      },
    };
  }

  /**
   * Get attendance by ID
   */
  @Get(':id')
  async getAttendanceById(@Param('id') id: string, @TenantId() tenantId: string) {
    const attendance = await this.attendanceService.findOne(id, tenantId);

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return { success: true, data: attendance };
  }

  /**
   * Get class attendance stats for a date
   */
  @Get('class/:classId/stats')
  async getClassStats(
    @Param('classId') classId: string,
    @TenantId() tenantId: string,
    @Query('date') date: string
  ) {
    const stats = await this.attendanceService.getClassAttendanceStats(
      tenantId,
      classId,
      date || new Date().toISOString().split('T')[0]
    );
    return { success: true, data: stats };
  }

  /**
   * Get student attendance summary
   */
  @Get('student/:studentId/summary')
  async getStudentSummary(
    @Param('studentId') studentId: string,
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const summary = await this.attendanceService.getStudentAttendanceSummary(
      tenantId,
      studentId,
      startDate,
      endDate
    );
    return { success: true, data: summary };
  }

  /**
   * Mark attendance for a single student
   */
  @Post('mark')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async markAttendance(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() data: {
      studentId: string;
      classId: string;
      date: string;
      status: AttendanceStatus;
      notes?: string;
    }
  ) {
    const attendance = await this.attendanceService.markAttendance(tenantId, {
      ...data,
      markedBy: req.user?.id || 'system',
    });
    return { success: true, data: attendance };
  }

  /**
   * Bulk mark attendance for a class
   */
  @Post('bulk')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async bulkMarkAttendance(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() data: {
      classId: string;
      date: string;
      records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>;
    }
  ) {
    const result = await this.attendanceService.bulkMarkAttendance(
      tenantId,
      data.classId,
      data.date,
      req.user?.id || 'system',
      data.records
    );
    return { success: true, data: result };
  }

  /**
   * Delete attendance record
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteAttendance(@Param('id') id: string, @TenantId() tenantId: string) {
    const existing = await this.attendanceService.findOne(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Attendance record not found');
    }

    await this.attendanceService.delete(id, tenantId);
    return { success: true, message: 'Attendance record deleted successfully' };
  }
}
