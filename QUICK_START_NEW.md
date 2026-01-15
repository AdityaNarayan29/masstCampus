# 🚀 Quick Start - Masst Campus (New Architecture)

## What Just Happened?

Your project was transformed into a **professional multi-portal architecture** with 3 separate apps:

1. **apps/web** - Admin portals (Super Admin + School Admin)
2. **apps/mobile** - Mobile PWA (Teacher + Parent)
3. **services/api** - Enhanced backend with new features

---

## ⚡ Start in 3 Steps

### Step 1: Database Setup
```bash
# Start PostgreSQL
docker-compose up postgres -d

# Run migration (creates new tables)
pnpm db:migrate

# Optional: Seed sample data
pnpm db:seed
```

### Step 2: Start All Services
```bash
pnpm dev
```

This starts:
- **API**: http://localhost:3001
- **Web App**: http://localhost:3000
- **Mobile App**: http://localhost:3002

### Step 3: Test Subdomains (Optional)

Add to `/etc/hosts`:
```
127.0.0.1 admin.localhost
127.0.0.1 portal.vidyamandir.local
```

Visit:
- http://admin.localhost:3000 → Super Admin Dashboard
- http://portal.vidyamandir.local:3000 → School Admin
- http://localhost:3002 → Mobile (Teacher/Parent)

---

## 📱 Test Each Portal

### Super Admin (You)
**URL:** http://admin.localhost:3000 or http://localhost:3000

**What you'll see:**
- Platform overview dashboard
- Total schools: 0 (add your first!)
- Quick actions: Add school, View analytics
- System status monitoring

**What you can do:**
- Add new schools
- View all students across schools
- Manage subscriptions
- Platform analytics

---

### School Admin
**URL:** http://portal.vidyamandir.local:3000

**Login:** admin@vidyamandir.com / admin123

**What you'll see:**
- School-specific dashboard
- Student count, teacher count, attendance %, pending fees
- Quick actions: Mark attendance, Add student, Send notification

**What you can do:**
- Manage students, teachers, classes
- Track attendance & fees
- Manage brokers & commissions
- Send notifications

---

### Mobile App (Teacher/Parent)
**URL:** http://localhost:3002

**Teacher Login:** teacher@vidyamandir.com / teacher123
**Parent Login:** (Create in School Admin first)

**Features:**
- Role-based dashboard
- Bottom navigation (mobile-optimized)
- Touch-friendly UI
- PWA installable

---

## 🏗️ New Features Added

### 1. Teacher Management
**API Endpoints:**
```
GET    /api/v1/teachers
POST   /api/v1/teachers
GET    /api/v1/teachers/:id
PUT    /api/v1/teachers/:id
DELETE /api/v1/teachers/:id
```

**Hook:**
```typescript
import { useTeachers } from '@masst/api-client';
const { data: teachers } = useTeachers(client, tenantId);
```

---

### 2. Parent Management
**API Endpoints:**
```
GET    /api/v1/parents
POST   /api/v1/parents
GET    /api/v1/parents/:id
PUT    /api/v1/parents/:id
DELETE /api/v1/parents/:id
```

**Hook:**
```typescript
import { useParents } from '@masst/api-client';
const { data: parents } = useParents(client, tenantId);
```

---

### 3. Notifications System
**API Endpoints:**
```
GET    /api/v1/notifications         # List all
GET    /api/v1/notifications/:id     # Get one
POST   /api/v1/notifications          # Create
PATCH  /api/v1/notifications/:id/read # Mark as read
DELETE /api/v1/notifications/:id     # Delete
```

**Types:**
- **STATIC**: Holidays, circulars
- **DYNAMIC**: Fee reminders, exam results
- **ALERT**: Urgent messages
- **ANNOUNCEMENT**: General announcements

**Hook:**
```typescript
import { useNotifications, useCreateNotification } from '@masst/api-client';

const { data: notifications } = useNotifications(client);
const createMutation = useCreateNotification(client);

createMutation.mutate({
  type: 'STATIC',
  title: 'School Holiday',
  message: 'School closed on 26th Jan',
  targetRole: ['TEACHER', 'PARENT'],
  priority: 'HIGH'
});
```

---

## 🎯 Common Tasks

### Add a New School (Super Admin)
```typescript
// In Super Admin portal
POST /api/v1/tenants
{
  "name": "Delhi Public School",
  "subdomain": "portal.dps",
  "primaryDomain": "portal.dps.com",
  "config": {
    "locale": "en-IN",
    "currency": "INR"
  }
}
```

### Add a Teacher
```typescript
// 1. Create User first
POST /api/v1/users
{
  "email": "teacher@dps.com",
  "password": "password123",
  "role": "TEACHER",
  "tenantId": "tenant-id-here"
}

// 2. Create Teacher Profile
POST /api/v1/teachers
{
  "userId": "user-id-from-step-1",
  "employeeId": "T001",
  "subjects": ["Mathematics", "Physics"],
  "qualifications": ["B.Sc", "B.Ed"]
}
```

