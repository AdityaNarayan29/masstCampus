import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { TenantId } from '../tenant/tenant.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  /**
   * Get all parents
   */
  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.parentsService.findAll(tenantId, {
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return { success: true, data: result };
  }

  /**
   * Get parent by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const parent = await this.parentsService.findOne(id, tenantId);
    if (!parent) {
      return { success: false, error: 'Parent not found' };
    }
    return { success: true, data: parent };
  }

  /**
   * Get parent's children
   */
  @Get(':id/children')
  async getChildren(@Param('id') id: string, @TenantId() tenantId: string) {
    const children = await this.parentsService.getChildren(id, tenantId);
    return { success: true, data: children };
  }

  /**
   * Create a new parent
   */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() data: any, @TenantId() tenantId: string) {
    try {
      const parent = await this.parentsService.create(tenantId, data);
      return { success: true, data: parent };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Update a parent
   */
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @TenantId() tenantId: string
  ) {
    try {
      const parent = await this.parentsService.update(id, tenantId, data);
      return { success: true, data: parent };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Delete a parent (soft delete)
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    try {
      const parent = await this.parentsService.delete(id, tenantId);
      return { success: true, data: parent };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
