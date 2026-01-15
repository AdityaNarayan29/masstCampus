import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from './tenant.service';

/**
 * TenantInterceptor extracts tenant information from request headers
 * and attaches it to the request object.
 *
 * Header priority:
 * 1. x-tenant-id (explicit tenant ID - for internal/testing)
 * 2. x-forwarded-host (set by reverse proxy/load balancer)
 * 3. host (standard HTTP host header)
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantService: TenantService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Skip tenant resolution for certain paths
    const skipPaths = ['/api/v1/health', '/api/v1/tenants/resolve'];
    if (skipPaths.some((path) => request.url.includes(path))) {
      return next.handle();
    }

    // Priority 1: Explicit tenant ID (for internal calls)
    const explicitTenantId = request.headers['x-tenant-id'];
    if (explicitTenantId) {
      try {
        const tenant = await this.tenantService.getTenantById(explicitTenantId);
        request.tenantId = tenant.id;
        request.tenant = tenant;
        return next.handle();
      } catch (error) {
        throw new BadRequestException(`Invalid tenant ID: ${explicitTenantId}`);
      }
    }

    // Priority 2 & 3: Resolve from host headers
    const forwardedHost = request.headers['x-forwarded-host'];
    const host = request.headers['host'];
    const targetHost = forwardedHost || host;

    if (!targetHost) {
      throw new BadRequestException('No tenant identifier provided (host header missing)');
    }

    const tenant = await this.tenantService.getTenantByHost(targetHost);

    if (!tenant) {
      throw new BadRequestException(`No tenant found for host: ${targetHost}`);
    }

    // Attach tenant info to request
    request.tenantId = tenant.id;
    request.tenant = tenant;

    return next.handle();
  }
}
