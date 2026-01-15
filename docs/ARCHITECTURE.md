# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ portal.vid.. │  │ demo.school  │  │ Custom Domain│      │
│  │ .com         │  │ -crm.com     │  │ s            │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │      REVERSE PROXY (Optional)       │
          │  - Nginx / Vercel / Cloudflare      │
          │  - Preserves X-Forwarded-Host       │
          └──────────────┬─────────────┬────────┘
                         │             │
         ┌───────────────▼────┐   ┌────▼────────────────┐
         │  FRONTEND (Next.js)│   │ BACKEND (NestJS)    │
         │  - App Router      │   │ - REST API          │
         │  - Tenant Resolver │   │ - Tenant Context    │
         │  - Theme Provider  │   │ - Prisma ORM        │
         └────────────────────┘   └─────────┬───────────┘
                                            │
                                   ┌────────▼─────────┐
                                   │  DATABASE        │
                                   │  - PostgreSQL    │
                                   │  - Shared Schema │
                                   │  - tenantId col  │
                                   └──────────────────┘
```

---

## Tenant Resolution Flow

```
1. User visits: portal.vidyamandir.com
                     │
2. Request hits Nginx/Vercel
                     │
3. X-Forwarded-Host: portal.vidyamandir.com
                     │
4. Next.js Middleware reads header
                     │
5. Calls Backend: GET /api/v1/tenants/resolve
                     │
6. Backend queries DB:
   SELECT * FROM tenants
   WHERE primaryDomain = 'portal.vidyamandir.com'
   OR subdomain = 'portal.vidyamandir'
                     │
7. Returns Tenant { id, name, theme, config }
                     │
8. Next.js injects x-tenant-id header
                     │
9. App renders with tenant theme
```

---

## Multi-Tenancy Strategy

### Shared Database (Current)

**Why Chosen**:
- ✅ Simpler development and deployment
- ✅ Easy cross-tenant reporting
- ✅ Cost-effective for small-medium tenants
- ✅ Single migration process

**How It Works**:

Every table has a `tenantId` column:

```prisma
model Student {
  id       String @id
  tenantId String  // Ensures data isolation
  // ...

  @@index([tenantId])
}
```

All queries **must** include `tenantId`:

```typescript
// ✅ Correct
const students = await prisma.student.findMany({
  where: { tenantId },
});

// ❌ Wrong - returns all tenants!
const students = await prisma.student.findMany({});
```

### When to Migrate to Per-Tenant DB

Consider separate databases when:

1. **Scale**: Tenant has 50,000+ records
2. **Compliance**: Strict data residency requirements
3. **Performance**: Queries slow due to shared indexes
4. **Isolation**: Customer demands dedicated infrastructure

**Migration Path**:

```
Phase 1: Shared DB (Current)
   ↓
Phase 2: Read Replicas per Tenant
   ↓
Phase 3: Separate DB per Large Tenant
   ↓
Phase 4: Database per Tenant (All)
```

---

## Technology Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Component library)
- **tweakcn** (Theme customization)

### Backend

- **NestJS** (Node.js framework)
- **Prisma** (ORM)
- **PostgreSQL** (Database)
- **Passport + JWT** (Auth)
- **Clerk** (Optional managed auth)

### Infrastructure

- **Vercel** (Frontend hosting)
- **Render/Railway** (Backend hosting)
- **Neon/Supabase** (Managed PostgreSQL)
- **GitHub Actions** (CI/CD)

---

## Monorepo Structure

```
school-crm-monorepo/
├── apps/
│   ├── frontend/          # Next.js app
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── lib/       # Utilities (tenant resolver, API client)
│   │   │   └── middleware.ts  # Tenant resolution
│   │   └── package.json
│   │
│   └── backend/           # NestJS app
│       ├── src/
│       │   ├── tenant/    # Tenant module
│       │   ├── auth/      # Authentication
│       │   ├── students/  # Student management
│       │   ├── brokers/   # Broker hierarchy
│       │   └── commission/# Commission calculation
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   ├── ui/                # Shared React components
│   ├── types/             # TypeScript types
│   └── config/            # Shared configuration
│
├── docs/                  # Documentation
├── nginx/                 # Nginx configs
├── .github/workflows/     # CI/CD
└── docker-compose.yml     # Local development
```

---

## Data Flow

### Create Student

```
Frontend                Backend                  Database
   │                       │                        │
   │  POST /api/students   │                        │
   ├──────────────────────>│                        │
   │  Headers:              │                        │
   │   X-Forwarded-Host     │                        │
   │                        │                        │
   │                   ┌────┴────┐                  │
   │                   │ Tenant  │                  │
   │                   │ Context │                  │
   │                   │ Resolver│                  │
   │                   └────┬────┘                  │
   │                        │                        │
   │                        │  INSERT INTO students  │
   │                        │  (tenantId, ...)       │
   │                        ├───────────────────────>│
   │                        │                        │
   │                        │  <─── Student record   │
   │                        │<───────────────────────┤
   │                        │                        │
   │  <─── { success, data }│                        │
   │<───────────────────────┤                        │
   │                        │                        │
