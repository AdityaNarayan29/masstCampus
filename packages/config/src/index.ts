import { TenantTheme, TenantConfig } from '@school-crm/types';

// Default tenant theme (shadcn defaults)
export const defaultTheme: TenantTheme = {
  logo: '/default-logo.svg',
  colors: {
    primary: 'hsl(222.2 47.4% 11.2%)',
    secondary: 'hsl(210 40% 96.1%)',
    accent: 'hsl(210 40% 96.1%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    muted: 'hsl(210 40% 96.1%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    border: 'hsl(214.3 31.8% 91.4%)',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
};

// Default tenant configuration
export const defaultConfig: TenantConfig = {
  features: {
    attendance: true,
    fees: true,
    messaging: true,
    commission: true,
    reports: true,
  },
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

// Feature flags (global)
export const featureFlags = {
  enableClerkAuth: process.env.ENABLE_CLERK_AUTH === 'true',
  enableJwtAuth: process.env.ENABLE_JWT_AUTH !== 'false', // default true
  enableBrokerCommission: true,
  enableRealtimeNotifications: false,
  enableAdvancedReporting: true,
  maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
};

// App configuration
export const appConfig = {
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    defaultSubdomain: 'app',
  },
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:3001',
    apiPrefix: '/api/v1',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/school_crm',
  },
  auth: {
    clerk: {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
      secretKey: process.env.CLERK_SECRET_KEY || '',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      expiresIn: '7d',
      refreshExpiresIn: '30d',
    },
  },
  cors: {
    allowedOrigins:
      process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
      ],
  },
};

// Tweakcn theme configuration
export const tweakcnConfig = {
  themes: {
    light: {
      primary: '222.2 47.4% 11.2%',
      secondary: '210 40% 96.1%',
      accent: '210 40% 96.1%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96.1%',
      mutedForeground: '215.4 16.3% 46.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
      radius: '0.5rem',
    },
    dark: {
      primary: '210 40% 98%',
      secondary: '217.2 32.6% 17.5%',
      accent: '217.2 32.6% 17.5%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '212.7 26.8% 83.9%',
      radius: '0.5rem',
    },
  },
};

// Commission calculation settings
export const commissionConfig = {
  maxBrokerLevels: 5,
  defaultPercentage: 5,
  minPercentage: 0.5,
  maxPercentage: 20,
  calculationDelay: 24 * 60 * 60 * 1000, // 24 hours in ms
};

// Pagination defaults
export const paginationDefaults = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

// Security settings
export const securityConfig = {
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 60 * 60 * 1000, // 1 hour
  requireEmailVerification: true,
  requireMfa: false,
};

// Rate limiting
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  skipSuccessfulRequests: false,
};

export default {
  defaultTheme,
  defaultConfig,
  featureFlags,
  appConfig,
  tweakcnConfig,
  commissionConfig,
  paginationDefaults,
  securityConfig,
  rateLimitConfig,
};
