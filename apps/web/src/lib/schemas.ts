import { z } from "zod"

// Theme colors schema
export const themeColorsSchema = z.object({
  primary: z.string().min(1, "Primary color is required"),
  secondary: z.string().min(1, "Secondary color is required"),
  accent: z.string().min(1, "Accent color is required"),
  background: z.string().min(1, "Background color is required"),
  foreground: z.string().min(1, "Foreground color is required"),
  muted: z.string().min(1, "Muted color is required"),
  mutedForeground: z.string().min(1, "Muted foreground color is required"),
  border: z.string().min(1, "Border color is required"),
})

export const themeFontsSchema = z.object({
  heading: z.string().optional(),
  body: z.string().optional(),
})

export const themeSchema = z.object({
  logo: z.string().optional(),
  colors: themeColorsSchema,
  fonts: themeFontsSchema.optional(),
})

// School Schema (basic info)
export const schoolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  domain: z.string().min(3, "Domain must be at least 3 characters"),
  status: z.enum(["active", "inactive", "pending"]),
  plan: z.enum(["free", "basic", "premium"]),
})

// Extended school schema with theme
export const schoolWithThemeSchema = schoolSchema.extend({
  theme: themeSchema.optional(),
})

export type SchoolFormData = z.infer<typeof schoolSchema>
export type SchoolWithThemeFormData = z.infer<typeof schoolWithThemeSchema>
export type ThemeFormData = z.infer<typeof themeSchema>

// Class Schema
export const classSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  school: z.string().min(1, "School is required"),
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  teacher: z.string().min(1, "Teacher is required"),
  status: z.enum(["active", "inactive"]),
})

export type ClassFormData = z.infer<typeof classSchema>

// Student Schema
export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  school: z.string().min(1, "School is required"),
  grade: z.string().min(1, "Grade is required"),
  status: z.enum(["active", "inactive", "graduated"]),
})

export type StudentFormData = z.infer<typeof studentSchema>

// Teacher Schema
export const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  school: z.string().min(1, "School is required"),
  subjects: z.string().min(1, "At least one subject is required"),
  status: z.enum(["active", "inactive", "on_leave"]),
})

export type TeacherFormData = z.infer<typeof teacherSchema>

// Counselor Schema
export const counselorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  target: z.coerce.number().min(1, "Target must be at least 1"),
  status: z.enum(["active", "inactive"]),
})

export type CounselorFormData = z.infer<typeof counselorSchema>

// Partner Schema
export const partnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["individual", "company"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "pending"]),
})

export type PartnerFormData = z.infer<typeof partnerSchema>

// Parent Schema
export const parentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  occupation: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type ParentFormData = z.infer<typeof parentSchema>
