import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.parentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        children: true,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.parentProfile.findFirst({
      where: { id, tenantId },
      include: {
        user: true,
        children: true,
      },
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.parentProfile.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        user: true,
        children: true,
      },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    return this.prisma.parentProfile.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.parentProfile.delete({
      where: { id },
    });
  }
}
