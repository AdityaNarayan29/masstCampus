import { Controller, Get, Post, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TenantId } from '../tenant/tenant.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@TenantId() tenantId: string, @Query('role') role?: string) {
    return this.notificationsService.findAll(tenantId, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.notificationsService.findOne(id, tenantId);
  }

  @Post()
  create(@Body() data: any, @TenantId() tenantId: string, @Body('createdBy') createdBy: string) {
    return this.notificationsService.create(data, tenantId, createdBy);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Body('userId') userId: string, @TenantId() tenantId: string) {
    return this.notificationsService.markAsRead(id, userId, tenantId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.notificationsService.delete(id, tenantId);
  }
}
