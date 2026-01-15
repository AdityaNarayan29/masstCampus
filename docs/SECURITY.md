# Security & Production Best Practices

## Tenant Data Isolation

### Database Level

**Critical**: All queries MUST include `tenantId` filter.

✅ **Good**:
```typescript
const students = await prisma.student.findMany({
  where: { tenantId }, // Always filter by tenant
});
```

❌ **Bad**:
```typescript
const students = await prisma.student.findMany({}); // Exposes all tenants!
```

### Verification

Run this audit query to find students without proper isolation:

```sql
-- Check for queries missing tenantId
SELECT * FROM students WHERE tenant_id IS NULL;

-- Check for orphaned records
SELECT COUNT(*) FROM students s
LEFT JOIN tenants t ON s.tenant_id = t.id
WHERE t.id IS NULL;
```

### Testing Tenant Isolation

```typescript
// Test: User from tenant A cannot access tenant B data
describe('Tenant Isolation', () => {
  it('should not allow cross-tenant data access', async () => {
    const tenantAStudent = await createStudent({ tenantId: 'tenant-a' });
    const tenantBUser = { tenantId: 'tenant-b' };

    await expect(
      getStudent(tenantAStudent.id, tenantBUser.tenantId)
    ).rejects.toThrow();
  });
});
```

---

## Authentication

### JWT Best Practices

1. **Strong Secrets**:
   ```bash
   # Generate secure secret
   openssl rand -base64 64
   ```

2. **Token Expiry**:
   - Access tokens: 15 minutes - 1 hour
   - Refresh tokens: 7-30 days

3. **Token Storage**:
   - ✅ HttpOnly cookies (preferred)
   - ⚠️ LocalStorage (XSS risk)
   - ❌ SessionStorage (limited use)

### Clerk Integration

```typescript
// apps/frontend/src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
```

**Webhook for syncing users**:

```typescript
// apps/backend/src/auth/clerk-webhook.controller.ts
@Post('clerk-webhook')
async handleClerkWebhook(@Body() event: any) {
  if (event.type === 'user.created') {
    await prisma.user.create({
      data: {
        id: event.data.id,
        email: event.data.email_addresses[0].email_address,
        tenantId: event.data.public_metadata.tenantId,
        role: event.data.public_metadata.role,
      },
    });
  }
}
```

---

## CORS Configuration

### Backend

```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-Host', 'X-Tenant-ID'],
});
```

### Frontend

```typescript
// apps/frontend/next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL },
      ],
    },
  ];
}
```

---

## Rate Limiting

### Backend (NestJS)

```bash
pnpm add @nestjs/throttler
```

```typescript
// apps/backend/src/app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 10 requests per minute
    }),
  ],
})
```

### Nginx

```nginx
# nginx/nginx.conf
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

---

## Secrets Management

### Development

```bash
# .env (never commit!)
DATABASE_URL="postgresql://..."
JWT_SECRET="dev-secret"
```

### Production

**Use environment variables**:

1. **Vercel**: Dashboard → Settings → Environment Variables
2. **Render**: Dashboard → Environment → Add Variable
3. **Railway**: Dashboard → Variables

**Never hardcode secrets**:

❌ **Bad**:
```typescript
const secret = 'my-secret-key';
```

✅ **Good**:
```typescript
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET not configured');
```

---

## Input Validation

### Backend

Use class-validator:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### SQL Injection Prevention

✅ **Prisma automatically prevents SQL injection**:

```typescript
// Safe - Prisma uses parameterized queries
await prisma.user.findMany({
  where: { email: userInput },
});
```

❌ **Avoid raw queries**:
```typescript
// Dangerous if userInput is not sanitized
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

---

## XSS Prevention

### Frontend

```typescript
// React automatically escapes content
<div>{userInput}</div> // Safe

// Dangerous - only use with trusted content
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Unsafe!
```

### Content Security Policy

```typescript
// apps/frontend/next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
        },
      ],
    },
  ];
}
```

---

## Logging & Monitoring

### Audit Logs

```typescript
// Log all sensitive operations
await prisma.auditLog.create({
  data: {
    tenantId,
    userId,
    action: 'DELETE',
    resource: 'STUDENT',
    resourceId: studentId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});
```

### Error Handling

```typescript
// Don't expose internal errors to users
try {
  // ...
} catch (error) {
  console.error('Internal error:', error); // Log details
  throw new BadRequestException('An error occurred'); // Generic message
}
```

---

## Database Security

### Connection Security

```env
# Always use SSL in production
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Backup Strategy

```bash
# Automated backups (daily)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Retention: 30 days
```

### Migrations

```bash
# Never run migrations manually in production
# Use CI/CD pipeline instead

# GitHub Actions handles this:
pnpm prisma migrate deploy
```

---

## SSL/TLS

### Vercel

Automatic SSL for all domains.

### Self-Hosted

```bash
# Let's Encrypt
certbot --nginx -d portal.vidyamandir.com
```

### Enforce HTTPS

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

---

## Checklist

### Pre-Launch

- [ ] All secrets in environment variables (not code)
- [ ] SSL enabled for all domains
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Tenant isolation verified
- [ ] Database backups configured
- [ ] Error messages sanitized
- [ ] Audit logging enabled
- [ ] Authentication working
- [ ] Authorization checks in place

### Post-Launch

- [ ] Monitor error rates
- [ ] Review audit logs regularly
- [ ] Test disaster recovery
- [ ] Security updates applied
- [ ] Penetration testing done
- [ ] Compliance verified (GDPR, etc.)

---

## Incident Response

### Data Breach

1. Immediately revoke compromised credentials
2. Notify affected tenants within 72 hours (GDPR)
3. Review audit logs for extent of breach
4. Patch vulnerability
5. Document incident

### Service Outage

1. Check status of all services (DB, backend, frontend)
2. Review error logs
3. Rollback if recent deployment caused issue
4. Notify users via status page
5. Post-mortem after resolution

---

## Compliance

### GDPR

- [ ] Privacy policy published
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Consent management
- [ ] Data processing agreement with vendors

### FERPA (US Schools)

- [ ] Student data encrypted at rest and in transit
- [ ] Access logs for student records
- [ ] Parental consent for student data
- [ ] Annual security audit

---

## Regular Security Tasks

### Weekly

- Review error logs
- Check for failed login attempts
- Monitor API usage spikes

### Monthly

- Update dependencies (`pnpm update`)
- Review access permissions
- Audit new users

### Quarterly

- Security training for team
- Third-party security audit
- Disaster recovery test
- Review and update security policies
