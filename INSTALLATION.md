# Installation Guide

## Current Status

Your environment check shows the following dependencies are needed:
- ❌ Node.js 18+
- ❌ pnpm 8+
- ❌ PostgreSQL 15+
- ⚠️  Docker (optional but recommended)

## Step-by-Step Installation

### Option 1: Quick Install (macOS - Recommended)

```bash
# 1. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js 18
brew install node@18
brew link node@18 --force --overwrite

# 3. Verify Node.js installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher

# 4. Install pnpm
npm install -g pnpm@8.12.0

# 5. Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 6. Create database
createdb school_crm

# 7. Install Docker Desktop (optional but recommended)
# Download from: https://www.docker.com/products/docker-desktop
# Or install via Homebrew:
brew install --cask docker
```

### Option 2: Linux/Ubuntu

```bash
# 1. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install pnpm
npm install -g pnpm@8.12.0

# 3. Install PostgreSQL
sudo apt-get update
sudo apt install -y postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Create database user and database
sudo -u postgres createuser -s $USER
createdb school_crm

# 5. Install Docker (optional)
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

---

## Setup the Project

Once all dependencies are installed:

### 1. Run Environment Check

```bash
cd /Users/adityanarayan/Projects/masstCampus
./check-environment.sh
```

You should see all ✅ green checkmarks.

### 2. Run Automated Setup

```bash
./setup.sh
```

This script will:
- Install all npm dependencies
- Create `.env` files
- Run database migrations
- Seed the database with sample data

### 3. Start the Application

```bash
# Start all services (frontend + backend)
pnpm turbo run dev
```

**Alternative: Start services separately**

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

---

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Prisma Studio**: Run `cd apps/backend && pnpm prisma studio`

---

## Test with Custom Domains

### 1. Edit `/etc/hosts`

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 portal.vidyamandir.local
127.0.0.1 demo.school-crm.local
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

### 2. Visit in Browser

- http://portal.vidyamandir.local:3000 (Vidyamandir tenant - blue theme)
- http://demo.school-crm.local:3000 (Demo tenant - green theme)

You should see different logos, colors, and tenant names!

---

## Login Credentials

### Vidyamandir Tenant
- **Admin**: admin@vidyamandir.com / admin123
- **Broker**: broker@vidyamandir.com / broker123
- **Teacher**: teacher@vidyamandir.com / teacher123

### Demo Tenant
- **Admin**: admin@demo.com / demo123

---

## Test API Endpoints

### 1. Resolve Tenant

```bash
curl -H "X-Forwarded-Host: portal.vidyamandir.local" \
     http://localhost:3001/api/v1/tenants/resolve
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Vidyamandir Classes",
    "subdomain": "portal.vidyamandir",
    "primaryDomain": "portal.vidyamandir.com",
    "theme": { ... },
    "config": { ... }
  }
}
```

### 2. Login

```bash
# First, get the tenant ID from the resolve endpoint above
# Then login:

curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vidyamandir.com",
    "password": "admin123",
    "tenantId": "YOUR_TENANT_ID_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "admin@vidyamandir.com",
      "role": "ADMIN"
    }
  }
}
```

### 3. Get Students

```bash
# Use the token from login response
curl http://localhost:3001/api/v1/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-Forwarded-Host: portal.vidyamandir.local"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "firstName": "Rahul",
      "lastName": "Gupta",
      "enrollmentNumber": "VM2024001",
      "gradeLevel": "12"
    },
    ...
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20
  }
}
```

### 4. Calculate Commission

```bash
# Get a payment ID from the database first
# Then calculate commission:

curl -X POST http://localhost:3001/api/v1/commission/calculate/PAYMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Forwarded-Host: portal.vidyamandir.local"
```

---

## Using Docker (Alternative)

If you prefer using Docker:

### 1. Start PostgreSQL Only

```bash
# Start database
docker-compose up postgres -d

# Check logs
docker-compose logs -f postgres

# Wait for "database system is ready to accept connections"
```

### 2. Run Migrations

```bash
cd apps/backend
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
cd ../..
```

### 3. Start Apps

```bash
pnpm turbo run dev
```

---

## Verify Everything Works

### ✅ Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:3001/api/v1/tenants
- [ ] Database has data (check with Prisma Studio)
- [ ] Can login with admin@vidyamandir.com / admin123
- [ ] Custom domain works: http://portal.vidyamandir.local:3000
- [ ] Different tenants show different themes
- [ ] API returns student data
- [ ] Commission calculation works

### Database Check

```bash
cd apps/backend
pnpm prisma studio
```

Open http://localhost:5555 and verify:
- 2 tenants exist (Vidyamandir, Demo School)
- 4 brokers exist
- 3 students exist
- 2 payments exist
- 3 commissions exist

---

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Restart PostgreSQL
brew services restart postgresql@15  # macOS
sudo systemctl restart postgresql  # Linux

# Check connection
psql -U $USER -d school_crm
```

### Prisma Errors

```bash
cd apps/backend

# Regenerate Prisma client
pnpm prisma generate

# Reset database (⚠️  DESTRUCTIVE)
pnpm prisma migrate reset

# Re-seed
pnpm prisma db seed
```

### Frontend Won't Build

```bash
# Clear cache and rebuild
cd apps/frontend
rm -rf .next node_modules
pnpm install
pnpm build
```

### "Module not found" Errors

```bash
# From project root
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
pnpm turbo run build
```

---

## Next Steps

Once everything is running:

1. **Explore the Dashboard**: http://localhost:3000/dashboard
2. **Add a new student**: Use the API or Prisma Studio
3. **Test commission calculation**: Create a payment and calculate commission
4. **Customize tenant theme**: Update tenant record in database
5. **Read the docs**: [README.md](README.md)

---

## Support

If you encounter issues:

1. Check [README.md](README.md) - Troubleshooting section
2. Run `./check-environment.sh` to verify dependencies
3. Check logs: `docker-compose logs` or terminal output
4. Open issue on GitHub

---

## Quick Reference

```bash
# Environment check
./check-environment.sh

# Setup project
./setup.sh

# Start development
pnpm turbo run dev

# Start database only
docker-compose up postgres -d

# Database GUI
cd apps/backend && pnpm prisma studio

# Run tests
pnpm turbo run test

# Build for production
pnpm turbo run build

# Clean and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

Good luck! 🚀
