import { Controller, Post, Body, Get, Request, Headers, HttpException, HttpStatus, Req, UnauthorizedException } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TenantService } from '../tenant/tenant.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantService: TenantService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(
    @Body() body: { email: string; password: string; tenantId?: string },
    @Headers('x-forwarded-host') forwardedHost?: string,
    @Headers('x-tenant-subdomain') subdomain?: string,
    @Headers('host') host?: string,
  ) {
    let tenantId = body.tenantId && body.tenantId.trim() !== '' ? body.tenantId : undefined;

    // Try subdomain resolution first
    if (!tenantId && subdomain) {
      const tenant = await this.tenantService.getTenantBySubdomain(subdomain);
      if (tenant) tenantId = tenant.id;
    }

    // Then try host-based resolution
    if (!tenantId) {
      const targetHost = forwardedHost || host;
      if (targetHost) {
        const tenant = await this.tenantService.getTenantByHost(targetHost);
        if (tenant) tenantId = tenant.id;
      }
    }

    if (!tenantId) {
      throw new HttpException('Unable to determine tenant', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.login(body.email, body.password, tenantId);
    return { success: true, data: result };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(
    @Body() body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      tenantId: string;
    },
  ) {
    const result = await this.authService.register(body);
    return { success: true, data: result };
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    return { success: true, data: req.user };
  }

  @Post('refresh')
  async refreshToken(@Request() req: any) {
    const result = await this.authService.refreshToken(req.user.sub);
    return { success: true, data: result };
  }

  @Post('logout')
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await this.authService.logout(token || '');
    return { success: true, data: result };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: { email: string; tenantId?: string },
    @Headers('x-forwarded-host') forwardedHost?: string,
    @Headers('host') host?: string,
  ) {
    let tenantId = body.tenantId;

    if (!tenantId) {
      const targetHost = forwardedHost || host;
      if (targetHost) {
        const tenant = await this.tenantService.getTenantByHost(targetHost);
        if (tenant) tenantId = tenant.id;
      }
    }

    if (!tenantId) {
      // Don't reveal tenant resolution failure
      return { success: true, data: { message: 'If an account exists, a reset link has been sent' } };
    }

    const result = await this.authService.requestPasswordReset(body.email, tenantId);
    return { success: true, data: result };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const result = await this.authService.resetPassword(body.token, body.newPassword);
    return { success: true, data: result };
  }

  @Public()
  @SkipThrottle()
  @Post('clerk-webhook')
  async clerkWebhook(@Body() body: any, @Req() req: any) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (webhookSecret) {
      try {
        const { Webhook } = await import('svix');
        const wh = new Webhook(webhookSecret);
        wh.verify(JSON.stringify(body), {
          'svix-id': req.headers['svix-id'] as string,
          'svix-timestamp': req.headers['svix-timestamp'] as string,
          'svix-signature': req.headers['svix-signature'] as string,
        });
      } catch {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    console.log('Clerk webhook received:', body.type);
    return { success: true };
  }
}
