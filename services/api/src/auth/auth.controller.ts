import { Controller, Post, Body, Get, Request, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantService } from '../tenant/tenant.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantService: TenantService
  ) {}

  /**
   * Login endpoint (JWT)
   * Resolves tenant from host header
   */
  @Public()
  @Post('login')
  async login(
    @Body() body: { email: string; password: string; tenantId?: string },
    @Headers('x-forwarded-host') forwardedHost?: string,
    @Headers('host') host?: string
  ) {
    // Resolve tenant from host header if not provided (treat empty string as not provided)
    let tenantId = body.tenantId && body.tenantId.trim() !== '' ? body.tenantId : undefined;

    if (!tenantId) {
      const targetHost = forwardedHost || host;
      if (targetHost) {
        const tenant = await this.tenantService.getTenantByHost(targetHost);
        if (tenant) {
          tenantId = tenant.id;
        }
      }
    }

    if (!tenantId) {
      throw new HttpException(
        { success: false, message: 'Unable to determine tenant' },
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this.authService.login(body.email, body.password, tenantId);
    return { success: true, data: result };
  }

  /**
   * Register endpoint (JWT)
   */
  @Public()
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      tenantId: string;
    }
  ) {
    const result = await this.authService.register(body);
    return { success: true, data: result };
  }

  /**
   * Get current user profile
   */
  @Get('me')
  async getProfile(@Request() req: any) {
    return { success: true, data: req.user };
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  async refreshToken(@Request() req: any) {
    const result = await this.authService.refreshToken(req.user.sub);
    return { success: true, data: result };
  }

  /**
   * Logout endpoint
   */
  @Post('logout')
  async logout(@Request() req: any) {
    const result = await this.authService.logout(req.user.sub);
    return { success: true, data: result };
  }

  /**
   * Clerk webhook endpoint (optional - for Clerk integration)
   */
  @Public()
  @Post('clerk-webhook')
  async clerkWebhook(@Body() body: any) {
    // Handle Clerk user creation/update events
    // Create/update user in your database
    // This is called by Clerk when users sign up via Clerk
    console.log('Clerk webhook received:', body);
    return { success: true };
  }
}