```

### Commission Calculation

```
Payment Created
   │
   ▼
CommissionService.calculateCommissionForPayment()
   │
   ├─> Get Student → Get Broker
   │
   ├─> Traverse Broker Hierarchy
   │   (Agent → Sub-Broker → Top Broker)
   │
   ├─> For Each Broker:
   │   │
   │   ├─> Find Applicable Commission Rule
   │   │   (match by level, fee type, amount)
   │   │
   │   ├─> Calculate Commission
   │   │   (amount * percentage / 100)
   │   │
   │   └─> Create Commission Record
   │
   └─> Return Commission Summary
```

---

## Scaling Strategy

### Current Architecture (Phase 1)

- Single Next.js app (Vercel)
- Single NestJS app (Render)
- Single PostgreSQL (Neon)

**Suitable for**: Up to 10,000 students, 100 tenants

### Phase 2: Horizontal Scaling

```
┌─────────────────────────────────────┐
│  Vercel (Auto-scales frontend)      │
└─────────────────────────────────────┘
                  │
┌─────────────────▼─────────────────┐
│  Load Balancer                    │
└─────────────────┬─────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
  ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
  │Backend│   │Backend│   │Backend│
  │ Pod 1 │   │ Pod 2 │   │ Pod 3 │
  └───┬───┘   └───┬───┘   └───┬───┘
      └───────────┼───────────┘
                  │
          ┌───────▼────────┐
          │  PostgreSQL    │
          │  (Read Replica)│
          └────────────────┘
```

**Tools**: Kubernetes, Docker, Redis cache

### Phase 3: Microservices

Split into specialized services:

```
┌────────────┐   ┌────────────┐   ┌────────────┐
│  Student   │   │ Commission │   │  Payout    │
│  Service   │   │  Service   │   │  Service   │
└────────────┘   └────────────┘   └────────────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
              ┌────────▼────────┐
              │  Message Queue  │
              │  (RabbitMQ)     │
              └─────────────────┘
```

**Services to Extract First**:

1. **Commission Calculation**: CPU-intensive, async
2. **Notifications**: Email/SMS sending
3. **Reporting**: Heavy analytics queries

### Phase 4: Per-Tenant Databases

For tenants with strict isolation needs:

```typescript
// Dynamic database connection per tenant
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getTenantDatabaseUrl(tenantId),
    },
  },
});
```

---

## Performance Optimization

### Database

1. **Indexes**:
   ```prisma
   @@index([tenantId])
   @@index([tenantId, gradeLevel])
   ```

2. **Query Optimization**:
   ```typescript
   // ✅ Use select to fetch only needed fields
   const students = await prisma.student.findMany({
     where: { tenantId },
     select: { id: true, firstName: true, lastName: true },
   });
   ```

3. **Pagination**:
   ```typescript
   const students = await prisma.student.findMany({
     where: { tenantId },
     skip: (page - 1) * limit,
     take: limit,
   });
   ```

### Caching

```typescript
// Redis cache for tenant configs
const tenant = await redis.get(`tenant:${host}`);
if (!tenant) {
  tenant = await prisma.tenant.findFirst({ where: { subdomain: host } });
  await redis.set(`tenant:${host}`, JSON.stringify(tenant), 'EX', 3600);
}
```

### CDN

Static assets served via Vercel CDN automatically.

---

## Security Architecture

### Authentication Flow (JWT)

```
1. User submits login (email, password, tenantId)
                │
2. Backend validates credentials
                │
3. Generates JWT with payload:
   { sub: userId, tenantId, role, email }
                │
4. Returns JWT to client
                │
5. Client stores in localStorage/cookie
                │
6. Subsequent requests include:
   Authorization: Bearer <jwt>
                │
7. Backend verifies JWT and extracts user info
```

### Tenant Isolation

All database queries automatically filtered:

```typescript
// Prisma middleware
prisma.$use(async (params, next) => {
  if (params.model && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      tenantId: currentTenantId,
    };
  }
  return next(params);
});
```

---

## Monitoring & Observability

### Logs

- **Frontend**: Vercel logs
- **Backend**: Render logs + custom logger
- **Database**: Neon query insights

### Metrics

Track:
- Request latency
- Error rates
- Active users per tenant
- Database query performance

### Alerts

Set up alerts for:
- API error rate > 5%
- Response time > 2s
- Database connections > 80%
- Disk usage > 85%

---

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups (30-day retention)
- **Code**: Git (always recoverable)
- **Secrets**: Stored in platform (Vercel, Render)

### Recovery Time Objective (RTO)

- **Database**: < 1 hour (restore from backup)
- **Application**: < 15 minutes (redeploy from Git)

### Testing

Quarterly disaster recovery drills.
