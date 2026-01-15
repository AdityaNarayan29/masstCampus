/**
 * App constants and configuration
 */

export const APP_NAME = 'School CRM';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  // Teacher routes
  TEACHER: {
    HOME: '/teacher',
    CLASSES: '/teacher/classes',
    ATTENDANCE: '/teacher/attendance',
    PROFILE: '/teacher/profile',
  },
  // Parent routes
  PARENT: {
    HOME: '/parent',
    CHILDREN: '/parent/children',
    ATTENDANCE: '/parent/attendance',
    PROFILE: '/parent/profile',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
};

export const ROLES = {
  TEACHER: 'teacher',
  PARENT: 'parent',
  ADMIN: 'admin',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ROLE: 'user_role',
  USER_NAME: 'user_name',
  USER_ID: 'user_id',
} as const;
