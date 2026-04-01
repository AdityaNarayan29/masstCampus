import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.teacher.findMany({
      where: { tenantId, isActive: true },
      include: { classes: true },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.teacher.findFirst({
      where: { id, tenantId, isActive: true },
      include: { classes: true },
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.teacher.create({
      data: {
        ...data,
        tenantId,
      },
      include: { classes: true },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    return this.prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
