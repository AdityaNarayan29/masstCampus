import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint (JWT)
   */
  @Post('login')
  async login(@Body() body: { email: string; password: string; tenantId: string }) {
    const result = await this.authService.login(body.email, body.password, body.tenantId);
    return { success: true, data: result };
  }

  /**
   * Register endpoint (JWT)
   */
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
   * Clerk webhook endpoint (optional - for Clerk integration)
   */
  @Post('clerk-webhook')
  async clerkWebhook(@Body() body: any) {
    // Handle Clerk user creation/update events
    // Create/update user in your database
    // This is called by Clerk when users sign up via Clerk
    console.log('Clerk webhook received:', body);
    return { success: true };
  }
}
