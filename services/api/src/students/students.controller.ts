import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { TenantId } from '../tenant/tenant.decorator';
import { Roles } from '../auth/roles.decorator';

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
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const result = await this.studentsService.findStudentsForTenant(tenantId, {
      gradeLevel,
      brokerId,
      search,
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
      throw new NotFoundException('Student not found');
    }

    return { success: true, data: student };
  }

  /**
   * Create a new student
   */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createStudent(@TenantId() tenantId: string, @Body() data: any) {
    const student = await this.studentsService.createStudent(tenantId, data);
    return { success: true, data: student };
  }

  /**
   * Update a student
   */
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateStudent(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any
  ) {
    const existing = await this.studentsService.getStudentById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    const student = await this.studentsService.updateStudent(id, tenantId, data);
    return { success: true, data: student };
  }

  /**
   * Delete a student
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteStudent(@Param('id') id: string, @TenantId() tenantId: string) {
    const existing = await this.studentsService.getStudentById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    await this.studentsService.deleteStudent(id, tenantId);
    return { success: true, message: 'Student deleted successfully' };
  }
}
