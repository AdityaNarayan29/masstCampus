# School CRM Mobile - Setup & Development Guide

## Quick Start

### 1. Install Dependencies

From the root of the monorepo:
```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:
```bash
cd apps/mobile
cp .env.example .env.local
```

Update values as needed:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
cd apps/mobile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Overview

### Architecture

```
apps/mobile/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── (auth)/              # Authentication route group
│   │   │   ├── layout.tsx       # Shared auth layout
│   │   │   ├── login/           # Login page
│   │   │   └── signup/          # Signup page
│   │   ├── (teacher)/           # Teacher route group
│   │   │   ├── layout.tsx       # Teacher layout with nav
│   │   │   └── page.tsx         # Teacher dashboard
│   │   ├── (parent)/            # Parent route group
│   │   │   ├── layout.tsx       # Parent layout with nav
│   │   │   └── page.tsx         # Parent dashboard
│   │   ├── globals.css          # Global styles + safe areas
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home redirect
│   ├── lib/                      # Utilities & helpers
│   │   ├── api.ts               # Axios client with interceptors
│   │   ├── auth.ts              # Auth utilities
│   │   └── constants.ts         # App constants
│   └── middleware.ts            # Edge middleware for auth/routing
├── public/
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # App icons (create as needed)
├── capacitor.config.ts          # Capacitor native config
├── next.config.js               # Next.js + PWA config
├── tailwind.config.js           # Mobile-first tailwind config
├── tsconfig.json                # TypeScript config
├── postcss.config.js            # CSS processing
└── package.json                 # Dependencies
```

## Key Features

### 1. Route Groups

**Auth Routes** (Public)
- `/auth/login` - Login with email/password
- `/auth/signup` - Create new account
- `/auth/forgot-password` - Password recovery

**Teacher Routes** (Protected)
- `/teacher` - Dashboard
- `/teacher/classes` - View/manage classes
- `/teacher/attendance` - Mark attendance
- `/teacher/profile` - Teacher profile

**Parent Routes** (Protected)
- `/parent` - Dashboard
- `/parent/children` - View children
- `/parent/attendance` - View child attendance
- `/parent/profile` - Parent profile

### 2. Authentication Flow

```
User → Login Page → API Call → Store Token & Role → Redirect to Dashboard
                          ↓
                    Middleware checks token
                    and enforces role access
```

**Middleware** (`src/middleware.ts`):
- Runs on Edge (fast)
- Checks authentication token in cookies
- Validates user role
- Redirects to login if unauthorized
- Routes to appropriate dashboard

**Auth Utilities** (`src/lib/auth.ts`):
- Token management
- Role checking functions
- User data storage

### 3. Mobile Optimizations

**Safe Area Support**
```css
/* Applied to body in globals.css */
padding: env(safe-area-inset-*);
```

**Viewport Configuration**
```tsx
// In layout.tsx
export const viewport: Viewport = {
  viewportFit: 'cover',  // Notch support
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};
```

**Input Focus Zoom Prevention**
```css
input, textarea, select {
  font-size: max(1rem, 16px);
}
```

### 4. PWA Features

**Manifest** (`public/manifest.json`):
- App name, description, icons
- Display mode: standalone (full screen)
- Theme colors
- Shortcuts for quick access
- Screenshots for app stores

**Service Worker** (via next-pwa):
- Automatic caching
- Offline support
- Background sync ready

**Installation Support**
- Add to Home Screen on iOS/Android
- Standalone mode (no browser UI)
- App icon on home screen

### 5. Styling

**Tailwind Configuration**:
- Mobile-first breakpoints
- CSS variable-based colors
- Dark mode support
- Safe area utilities

**Global Styles** (`src/app/globals.css`):
- CSS custom properties for colors
- Light/dark theme definitions
- Mobile-safe scrolling
- Input focus optimization

## API Integration

### Using the API Client

```typescript
import apiClient from '@/lib/api';

// GET request
const response = await apiClient.get('/classes');

// POST request
const data = await apiClient.post('/attendance', {
  classId: '123',
  date: new Date(),
});

// Automatic auth token injection
// Token from localStorage is added to headers
```

### Error Handling

The API client automatically:
- Adds auth token to requests
- Logs user out on 401 (unauthorized)
- Handles network errors

## State Management (Future)

Currently using localStorage for simple state. For larger apps, add:
- **Zustand** - Lightweight state management
- **React Query** - Server state handling
- **Jotai** - Atomic state management

## Testing

### Local Testing

```bash
# Run dev server
pnpm dev

# Test auth flow
# - Visit http://localhost:3000
# - Should redirect to /auth/login
# - Sign up or use test credentials
# - Should redirect to dashboard based on role

# Test role enforcement
# - Open DevTools → Application → Cookies
# - Change user_role cookie
# - Reload page - should redirect to correct role dashboard
```

### Device Testing

```bash
# Test on local network
pnpm dev -- -H 0.0.0.0
# Access from phone: http://YOUR_IP:3000

# Test PWA
# - Open DevTools → Application → Manifest
# - Check "Add to Home Screen" option appears
# - Test offline mode (DevTools → Network → Offline)
```

## Capacitor Setup (Optional)

### Initialize Capacitor

```bash
# Install Capacitor (from apps/mobile)
npm install @capacitor/core @capacitor/cli

# Initialize project
npx cap init

# Build web assets
pnpm build

# Add platforms
npx cap add ios
npx cap add android

# Open native IDEs
pnpm cap:open:ios
pnpm cap:open:android
```

### Building for Production

```bash
# Build Next.js
pnpm build

# Update Capacitor assets
pnpm cap:sync

# Build native apps in Xcode/Android Studio
```

## Environment Variables

### Available Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `http://localhost:3001` | Frontend API calls |
| `BACKEND_URL` | Yes | `http://localhost:3001` | Next.js API rewrites |

### Setting Variables

**Development** (.env.local):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
```

**Production** (.env.production):
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
BACKEND_URL=https://api.example.com
```

## Troubleshooting

### App not loading on device
- Check BACKEND_URL points to correct API server
- Ensure device can reach backend (same network/VPN)
- Check browser console for errors

### Service Worker not updating
- Hard refresh (Cmd+Shift+R on Mac)
- Clear browser cache
- Unregister old SW in DevTools

### Login not working
- Verify email/password in test credentials
- Check API response in Network tab
- Ensure token is being stored in localStorage

### Build fails
- Clear `.next` folder: `pnpm clean`
- Delete `node_modules` and reinstall: `pnpm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Performance Tips

1. **Code Splitting** - Next.js automatic per-route
2. **Image Optimization** - Use next/image
3. **CSS Optimization** - Tailwind JIT compilation
4. **Service Worker** - Caches production builds
5. **Lazy Loading** - React.lazy() for heavy components

## Security Best Practices

1. **Token Storage** - Currently localStorage (vulnerable to XSS)
   - For production, use httpOnly cookies
2. **HTTPS** - Always use in production
3. **CORS** - Configure on backend
4. **Input Validation** - Sanitize all inputs
5. **Rate Limiting** - Implement on API

## Next Steps

1. Create shared UI components library
2. Add form validation (Zod/Yup)
3. Implement data caching (React Query)
4. Add push notifications
5. Create native plugins for device features
6. Set up error logging (Sentry)
7. Add analytics
8. Implement offline-first sync

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com)
- [Capacitor Docs](https://capacitorjs.com)
- [PWA Checklist](https://www.pwachecklist.com)

## Support

For questions or issues:
1. Check [README.md](./README.md)
2. Review source code comments
3. Check GitHub issues
4. Contact team lead
