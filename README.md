# School CRM - Multi-Tenant Platform

A production-ready, multi-tenant School CRM system with custom domain support, broker hierarchy, and commission management.

## Features

- 🏢 **Multi-Tenancy**: Support for unlimited schools with custom domains & subdomains
- 🎨 **White-Label Theming**: Per-tenant branding (logo, colors) using shadcn + tweakcn
- 🔐 **Dual Auth**: JWT (self-hosted) or Clerk (managed) authentication
- 👥 **Broker Hierarchy**: Multi-level broker/agent structure with commission rules
- 💰 **Commission Management**: Automated commission calculation based on fee payments
- 📊 **Student Management**: Enrollments, grades, attendance, fees
- 🌐 **Custom Domains**: Full support via proxy/host-header pattern
- 🚀 **Production Ready**: Docker, CI/CD, monitoring, security best practices

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui + tweakcn
- Vercel (deployment)

### Backend
- NestJS
- Prisma (PostgreSQL)
- Passport + JWT
- Render/Railway (deployment)

### Infrastructure
- Turborepo (monorepo)
- Docker + docker-compose
- GitHub Actions (CI/CD)
- Nginx (reverse proxy)
- Neon/Supabase (database)

## Project Structure

```
school-crm-monorepo/
├── apps/
│   ├── frontend/          # Next.js app
│   └── backend/           # NestJS API
├── packages/
│   ├── ui/                # Shared components (shadcn)
│   ├── types/             # TypeScript types
│   └── config/            # Shared config
├── docs/                  # Documentation
├── nginx/                 # Nginx configs
└── docker-compose.yml     # Local development
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Docker (optional)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd school-crm-monorepo
pnpm install
```

### 2. Environment Setup

**Backend** (`apps/backend/.env`):

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_crm"
JWT_SECRET="your-super-secret-key"
FRONTEND_URL="http://localhost:3000"
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://portal.vidyamandir.local:3000"
```

**Frontend** (`apps/frontend/.env.local`):

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
BACKEND_URL="http://localhost:3001"
NEXT_PUBLIC_AUTH_MODE="jwt"
```

### 3. Database Setup

**Option A: Using Docker** (Recommended)

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Wait for DB to be ready (check logs)
docker-compose logs -f postgres
```

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL 15
brew install postgresql@15  # macOS
# or
sudo apt install postgresql-15  # Ubuntu

# Create database
createdb school_crm
```

### 4. Run Migrations & Seed

```bash
cd apps/backend

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database
pnpm prisma db seed
```

**Seed creates**:
- 2 tenants (Vidyamandir, Demo School)
- 4 brokers (hierarchy)
- 4 users (admin, broker, teacher)
- 3 students
- 2 teachers, 2 classes
- 3 fees, 2 payments
- 3 commission records

### 5. Start Development Servers

**Option A: Using Turborepo** (Recommended)

```bash
# From root directory
pnpm turbo run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Option B: Manually**

Terminal 1 (Backend):
```bash
cd apps/backend
pnpm dev
```

Terminal 2 (Frontend):
```bash
cd apps/frontend
pnpm dev
```

### 6. Test the Application

Visit: http://localhost:3000

---

## Local Testing with Custom Domains

### 1. Edit `/etc/hosts`

```bash
sudo nano /etc/hosts
```

Add:

```
127.0.0.1 portal.vidyamandir.local
127.0.0.1 demo.school-crm.local
```

### 2. Test with Browser

Visit:
- http://portal.vidyamandir.local:3000
- http://demo.school-crm.local:3000

You should see different tenants with different themes!

### 3. Test with curl

```bash
# Test tenant resolution
curl -H "Host: portal.vidyamandir.local" http://localhost:3000/

# Test API
curl -H "X-Forwarded-Host: portal.vidyamandir.local" \
     http://localhost:3001/api/v1/tenants/resolve
```

---

## Running with Docker

### Full Stack (PostgreSQL + Backend + Frontend)

```bash
# Build and start all services
docker-compose up --build

# In detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Services:
- PostgreSQL: localhost:5432
- Backend: localhost:3001
- Frontend: (run separately for hot reload)

### Backend Only

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Start backend
docker-compose up backend -d
```

---

## Database Management

### Prisma Studio (GUI)

```bash
cd apps/backend
pnpm prisma studio
```

Opens: http://localhost:5555

### Common Commands

```bash
# Create migration
pnpm prisma migrate dev --name add_new_field

