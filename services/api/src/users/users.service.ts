import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
