import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { TenantId } from '../tenant/tenant.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Get all students for current tenant
   */
  @Get()
  async getStudents(
    @TenantId() tenantId: string,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('brokerId') brokerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.studentsService.findStudentsForTenant(tenantId, {
      gradeLevel,
      brokerId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: result.students,
      meta: {
        total: result.total,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    };
  }

  /**
   * Get student by ID
   */
  @Get(':id')
  async getStudentById(@Param('id') id: string, @TenantId() tenantId: string) {
    const student = await this.studentsService.getStudentById(id, tenantId);

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    return { success: true, data: student };
  }

  /**
   * Create a new student
   */
  @Post()
  async createStudent(@TenantId() tenantId: string, @Body() data: any) {
    const student = await this.studentsService.createStudent(tenantId, data);
    return { success: true, data: student };
  }
}