# Reset database (⚠️  DESTRUCTIVE)
pnpm prisma migrate reset

# View current schema
pnpm prisma db pull

# Re-seed
pnpm prisma db seed

# Check migration status
pnpm prisma migrate status
```

---

## Development Workflow

### Running Tests

```bash
# All tests
pnpm turbo run test

# Backend only
cd apps/backend
pnpm test

# Frontend only
cd apps/frontend
pnpm test
```

### Linting

```bash
# Lint all
pnpm turbo run lint

# Auto-fix
pnpm turbo run lint -- --fix
```

### Type Checking

```bash
# Build all packages (checks types)
pnpm turbo run build
```

### Format Code

```bash
pnpm format
```

---

## Authentication

### JWT (Default)

**Login**:

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vidyamandir.com",
    "password": "admin123",
    "tenantId": "<TENANT_ID>"
  }'
```

**Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

**Use token**:

```bash
curl http://localhost:3001/api/v1/students \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "X-Forwarded-Host: portal.vidyamandir.local"
```

### Clerk (Optional)

1. Sign up at [clerk.com](https://clerk.com)
2. Create application
3. Copy keys to `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_ENABLE_CLERK="true"
```

4. Wrap app in ClerkProvider (see docs)

---

## API Endpoints

### Tenants

```bash
# Resolve tenant by host
GET /api/v1/tenants/resolve
Headers: x-forwarded-host: portal.vidyamandir.com

# List all tenants
GET /api/v1/tenants
```

### Students

```bash
# List students (auto-filtered by tenant)
GET /api/v1/students
Headers: x-forwarded-host: portal.vidyamandir.local

# Get student by ID
GET /api/v1/students/:id

# Create student
POST /api/v1/students
Body: { firstName, lastName, enrollmentNumber, gradeLevel, ... }
```

### Brokers

```bash
# List brokers
GET /api/v1/brokers

# Get broker hierarchy
GET /api/v1/brokers/:id/hierarchy
```

### Commission

```bash
# Calculate commission for payment
POST /api/v1/commission/calculate/:paymentId

# Create commission records
POST /api/v1/commission/create/:paymentId

# Get broker commissions
GET /api/v1/commission/broker/:brokerId?status=PENDING
```

---

## Deployment

### 1. Deploy Database

**Neon** (Recommended):

1. Sign up at [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

**Supabase**:

1. Sign up at [supabase.com](https://supabase.com)
2. Create project
3. Go to Settings → Database → Connection string

### 2. Deploy Backend

**Render**:

1. Connect GitHub repo
2. Create Web Service
3. Root directory: `apps/backend`
4. Build: `pnpm install && cd apps/backend && pnpm prisma generate && pnpm build`
5. Start: `cd apps/backend && pnpm start:prod`
6. Add env vars (see [DEPLOYMENT.md](docs/DEPLOYMENT.md))

**Railway**:

```bash
cd apps/backend
railway login
railway init
railway up
```

### 3. Deploy Frontend

**Vercel**:

```bash
cd apps/frontend
vercel
```

Or connect GitHub repo in Vercel dashboard.

### 4. Run Migrations

```bash
# SSH to backend or use dashboard shell
cd apps/backend
pnpm prisma migrate deploy
pnpm prisma db seed  # Optional: seed data
```

### 5. Add Custom Domains

**Vercel**:

1. Project Settings → Domains
2. Add domain: `portal.vidyamandir.com`
3. Update DNS as instructed

**Via API**:

```bash
curl -X POST https://api.vercel.com/v9/projects/$PROJECT_ID/domains \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"name": "portal.vidyamandir.com"}'
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full guide.

---

## Monitoring & Logs

### Frontend (Vercel)

```bash
vercel logs
vercel logs --follow  # Real-time
```

### Backend (Render)

- View in Render dashboard
- Or use Render CLI

### Database (Neon)

- Query insights in Neon dashboard
- Set up alerts for slow queries

---

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Tenant Not Found

- Check `/etc/hosts` for local domains
- Verify tenant exists in database:
  ```sql
  SELECT * FROM tenants;
  ```
- Check `primaryDomain` and `subdomain` match

### CORS Errors

- Verify `CORS_ALLOWED_ORIGINS` includes your domain
- Check frontend URL in backend `.env`

### Prisma Errors

```bash
# Regenerate client
cd apps/backend
pnpm prisma generate

# Reset and re-migrate
pnpm prisma migrate reset
```

---

## Seeded Credentials

### Vidyamandir Tenant

- **Admin**: admin@vidyamandir.com / admin123
- **Broker**: broker@vidyamandir.com / broker123
- **Teacher**: teacher@vidyamandir.com / teacher123

### Demo Tenant

- **Admin**: admin@demo.com / demo123

### Tenant Info

```typescript
// Vidyamandir
{
  subdomain: "portal.vidyamandir",
  primaryDomain: "portal.vidyamandir.com"
}

// Demo School
{
  subdomain: "demo",
  primaryDomain: "demo.school-crm.com"
}
```

---

## Project Commands

### Root

```bash
pnpm install              # Install all dependencies
pnpm turbo run dev        # Start all apps in dev mode
pnpm turbo run build      # Build all apps
pnpm turbo run test       # Run all tests
pnpm turbo run lint       # Lint all code
pnpm format               # Format code with Prettier
```

### Backend

```bash
cd apps/backend
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm start                # Start production server
pnpm test                 # Run tests
pnpm prisma:generate      # Generate Prisma client
pnpm prisma:migrate       # Run migrations
pnpm prisma:seed          # Seed database
pnpm prisma:studio        # Open Prisma Studio
```

### Frontend

```bash
cd apps/frontend
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm start                # Start production server
pnpm lint                 # Lint code
```

### Packages

```bash
cd packages/ui
pnpm build                # Build package
pnpm dev                  # Watch mode
```

---

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Best Practices](docs/SECURITY.md)

---

## Key Features Explained

### 1. Tenant Resolution

**How it works**:

1. User visits `portal.vidyamandir.com`
2. Request includes `Host: portal.vidyamandir.com`
3. Nginx/Vercel adds `X-Forwarded-Host: portal.vidyamandir.com`
4. Next.js middleware reads header
5. Queries backend: `GET /api/v1/tenants/resolve`
6. Backend matches `primaryDomain` or `subdomain`
7. Returns tenant config + theme
8. App renders with tenant branding

**Priority**:
1. `x-forwarded-host` (from proxy)
2. `host` (direct)
3. `x-tenant-id` (explicit override)

### 2. Commission Calculation

**Flow**:

1. Payment created for student
2. Get student's broker (who enrolled them)
3. Traverse broker hierarchy: Agent → Sub-Broker → Top Broker
4. For each broker, find applicable commission rule
5. Rules matched by: level, fee type, amount range
6. Calculate: `commission = payment.amount * rule.percentage / 100`
7. Create commission records for each broker

**Example**:

```
Payment: ₹50,000 (tuition fee)
Student enrolled by: Agent (level 2)

Commissions:
- Agent (5% on ₹50k) = ₹2,500
- Sub-Broker (3.5% on ₹50k) = ₹1,750
- Top Broker (2% on ₹50k) = ₹1,000
Total: ₹5,250
```

### 3. White-Label Theming

Each tenant can customize:

```typescript
{
  logo: "https://tenant.com/logo.svg",
  colors: {
    primary: "hsl(221 83% 53%)",      // Blue for Vidyamandir
    // or
    primary: "hsl(142 76% 36%)",      // Green for Demo School
    ...
  },
  fonts: {
    heading: "Poppins, sans-serif",
    body: "Inter, sans-serif"
  }
}
```

Applied via CSS variables in `ThemeProvider`.

---

## Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong `JWT_SECRET` (64+ chars random)
- [ ] Enable SSL/HTTPS for all domains
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ALLOWED_ORIGINS` (no wildcards)
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Review audit logs regularly
- [ ] Test tenant data isolation

See [SECURITY.md](docs/SECURITY.md) for full checklist.

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file

---

## Support

- 📧 Email: support@your-company.com
- 📚 Docs: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

## Roadmap

- [ ] Role-based access control (RBAC)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced reporting & analytics
- [ ] Mobile app (React Native)
- [ ] Automated email/SMS notifications
- [ ] Payment gateway integration
- [ ] Parent portal
- [ ] Attendance via QR code
- [ ] Microservices architecture (future)

---

## Credits

Built with:
- [Next.js](https://nextjs.org)
- [NestJS](https://nestjs.com)
- [Prisma](https://prisma.io)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Turborepo](https://turbo.build)

---

**Happy coding! 🚀**
