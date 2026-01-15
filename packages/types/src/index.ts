// Tenant types
export interface Tenant {
  id: string;
  name: string;
  primaryDomain: string | null;
  subdomain: string;
  theme: TenantTheme;
  config: TenantConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantTheme {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
}

export interface TenantConfig {
  features: {
    attendance: boolean;
    fees: boolean;
    messaging: boolean;
    commission: boolean;
    reports: boolean;
  };
  locale: string;
  timezone: string;
  currency: string;
}

// User types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  BROKER = 'BROKER',
  AGENT = 'AGENT',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  brokerId?: string;
  profile: UserProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  address?: string;
}

// Broker types
export interface Broker {
  id: string;
  name: string;
  code: string;
  parentBrokerId?: string;
  tenantId: string;
  level: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionRule {
  id: string;
  brokerId: string;
  name: string;
  level: number;
  percentage: number;
  conditions: CommissionConditions;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionConditions {
  minAmount?: number;
  maxAmount?: number;
  feeType?: string[];
  studentGrade?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface CommissionCalculation {
  ruleId: string;
  brokerId: string;
  brokerName: string;
  level: number;
  baseAmount: number;
  percentage: number;
  commissionAmount: number;
}

// Student types
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  tenantId: string;
  brokerId?: string;
  enrollmentNumber: string;
  gradeLevel: string;
  section?: string;
  parentId?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Fee types
export interface Fee {
  id: string;
  studentId: string;
  tenantId: string;
  type: string;
  amount: number;
  dueDate: Date;
  status: FeeStatus;
  description?: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  tenantId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: PaymentStatus;
  paidAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Attendance types
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  tenantId: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

// Class types
export interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  tenantId: string;
  teacherId?: string;
  schedule?: ClassSchedule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
}

// Audit types
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tenant context (for internal use in backend)
export interface TenantContext {
  tenantId: string;
  tenant?: Tenant;
}

// Auth types
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
}
