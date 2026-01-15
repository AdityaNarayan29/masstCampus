import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.teacherProfile.findMany({
      where: { tenantId },
      include: { user: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.teacherProfile.findFirst({
      where: { id, tenantId },
      include: { user: true },
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.teacherProfile.create({
      data: {
        ...data,
        tenantId,
      },
      include: { user: true },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    return this.prisma.teacherProfile.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.teacherProfile.delete({
      where: { id },
    });
  }
}
