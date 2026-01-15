# Complete Folder Structure

```
school-crm-monorepo/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                    # GitHub Actions CI/CD pipeline
│
├── apps/
│   ├── backend/                         # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Database schema
│   │   │   └── seed.ts                  # Database seeding script
│   │   ├── src/
│   │   │   ├── app.module.ts            # Root module
│   │   │   ├── main.ts                  # Entry point
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts    # Prisma client
│   │   │   ├── tenant/
│   │   │   │   ├── tenant.module.ts
│   │   │   │   ├── tenant.service.ts    # Tenant resolution logic
│   │   │   │   ├── tenant.controller.ts
│   │   │   │   ├── tenant.interceptor.ts # Tenant context injection
│   │   │   │   └── tenant.decorator.ts  # @TenantId(), @CurrentTenant()
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts      # JWT + Clerk auth
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── students/
│   │   │   │   ├── students.module.ts
│   │   │   │   ├── students.service.ts  # Student CRUD
│   │   │   │   └── students.controller.ts
│   │   │   ├── brokers/
│   │   │   │   ├── brokers.module.ts
│   │   │   │   ├── brokers.service.ts   # Broker hierarchy
│   │   │   │   └── brokers.controller.ts
│   │   │   ├── commission/
│   │   │   │   ├── commission.module.ts
│   │   │   │   ├── commission.service.ts # Commission calculation
│   │   │   │   └── commission.controller.ts
│   │   │   ├── fees/
│   │   │   │   └── fees.module.ts
│   │   │   └── attendance/
│   │   │       └── attendance.module.ts
│   │   ├── .env.example                 # Environment template
│   │   ├── Dockerfile                   # Docker build config
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                        # Next.js frontend
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx           # Root layout (with ThemeProvider)
│       │   │   ├── page.tsx             # Home page
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx         # Dashboard
│       │   │   ├── tenant-not-found/
│       │   │   │   └── page.tsx         # Error page
│       │   │   └── globals.css          # Global styles
│       │   ├── lib/
│       │   │   ├── tenant.ts            # getTenantByHost()
│       │   │   └── api.ts               # API client (axios)
│       │   └── middleware.ts            # Tenant resolution middleware
│       ├── .env.example                 # Environment template
│       ├── Dockerfile                   # Docker build config
│       ├── next.config.js
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                              # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx           # shadcn button
│   │   │   │   ├── Card.tsx             # shadcn card
│   │   │   │   ├── Header.tsx           # Custom header with tenant theme
│   │   │   │   └── ThemeProvider.tsx    # CSS variable injection
│   │   │   ├── lib/
│   │   │   │   └── utils.ts             # cn() helper
│   │   │   ├── styles/
│   │   │   │   └── globals.css          # Base styles
│   │   │   └── index.ts                 # Exports
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── types/                           # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts                 # All types (Tenant, User, etc.)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                          # Shared configuration
│       ├── src/
│       │   └── index.ts                 # Feature flags, defaults
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── ARCHITECTURE.md                  # System architecture
│   ├── DEPLOYMENT.md                    # Deployment guide
│   └── SECURITY.md                      # Security best practices
│
├── nginx/
│   └── nginx.conf                       # Reverse proxy config
│
├── .eslintrc.js                         # ESLint config
├── .gitignore
├── .prettierrc                          # Prettier config
├── docker-compose.yml                   # Docker orchestration
├── FOLDER_STRUCTURE.md                  # This file
├── package.json                         # Root package.json
├── pnpm-workspace.yaml                  # pnpm workspace config
├── README.md                            # Main documentation
└── turbo.json                           # Turborepo config
```

## Key Files Explained

### Root Configuration

- **`turbo.json`**: Turborepo pipeline configuration (build order, caching)
- **`pnpm-workspace.yaml`**: Defines workspace packages
- **`docker-compose.yml`**: Local development environment

### Backend

- **`apps/backend/prisma/schema.prisma`**:
  - All database models
  - Multi-tenant schema with `tenantId` on every table
  - Broker hierarchy (self-referencing)
  - Commission rules and calculations

- **`apps/backend/src/tenant/tenant.interceptor.ts`**:
  - Extracts `x-forwarded-host` or `host` header
  - Resolves tenant from database
  - Injects `tenantId` into request context

- **`apps/backend/src/commission/commission.service.ts`**:
  - Commission calculation algorithm
  - Traverses broker hierarchy
  - Matches commission rules

### Frontend

- **`apps/frontend/src/middleware.ts`**:
  - Edge middleware (runs on Vercel Edge)
  - Resolves tenant by calling backend
  - Adds `x-tenant-id` header

- **`apps/frontend/src/lib/tenant.ts`**:
  - Server-side tenant resolution
  - Used in `layout.tsx` to load theme

- **`apps/frontend/src/app/layout.tsx`**:
  - Wraps app with `ThemeProvider`
  - Applies tenant-specific CSS variables

### Packages

- **`packages/ui/src/components/ThemeProvider.tsx`**:
  - Injects CSS variables from tenant theme
  - Updates `<html>` element style

- **`packages/types/src/index.ts`**:
  - TypeScript interfaces for all entities
  - Shared between frontend and backend

- **`packages/config/src/index.ts`**:
  - Default theme
  - Feature flags
  - Commission config

## Total Files Created

- **Backend**: ~20 files
- **Frontend**: ~15 files
- **Packages**: ~15 files
- **Config/Docs**: ~10 files
- **Total**: ~60 files

All files are production-ready and runnable.
