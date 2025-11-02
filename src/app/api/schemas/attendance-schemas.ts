import * as z from "zod"

// ============================================================================
// ATTENDANCE SCHEMAS
// ============================================================================

export const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  deviceInfo: z.string().optional(),
  notes: z.string().optional()
})

export const checkOutSchema = z.object({
  attendanceId: z.string().min(1, "ID de asistencia requerido"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().optional()
})

export const attendanceFiltersSchema = z.object({
  userId: z.string().optional(),
  locationId: z.string().optional(),
  status: z.enum(["ON_TIME", "LATE", "ABSENT", "JUSTIFIED", "EARLY_DEPARTURE"]).optional(),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  month: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  year: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20))
})

export const monthlyReportParamsSchema = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
  month: z.string().transform((val) => parseInt(val, 10)),
  year: z.string().transform((val) => parseInt(val, 10))
})

export const dailySummaryParamsSchema = z.object({
  date: z.string().transform((val) => new Date(val))
})

// ============================================================================
// LOCATION SCHEMAS
// ============================================================================

export const createLocationSchema = z.object({
  companyId: z.string().min(1, "ID de empresa requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(5000).optional().default(100)
})

export const updateLocationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().min(10).max(5000).optional(),
  isActive: z.boolean().optional()
})

export const locationFiltersSchema = z.object({
  companyId: z.string().optional(),
  isActive: z.string().optional().transform((val) => val === "true"),
  search: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20))
})

// ============================================================================
// FEATURE SCHEMAS
// ============================================================================

export const featureModuleEnum = z.enum([
  "HR_ATTENDANCE",
  "HR_VACATIONS",
  "HR_PERMISSIONS",
  "AI_ASSISTANT",
  "ADVANCED_ANALYTICS"
])

export const toggleFeatureSchema = z.object({
  companyId: z.string().min(1, "ID de empresa requerido"),
  module: featureModuleEnum,
  isEnabled: z.boolean()
})

export const createFeatureSchema = z.object({
  companyId: z.string().min(1, "ID de empresa requerido"),
  module: featureModuleEnum,
  isEnabled: z.boolean().optional().default(true)
})

export const featureFiltersSchema = z.object({
  companyId: z.string().optional(),
  module: featureModuleEnum.optional(),
  isEnabled: z.string().optional().transform((val) => val === "true"),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20))
})

// Type exports
export type CheckInData = z.infer<typeof checkInSchema>
export type CheckOutData = z.infer<typeof checkOutSchema>
export type AttendanceFilters = z.infer<typeof attendanceFiltersSchema>
export type MonthlyReportParams = z.infer<typeof monthlyReportParamsSchema>
export type DailySummaryParams = z.infer<typeof dailySummaryParamsSchema>

export type CreateLocationData = z.infer<typeof createLocationSchema>
export type UpdateLocationData = z.infer<typeof updateLocationSchema>
export type LocationFilters = z.infer<typeof locationFiltersSchema>

export type ToggleFeatureData = z.infer<typeof toggleFeatureSchema>
export type CreateFeatureData = z.infer<typeof createFeatureSchema>
export type FeatureFilters = z.infer<typeof featureFiltersSchema>
