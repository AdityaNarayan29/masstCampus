import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { TenantId } from '../tenant/tenant.decorator';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.parentsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.parentsService.findOne(id, tenantId);
  }

  @Post()
  create(@Body() data: any, @TenantId() tenantId: string) {
    return this.parentsService.create(data, tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any, @TenantId() tenantId: string) {
    return this.parentsService.update(id, data, tenantId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.parentsService.delete(id, tenantId);
  }
}
