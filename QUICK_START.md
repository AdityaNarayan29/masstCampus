# Quick Start Guide

Get the School CRM running in 5 minutes!

## Prerequisites

```bash
# Check versions
node --version   # Should be 18+
pnpm --version   # Should be 8+
docker --version # Optional but recommended
```

## Installation

```bash
# 1. Install dependencies (from project root)
pnpm install

# 2. Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Start PostgreSQL with Docker
docker-compose up postgres -d

# 4. Run migrations and seed
cd apps/backend
pnpm prisma migrate dev
pnpm prisma db seed
cd ../..

# 5. Start all services
pnpm turbo run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Prisma Studio**: `cd apps/backend && pnpm prisma studio`

## Test with Custom Domains

```bash
# 1. Edit /etc/hosts
sudo nano /etc/hosts

# Add:
127.0.0.1 portal.vidyamandir.local
127.0.0.1 demo.school-crm.local

# 2. Visit in browser
# http://portal.vidyamandir.local:3000
# http://demo.school-crm.local:3000
```

## Login Credentials

### Vidyamandir Tenant
- Admin: admin@vidyamandir.com / admin123
- Broker: broker@vidyamandir.com / broker123
- Teacher: teacher@vidyamandir.com / teacher123

### Demo Tenant
- Admin: admin@demo.com / demo123

## Test API

```bash
# Get tenant info
curl -H "X-Forwarded-Host: portal.vidyamandir.local" \
     http://localhost:3001/api/v1/tenants/resolve

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vidyamandir.com",
    "password": "admin123",
    "tenantId": "YOUR_TENANT_ID"
  }'

# Get students (after login)
curl http://localhost:3001/api/v1/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Forwarded-Host: portal.vidyamandir.local"
```

## Common Commands

```bash
# Start dev servers
pnpm turbo run dev

# Build for production
pnpm turbo run build

# Run tests
pnpm turbo run test

# Lint code
pnpm turbo run lint

# Format code
pnpm format

# Open database GUI
cd apps/backend && pnpm prisma studio

# Reset database (⚠️  DESTRUCTIVE)
cd apps/backend && pnpm prisma migrate reset
```

## Project Structure

```
school-crm-monorepo/
├── apps/
│   ├── frontend/    # Next.js (localhost:3000)
│   └── backend/     # NestJS (localhost:3001)
├── packages/
│   ├── ui/          # Shared components
│   ├── types/       # TypeScript types
│   └── config/      # Configuration
└── docs/            # Documentation
```

## Next Steps

1. **Read the docs**:
   - [README.md](README.md) - Full documentation
   - [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
   - [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment
   - [SECURITY.md](docs/SECURITY.md) - Security checklist

2. **Customize**:
   - Add your tenant in database
   - Update theme colors
   - Configure custom domain

3. **Deploy**:
   - Deploy backend to Render/Railway
   - Deploy frontend to Vercel
   - Configure production database

## Troubleshooting

### Database connection failed
```bash
docker-compose ps         # Check if postgres is running
docker-compose logs postgres
docker-compose restart postgres
```

### Port already in use
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Prisma errors
```bash
cd apps/backend
pnpm prisma generate     # Regenerate client
pnpm prisma migrate reset  # Reset DB
```

### Tenant not found
- Check tenant exists: `SELECT * FROM tenants;`
- Verify `/etc/hosts` entries
- Check subdomain matches in DB

## Support

- 📚 Full docs: [README.md](README.md)
- 🏗️ Architecture: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 🔒 Security: [SECURITY.md](docs/SECURITY.md)
- 🚀 Deploy: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Happy coding! 🎉**
