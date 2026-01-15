# Mobile App File Structure

## Complete File Listing

```
apps/mobile/
│
├── public/                          # Static assets & PWA config
│   ├── manifest.json               # PWA web app manifest
│   │                               # - App metadata
│   │                               # - Icon references (create icons folder)
│   │                               # - Display mode: standalone
│   │                               # - Shortcuts and screenshots
│   └── icons/                      # (Create as needed)
│       ├── icon-192x192.png       # App icon for home screen
│       ├── icon-512x512.png       # Splash screen icon
│       ├── icon-*-maskable.png    # Adaptive icon support
│       └── screenshot-*.png       # App store screenshots
│
├── src/                             # Source code
│   ├── app/                         # Next.js App Directory (router)
│   │   ├── layout.tsx              # Root layout
│   │   │                           # - Sets up HTML structure
│   │   │                           # - PWA meta tags
│   │   │                           # - Viewport configuration
│   │   │                           # - Safe area support
│   │   │
│   │   ├── page.tsx                # Home page (/)
│   │   │                           # - Redirect logic
│   │   │                           # - Routes to role-specific dashboard
│   │   │
│   │   ├── globals.css             # Global styles
│   │   │                           # - Tailwind directives
│   │   │                           # - CSS custom properties (colors)
│   │   │                           # - Safe area insets
│   │   │                           # - Mobile optimizations
│   │   │
│   │   ├── (auth)/                 # Auth route group (public)
│   │   │   ├── layout.tsx          # Auth layout
│   │   │   │                       # - Centered form container
│   │   │   │                       # - Full height flex layout
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login page
│   │   │   │                       # - Email/password form
│   │   │   │                       # - API integration
│   │   │   │                       # - Role-based redirect
│   │   │   │                       # - Error handling
│   │   │   │
│   │   │   └── signup/
│   │   │       └── page.tsx        # Signup page
│   │   │                           # - Account creation form
│   │   │                           # - Role selection
│   │   │                           # - API integration
│   │   │                           # - Login redirect
│   │   │
│   │   ├── (teacher)/              # Teacher route group (protected)
│   │   │   ├── layout.tsx          # Teacher layout
│   │   │   │                       # - Role check middleware
│   │   │   │                       # - Top header with logout
│   │   │   │                       # - Bottom navigation (4 tabs)
│   │   │   │                       # - Main content area
│   │   │   │
│   │   │   ├── page.tsx            # Teacher dashboard
│   │   │   │                       # - Stats cards
│   │   │   │                       # - Quick action buttons
│   │   │   │                       # - Recent activity
│   │   │   │
│   │   │   ├── classes/            # (Future) Classes list
│   │   │   ├── attendance/         # (Future) Mark attendance
│   │   │   └── profile/            # (Future) Teacher profile
│   │   │
│   │   └── (parent)/               # Parent route group (protected)
│   │       ├── layout.tsx          # Parent layout
│   │       │                       # - Role check middleware
│   │       │                       # - Top header with logout
│   │       │                       # - Bottom navigation (4 tabs)
│   │       │                       # - Main content area
│   │       │
│   │       ├── page.tsx            # Parent dashboard
│   │       │                       # - Stats cards (children, attendance)
│   │       │                       # - Recent updates
│   │       │                       # - Quick links
│   │       │
│   │       ├── children/           # (Future) View children
│   │       ├── attendance/         # (Future) Child attendance
│   │       └── profile/            # (Future) Parent profile
│   │
│   ├── lib/                         # Utility functions & helpers
│   │   ├── api.ts                  # Axios HTTP client
│   │   │                           # - Base URL configuration
│   │   │                           # - Request interceptor (add token)
│   │   │                           # - Response interceptor (handle 401)
│   │   │                           # - Timeout configuration
│   │   │
│   │   ├── auth.ts                 # Authentication utilities
│   │   │                           # - Token management functions
│   │   │                           # - Role checking helpers
│   │   │                           # - User data storage/retrieval
│   │   │                           # - TypeScript interfaces
│   │   │
│   │   └── constants.ts            # App-wide constants
│   │                               # - Route definitions
│   │                               # - API endpoints
│   │                               # - Role constants
│   │                               # - Storage keys
│   │
│   └── middleware.ts                # Edge middleware
│                                   # - Token validation
│                                   # - Role-based routing
│                                   # - Public route handling
│                                   # - Automatic redirects
│
├── .env.example                     # Environment variables template
│                                   # - API_BASE_URL
│                                   # - BACKEND_URL
│
├── .env.local                       # Local environment (git ignored)
│                                   # - Copy from .env.example
│
├── .gitignore                       # Git ignore rules
│                                   # - Dependencies, builds, secrets
│                                   # - IDE configs, PWA files
│                                   # - Capacitor native code
│
├── next.config.js                  # Next.js configuration
│                                   # - next-pwa integration
│                                   # - Package transpilation
│                                   # - API rewrites
│                                   # - Development settings
│
├── tailwind.config.js              # Tailwind CSS configuration
│                                   # - Mobile breakpoints
│                                   # - Color system (CSS variables)
│                                   # - Dark mode support
│                                   # - Safe area utilities
│                                   # - Animation plugins
│
├── postcss.config.js               # PostCSS configuration
│                                   # - Tailwind processing
│                                   # - Autoprefixer
│
├── tsconfig.json                   # TypeScript configuration
│                                   # - Compiler options
│                                   # - Path aliases (@/* → ./src/*)
│                                   # - Strict mode enabled
│                                   # - Next.js plugin
│
├── next-env.d.ts                   # TypeScript Next.js definitions
│                                   # - Environment variable types
│
├── package.json                    # NPM dependencies & scripts
│                                   # - dev, build, start, lint
│                                   # - Capacitor scripts
│                                   # - Dependencies list
│
├── capacitor.config.ts             # Capacitor configuration
│                                   # - App ID (com.schoolcrm.mobile)
│                                   # - Build directory (out)
│                                   # - Plugin settings
│
├── Dockerfile                      # Docker build configuration
│                                   # - Multi-stage build
│                                   # - Production optimized
│
├── README.md                        # Project overview
│                                   # - Features list
│                                   # - Getting started
│                                   # - Project structure
│                                   # - Commands
│                                   # - Configuration
│
├── SETUP.md                         # Detailed setup guide
│                                   # - Quick start steps
│                                   # - Feature overview
│                                   # - API integration
│                                   # - Capacitor setup
│                                   # - Troubleshooting
│
└── FILE_STRUCTURE.md               # This file
                                    # - Complete file descriptions
```

