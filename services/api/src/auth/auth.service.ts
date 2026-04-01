import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenBlacklist: TokenBlacklistService,
  ) {}

  async login(email: string, password: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      jti: randomUUID(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role as any,
        tenantId: data.tenantId,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        isActive: true,
      },
    });

    const payload = {
      sub: user.id,
      jti: randomUUID(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload = {
      sub: user.id,
      jti: randomUUID(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async logout(token: string) {
    try {
      const payload = this.jwtService.decode(token) as any;
      if (payload?.jti && payload?.exp) {
        this.tokenBlacklist.blacklist(payload.jti, payload.exp);
      }
    } catch {
      // Token may be malformed, still return success
    }
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(email: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, tenantId, isActive: true },
    });

    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'reset' },
      { secret: (process.env.JWT_SECRET || 'change-me-in-production') + '-reset', expiresIn: '1h' },
    );

    // In production, send this token via email
    return { message: 'If an account exists, a reset link has been sent', resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: (process.env.JWT_SECRET || 'change-me-in-production') + '-reset',
      });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'reset') {
      throw new BadRequestException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    return { message: 'Password reset successful' };
  }
}
