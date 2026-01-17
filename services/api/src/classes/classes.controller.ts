import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { TenantId } from '../tenant/tenant.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  /**
   * Get all classes for current tenant
   */
  @Get()
  async getClasses(
    @TenantId() tenantId: string,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('teacherId') teacherId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.classesService.findAll(tenantId, {
      gradeLevel,
      teacherId,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: result.classes,
      meta: {
        total: result.total,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    };
  }

  /**
   * Get class by ID
   */
  @Get(':id')
  async getClassById(@Param('id') id: string, @TenantId() tenantId: string) {
    const classItem = await this.classesService.findOne(id, tenantId);

    if (!classItem) {
      throw new NotFoundException('Class not found');
    }

    return { success: true, data: classItem };
  }

  /**
   * Get students in a class
   */
  @Get(':id/students')
  async getStudentsInClass(@Param('id') id: string, @TenantId() tenantId: string) {
    const students = await this.classesService.getStudentsInClass(id, tenantId);
    return { success: true, data: students };
  }

  /**
   * Create a new class
   */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createClass(@TenantId() tenantId: string, @Body() data: any) {
    const classItem = await this.classesService.create(tenantId, data);
    return { success: true, data: classItem };
  }

  /**
   * Update a class
   */
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateClass(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any
  ) {
    const existing = await this.classesService.findOne(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Class not found');
    }

    const classItem = await this.classesService.update(id, tenantId, data);
    return { success: true, data: classItem };
  }

  /**
   * Delete a class
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteClass(@Param('id') id: string, @TenantId() tenantId: string) {
    const existing = await this.classesService.findOne(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Class not found');
    }

    await this.classesService.delete(id, tenantId);
    return { success: true, message: 'Class deleted successfully' };
  }

  /**
   * Get class statistics
   */
  @Get('stats/overview')
  async getStats(@TenantId() tenantId: string) {
    const stats = await this.classesService.getStats(tenantId);
    return { success: true, data: stats };
  }
}
