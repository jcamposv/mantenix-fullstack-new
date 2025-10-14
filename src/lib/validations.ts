/**
 * Zod Validation Schemas for Forms
 * Enterprise-grade validation with security requirements
 */

import { z } from "zod"

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Dirección de correo electrónico inválida")
    .max(255, "El correo electrónico es demasiado largo"),
  
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga"),
  
  remember: z.boolean().optional(),
})

export const mfaVerificationSchema = z.object({
  code: z
    .string()
    .min(1, "MFA code is required")
    .length(6, "MFA code must be 6 digits")
    .regex(/^\d{6}$/, "MFA code must contain only numbers"),
  
  trustDevice: z.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  
  confirmPassword: z.string().min(1, "Please confirm your password"),
  
  code: z.string().min(1, "Verification code is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// ============================================================================
// USER MANAGEMENT SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email is too long"),
  
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters"),
  
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN_EMPRESA", 
    "SUPERVISOR",
    "TECNICO",
    "CLIENTE_OPERATIVO",
    "CLIENTE_ADMIN"
  ]),
  
  companyId: z.string().cuid("Invalid company ID"),
  
  sendWelcomeEmail: z.boolean().optional().default(true),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters")
    .optional(),
  
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN_EMPRESA", 
    "SUPERVISOR",
    "TECNICO",
    "CLIENTE_OPERATIVO",
    "CLIENTE_ADMIN"
  ]).optional(),
  
  avatar: z.string().url("Invalid avatar URL").optional(),
  
  timezone: z.string().optional(),
  
  locale: z.string().optional(),
  
  preferences: z.record(z.string(), z.any()).optional(),
})

// ============================================================================
// COMPANY MANAGEMENT SCHEMAS
// ============================================================================

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name is too long"),
  
  subdomain: z
    .string()
    .min(1, "Subdomain is required")
    .min(3, "Subdomain must be at least 3 characters")
    .max(30, "Subdomain is too long")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens")
    .refine(val => !val.startsWith("-") && !val.endsWith("-"), {
      message: "Subdomain cannot start or end with a hyphen"
    })
    .refine(val => !["www", "api", "admin", "app", "mail", "ftp", "test", "staging", "dev"].includes(val), {
      message: "This subdomain is reserved"
    }),
  
  tier: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).default("STARTER"),
  
  mfaEnforced: z.boolean().default(false),
  
  ipWhitelist: z.array(z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "Invalid IP address")).optional(),
})

export const updateCompanySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name is too long")
    .optional(),
  
  tier: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  
  mfaEnforced: z.boolean().optional(),
  
  ipWhitelist: z.array(z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "Invalid IP address")).optional(),
  
  isActive: z.boolean().optional(),
})

export const updateBrandingSchema = z.object({
  logo: z.string().url("Invalid logo URL").optional(),
  
  logoSmall: z.string().url("Invalid small logo URL").optional(),
  
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Primary color must be a valid hex color")
    .optional(),
  
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Secondary color must be a valid hex color")
    .optional(),
  
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Background color must be a valid hex color")
    .optional(),
  
  customFont: z
    .string()
    .max(50, "Font name is too long")
    .optional(),
})

// ============================================================================
// SECURITY SCHEMAS
// ============================================================================

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  
  newPassword: z
    .string()
    .min(8, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

export const mfaSetupSchema = z.object({
  verificationCode: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
})

// ============================================================================
// SEARCH AND FILTERING SCHEMAS
// ============================================================================

export const auditLogFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  userId: z.string().cuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILURE", "WARNING"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const securityEventFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  type: z.enum([
    "FAILED_LOGIN",
    "ACCOUNT_LOCKED",
    "ACCOUNT_UNLOCKED",
    "SUSPICIOUS_LOGIN",
    "MFA_FAILED",
    "MFA_ENABLED",
    "MFA_DISABLED",
    "PASSWORD_CHANGED",
    "EMAIL_CHANGED",
    "LOGIN_SUCCESS",
    "LOGOUT",
    "SESSION_EXPIRED",
    "IP_BLOCKED",
    "PERMISSION_DENIED",
    "UNAUTHORIZED_ACCESS"
  ]).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  resolved: z.coerce.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>
export type MfaVerificationInput = z.infer<typeof mfaVerificationSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type MfaSetupInput = z.infer<typeof mfaSetupSchema>
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>
export type SecurityEventFilterInput = z.infer<typeof securityEventFilterSchema>