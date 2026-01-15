# Deployment Guide

This guide covers deploying the School CRM to various platforms with custom domain support.

## Table of Contents

1. [Vercel (Frontend)](#vercel-frontend)
2. [Render/Railway (Backend)](#renderrailway-backend)
3. [Database (Neon/Supabase)](#database)
4. [Custom Domains](#custom-domains)
5. [SSL Certificates](#ssl-certificates)
6. [Environment Variables](#environment-variables)

---

## Vercel (Frontend)

### Initial Setup

1. **Install Vercel CLI**:
   ```bash
   pnpm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd apps/frontend
   vercel
   ```

### Adding Custom Domains

#### Option 1: Via Vercel Dashboard

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `portal.vidyamandir.com`)
4. Update DNS records as instructed by Vercel

#### Option 2: Via Vercel API (Automated)

```bash
# Add domain via API
curl -X POST "https://api.vercel.com/v9/projects/${PROJECT_ID}/domains" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "portal.vidyamandir.com"
  }'
```

**Script to add multiple domains**:

```javascript
// scripts/add-vercel-domains.js
const axios = require('axios');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

const domains = [
  'portal.vidyamandir.com',
  'vidyamandir.edu',
  'demo.school-crm.com',
];

async function addDomain(domain) {
  try {
    const response = await axios.post(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/domains`,
      { name: domain },
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Added domain: ${domain}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to add domain ${domain}:`, error.response?.data);
  }
}

async function main() {
  for (const domain of domains) {
    await addDomain(domain);
  }
}

main();
```

### Environment Variables

Set these in Vercel dashboard or via CLI:

```bash
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Enter: https://your-backend.onrender.com

vercel env add BACKEND_URL production
# Enter: https://your-backend.onrender.com

vercel env add NEXT_PUBLIC_AUTH_MODE production
# Enter: jwt
```

---

## Render/Railway (Backend)

### Render Setup

1. **Create New Web Service**:
   - Connect your GitHub repo
   - Select `apps/backend` as root directory
   - Build command: `pnpm install && cd apps/backend && pnpm prisma generate && pnpm build`
   - Start command: `cd apps/backend && pnpm start:prod`

2. **Environment Variables**:
   ```
   DATABASE_URL=your-postgres-connection-string
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app
   JWT_SECRET=your-secure-random-secret
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://portal.vidyamandir.com
   ```

3. **Add Database** (Render PostgreSQL):
   - Create PostgreSQL database in Render
   - Copy connection string to `DATABASE_URL`

### Railway Setup

1. **Create New Project**:
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```

3. **Deploy Backend**:
   ```bash
   cd apps/backend
   railway up
   ```

4. **Environment Variables**:
   Set via Railway dashboard or CLI:
   ```bash
   railway variables set JWT_SECRET=your-secret
   railway variables set FRONTEND_URL=https://your-app.vercel.app
   ```

### Database Migrations

**After deployment, run migrations**:

```bash
# Via Render shell
cd apps/backend && pnpm prisma migrate deploy

# Via Railway CLI
railway run pnpm prisma migrate deploy
```

---

## Database

### Neon (Recommended)

1. **Create Database**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create new project
   - Copy connection string

2. **Configure Connection**:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/school_crm?sslmode=require"
   ```

3. **Run Migrations**:
   ```bash
   cd apps/backend
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

### Supabase

1. **Create Project**:
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project
   - Go to Settings → Database → Connection string

2. **Configure**:
   ```env
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```

---

## Custom Domains

### DNS Configuration

For custom domains (e.g., `portal.vidyamandir.com`), configure DNS:

**Option 1: Point to Vercel**:
```
Type: CNAME
Name: portal.vidyamandir
Value: cname.vercel-dns.com
```

**Option 2: Point to Your Nginx Proxy**:
```
Type: A
Name: portal.vidyamandir
Value: YOUR_SERVER_IP
```

### Self-Hosted with Nginx

If you're using your own server:

1. **Configure Nginx** (see `nginx/nginx.conf`):
   ```nginx
   server {
       listen 80;
       server_name portal.vidyamandir.com vidyamandir.edu;

       location / {
           proxy_pass https://your-app.vercel.app;
           proxy_set_header X-Forwarded-Host $host;
           proxy_set_header Host $host;
       }
   }
   ```

2. **Reload Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Preserving Host Headers

**CRITICAL**: Ensure your reverse proxy preserves the original host:

```nginx
proxy_set_header X-Forwarded-Host $host;
proxy_set_header Host $host;
```

This allows tenant resolution to work correctly.

---

## SSL Certificates

### Option 1: Vercel (Automatic)

Vercel automatically provisions SSL for all custom domains.

### Option 2: Let's Encrypt (Self-Hosted)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d portal.vidyamandir.com

# Auto-renewal
sudo certbot renew --dry-run
```

**Nginx SSL Config**:
```nginx
server {
    listen 443 ssl http2;
    server_name portal.vidyamandir.com;

    ssl_certificate /etc/letsencrypt/live/portal.vidyamandir.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.vidyamandir.com/privkey.pem;

    location / {
        proxy_pass https://your-app.vercel.app;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

---

## Environment Variables

### Frontend (Vercel)

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
BACKEND_URL=https://your-backend.onrender.com
NEXT_PUBLIC_AUTH_MODE=jwt
NEXT_PUBLIC_ENABLE_JWT=true
```

### Backend (Render/Railway)

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-secure-secret
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://portal.vidyamandir.com
```

---

## Testing Custom Domains Locally

1. **Edit `/etc/hosts`**:
   ```
   127.0.0.1 portal.vidyamandir.local
   127.0.0.1 demo.school-crm.local
   ```

2. **Start services**:
   ```bash
   pnpm turbo run dev
   ```

3. **Test with curl**:
   ```bash
   curl -H "Host: portal.vidyamandir.local" http://localhost:3000/
   ```

4. **Test in browser**:
   Visit `http://portal.vidyamandir.local:3000`

---

## Monitoring and Logs

### Vercel

- View logs: `vercel logs`
- Real-time: `vercel logs --follow`

### Render

- Access logs via Render dashboard
- Or use Render CLI

### Database

- Neon: Built-in query insights
- Supabase: Query performance dashboard

---

## Rollback Strategy

### Vercel

```bash
vercel rollback
```

### Render

Use deployment history in dashboard to redeploy previous version.

### Database

Always test migrations in staging before production:

```bash
# Staging
DATABASE_URL=staging_url pnpm prisma migrate deploy

# Production
DATABASE_URL=prod_url pnpm prisma migrate deploy
```

---

## Security Checklist

- [ ] SSL enabled for all domains
- [ ] Environment variables secured (not in code)
- [ ] Database connections use SSL
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] JWT secret is strong and unique
- [ ] Database backups configured
- [ ] Error messages don't expose sensitive info
- [ ] API endpoints require authentication
- [ ] Tenant isolation verified in queries

---

## Scaling Considerations

### When to Split to Microservices

Consider microservices when:

1. **Payout Processing**: High volume commission calculations
2. **Notifications**: Email/SMS sending service
3. **Reporting**: Heavy analytical queries
4. **File Storage**: Document/image uploads

### Migration Strategy

1. Extract module to separate NestJS app
2. Use same Prisma schema (shared DB initially)
3. Communicate via REST/GraphQL APIs
4. Later: Consider per-tenant databases for large tenants

### Database Scaling

**Shared DB (Current)**:
- ✅ Easy development
- ✅ Simple queries across tenants
- ❌ Noisy neighbor problems
- ❌ Harder to scale specific tenants

**Per-Tenant DB** (Future):
- ✅ Better isolation
- ✅ Easier to scale specific tenants
- ❌ Complex migrations
- ❌ Cross-tenant queries harder

**When to migrate**: 10,000+ students per tenant or strict compliance requirements.
