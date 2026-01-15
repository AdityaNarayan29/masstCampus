# School CRM Mobile App

A minimal Next.js PWA mobile app built with Capacitor for teachers and parents.

## Features

- PWA-ready with Next.js and next-pwa
- Role-based routing (Auth, Teacher, Parent)
- Mobile-optimized UI with Tailwind CSS
- Capacitor integration for iOS and Android
- Middleware for role-based authentication
- TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM (recommended for monorepo)

### Installation

```bash
# From root of monorepo
pnpm install

# Install mobile dependencies
cd apps/mobile
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Open browser to http://localhost:3000
```

### Building

```bash
# Build for PWA
pnpm build

# Export for Capacitor (if needed)
pnpm build
```

### Capacitor Setup (Optional)

```bash
# Sync with native platforms
pnpm cap:sync

# Open iOS simulator
pnpm cap:open:ios

# Open Android emulator
pnpm cap:open:android
```

## Project Structure

```
apps/mobile/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (teacher)/        # Teacher route group
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (parent)/         # Parent route group
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   └── middleware.ts         # Authentication middleware
├── capacitor.config.ts       # Capacitor configuration
├── next.config.js            # Next.js with PWA
├── tailwind.config.js        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
└── package.json
```

## Route Groups

### (auth)
- `/auth/login` - Login page
- `/auth/signup` - Signup page

### (teacher)
- `/teacher` - Teacher dashboard
- `/teacher/classes` - View classes
- `/teacher/attendance` - Mark attendance
- `/teacher/profile` - Teacher profile

### (parent)
- `/parent` - Parent dashboard
- `/parent/children` - View children
- `/parent/attendance` - View attendance
- `/parent/profile` - Parent profile

## Middleware

The middleware (`src/middleware.ts`) handles:
- Role-based routing
- Authentication check
- Automatic redirection based on user role

## Configuration

### Environment Variables

Create `.env.local` based on `.env.example`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
```

## PWA Features

- Installable on home screen
- Works offline (with cached resources)
- Push notifications ready
- Full-screen mode support
- Status bar theming

## Mobile Optimization

- Safe area inset support for notched devices
- Touch-friendly UI components
- Mobile-first responsive design
- Prevents zoom on input focus
- Optimized scrolling performance

## Next Steps

1. Add API integration helpers
2. Create reusable components
3. Implement state management (Zustand/Redux)
4. Add notification system
5. Implement offline-first sync
6. Add push notifications
7. Create native plugins for device APIs

## Dependencies

### Runtime
- `next` - React framework
- `next-pwa` - PWA support
- `@capacitor/core` - Native platform access
- `react` & `react-dom` - UI library
- `tailwindcss` - Styling
- `axios` - HTTP client

### Development
- `typescript` - Type safety
- `@types/react` - React types
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS processing
- `@capacitor/cli` - Capacitor CLI

## License

Private - School CRM Project