### Send a Notification
```typescript
POST /api/v1/notifications
{
  "type": "DYNAMIC",
  "title": "Fee Reminder",
  "message": "Fee payment due on 31st Jan",
  "targetRole": ["PARENT"],
  "priority": "MEDIUM"
}
```

---

## 📦 New Packages Usage

### @masst/utils
```typescript
import { formatCurrency, formatDate, isEmail } from '@masst/utils';

formatCurrency(50000);                // ₹50,000.00
formatDate(new Date());               // 15 January, 2026
isEmail('test@example.com');          // true
```

### @masst/api-client
```typescript
import { createApiClient, useStudents } from '@masst/api-client';

const client = createApiClient({
  baseURL: 'http://localhost:3001',
  tenantId: 'your-tenant-id',
  getToken: () => localStorage.getItem('token')
});

function StudentList() {
  const { data, isLoading } = useStudents(client, tenantId);

  if (isLoading) return <div>Loading...</div>;
  return <ul>{data.map(s => <li>{s.name}</li>)}</ul>;
}
```

---

## 🔍 Check What's Working

```bash
# API Health
curl http://localhost:3001/api/v1/health

# Tenant Resolution
curl -H "Host: portal.vidyamandir.local" \
     http://localhost:3001/api/v1/tenants/resolve

# List Students
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Forwarded-Host: portal.vidyamandir.local" \
     http://localhost:3001/api/v1/students
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Prisma Generate Error
```bash
cd services/api
npx prisma generate
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in package.json
"dev": "next dev -p 3003"
```

### Subdomain Not Working
Check `/etc/hosts`:
```bash
sudo nano /etc/hosts
# Add:
127.0.0.1 admin.localhost
127.0.0.1 portal.vidyamandir.local
```

---

## 📊 Database Schema

### New Tables
- `teacher_profiles` - Teacher info linked to users
- `parent_profiles` - Parent info with children
- `notifications` - Multi-role notification system

### Updated Tables
- `users` - Added relations to teacher/parent profiles

### Check Schema
```bash
cd services/api
pnpm prisma studio
# Opens http://localhost:5555
```

---

## 🎨 Customize

### Change Super Admin URL
Edit [apps/web/src/middleware.ts](apps/web/src/middleware.ts:34):
```typescript
if (targetHost.startsWith('admin.masstcampus')) {
  // Change to your domain
}
```

### Add Custom Colors (School Admin)
Update tenant theme in database:
```sql
UPDATE tenants SET theme = '{
  "colors": {
    "primary": "hsl(142 76% 36%)",  -- Green
    "secondary": "hsl(47 84% 56%)"   -- Yellow
  }
}' WHERE id = 'your-tenant-id';
```

### Mobile App Icon
Replace files in [apps/mobile/public/](apps/mobile/public/):
- `icon-192x192.png`
- `icon-512x512.png`
- `apple-touch-icon.png`

---

## 📚 Documentation

- [TRANSFORMATION_COMPLETE.md](TRANSFORMATION_COMPLETE.md) - Full transformation details
- [apps/mobile/SETUP.md](apps/mobile/SETUP.md) - Mobile app guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [README.md](README.md) - Main documentation

---

## ✅ Verification Checklist

Before deploying:

- [ ] Database migrated successfully
- [ ] All 3 apps start without errors
- [ ] Can login to School Admin
- [ ] Can create a student
- [ ] Can mark attendance
- [ ] Can create a notification
- [ ] Mobile app loads correctly
- [ ] Teacher can login to mobile app
- [ ] Super Admin dashboard shows data

---

## 🎯 Next Development Tasks

**Week 1:**
1. Build notification UI in web app
2. Implement teacher attendance marking
3. Create parent dashboard views

**Week 2:**
4. Add notification bell with badge
5. Build fee payment interface
6. Teacher class schedule view

**Week 3:**
7. Parent fee payment tracking
8. Mobile app native builds
9. Push notification setup

---

## 💡 Pro Tips

1. **Use TypeScript**
   - All types are in `packages/types`
   - Import from `@school-crm/types`

2. **Shared Components**
   - Use `packages/ui` components
   - Maintain consistency across apps

3. **API Hooks**
   - Use `@masst/api-client` hooks
   - Don't write raw axios calls

4. **Database Queries**
   - Always include `tenantId` filter
   - Use Prisma relations

5. **Testing Locally**
   - Use `/etc/hosts` for subdomains
   - Test each portal separately

---

## 🚀 You're All Set!

Your platform is ready for:
- Multi-school deployment
- Role-based access
- Mobile app builds
- Real-time notifications

**Start building:** `pnpm dev`

**Questions?** Check [TRANSFORMATION_COMPLETE.md](TRANSFORMATION_COMPLETE.md) for detailed info.

---

**Built with Claude Code** 🤖
