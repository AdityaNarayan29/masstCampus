import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-production',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account disabled');
    }

    // Cross-check tenant: ensure user belongs to the requested tenant
    // SUPER_ADMIN can access any tenant
    if (user.role !== 'SUPER_ADMIN' && req.tenantId && user.tenantId !== req.tenantId) {
      throw new UnauthorizedException('Tenant mismatch');
    }

    return user;
  }
}
