import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, userRole?: string) {
    return this.prisma.notification.findMany({
      where: {
        tenantId,
        ...(userRole && { targetRole: { has: userRole } }),
      },
      orderBy: { createdAt: 'desc' },
      include: { creator: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.notification.findFirst({
      where: { id, tenantId },
      include: { creator: true },
    });
  }

  async create(data: any, tenantId: string, createdBy: string) {
    return this.prisma.notification.create({
      data: {
        ...data,
        tenantId,
        createdBy,
      },
      include: { creator: true },
    });
  }

  async markAsRead(id: string, userId: string, tenantId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, tenantId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    const readBy = notification.readBy as string[];
    if (readBy.includes(userId)) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        readBy: [...readBy, userId],
      },
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