## File Descriptions by Category

### Configuration Files
- **package.json** - Project metadata, scripts, and dependencies
- **tsconfig.json** - TypeScript compiler configuration
- **next.config.js** - Next.js and PWA setup
- **tailwind.config.js** - CSS framework configuration
- **postcss.config.js** - CSS processing pipeline
- **capacitor.config.ts** - Native app configuration
- **.env.example** - Environment variable template
- **.gitignore** - Git ignore patterns

### Type Definitions
- **next-env.d.ts** - Next.js type definitions
- **tsconfig.json** - TypeScript global types

### App Code

#### Root App Directory
- **layout.tsx** - Wraps entire app with HTML structure, meta tags, viewport
- **page.tsx** - Home page with redirect logic
- **globals.css** - Global styles, CSS variables, mobile optimizations

#### Authentication (Auth Route Group)
- **auth/layout.tsx** - Centered form container for auth pages
- **auth/login/page.tsx** - User login with email/password
- **auth/signup/page.tsx** - User registration with role selection

#### Teacher Routes (Protected)
- **teacher/layout.tsx** - Teacher-specific layout with navigation
- **teacher/page.tsx** - Teacher dashboard
- *Future: classes, attendance, profile pages*

#### Parent Routes (Protected)
- **parent/layout.tsx** - Parent-specific layout with navigation
- **parent/page.tsx** - Parent dashboard
- *Future: children, attendance, profile pages*

#### Utilities
- **lib/api.ts** - Axios client with auth interceptor
- **lib/auth.ts** - Authentication helper functions
- **lib/constants.ts** - App constants and configuration
- **middleware.ts** - Edge middleware for routing and auth

### Static Assets
- **public/manifest.json** - PWA manifest for installability
- **public/icons/** - App icons for different sizes

### Docker & Deployment
- **Dockerfile** - Multi-stage production build

### Documentation
- **README.md** - Project overview and quick start
- **SETUP.md** - Detailed setup and development guide
- **FILE_STRUCTURE.md** - This file

## Route Structure Summary

```
/ (root)
├── /auth (public)
│   ├── /auth/login
│   └── /auth/signup
├── /teacher (protected)
│   ├── /teacher (dashboard)
│   ├── /teacher/classes
│   ├── /teacher/attendance
│   └── /teacher/profile
└── /parent (protected)
    ├── /parent (dashboard)
    ├── /parent/children
    ├── /parent/attendance
    └── /parent/profile
```

## Key Features by File

### Authentication Flow
1. User visits app
2. `middleware.ts` checks token
3. Redirect to `/auth/login` if unauthorized
4. User submits credentials to `/auth/login/page.tsx`
5. API call via `lib/api.ts`
6. Token stored in localStorage
7. User role determines redirect
8. Routed to role-specific layout
9. Layout checks role in `lib/auth.ts`

### Styling & Mobile Support
1. CSS variables in `globals.css` for theming
2. Safe area insets for notched devices
3. Mobile-first Tailwind breakpoints
4. Touch-friendly UI components
5. Optimized input focus behavior

### PWA Features
1. `public/manifest.json` for web app metadata
2. `next.config.js` with next-pwa plugin
3. Automatic service worker generation
4. Icon files in `public/icons/`
5. Meta tags in `layout.tsx`

## Development Workflow

1. **Make changes** in `src/` directory
2. **Dev server** automatically reloads
3. **Run tests** against localhost
4. **Build** with `pnpm build`
5. **Deploy** via Docker or Vercel
6. **Capacitor sync** for native builds

## File Size Reference

- Total project: ~50 files
- Configuration: 8 files
- App code: 20+ files (expandable)
- Assets: 1 file (icons directory)
- Documentation: 3 files
- Docker: 1 file
