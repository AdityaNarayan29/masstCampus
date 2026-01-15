import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TenantId } from '../tenant/tenant.decorator';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.teachersService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.teachersService.findOne(id, tenantId);
  }

  @Post()
  create(@Body() data: any, @TenantId() tenantId: string) {
    return this.teachersService.create(data, tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any, @TenantId() tenantId: string) {
    return this.teachersService.update(id, data, tenantId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.teachersService.delete(id, tenantId);
  }
}
