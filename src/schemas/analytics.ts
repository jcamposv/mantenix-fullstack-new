import { z } from "zod"

// ============================================================================
// DATE RANGE & FILTERS SCHEMAS
// ============================================================================

export const dateRangeSchema = z.object({
  from: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ),
  to: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ),
})

export const analyticsFiltersSchema = z.object({
  dateRange: dateRangeSchema.optional(),
  siteId: z.string().optional(),
  clientCompanyId: z.string().optional(),
  assetId: z.string().optional(),
  userId: z.string().optional(),
})

// ============================================================================
// PERIOD PRESETS (for quick date range selection)
// ============================================================================

export const periodPresetSchema = z.enum([
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "this_month",
  "last_month",
  "this_quarter",
  "last_quarter",
  "this_year",
  "last_year",
  "custom",
])

// ============================================================================
// ANALYTICS REQUEST SCHEMAS
// ============================================================================

export const dashboardKPIRequestSchema = z.object({
  filters: analyticsFiltersSchema.optional(),
  periodPreset: periodPresetSchema.default("last_30_days"),
  includeTimeseries: z.boolean().default(true),
  includeAssetReliability: z.boolean().default(true),
  includeMaintenancePerformance: z.boolean().default(true),
  includeCosts: z.boolean().default(true),
  includeResources: z.boolean().default(true),
})

export const assetReliabilityRequestSchema = z.object({
  filters: analyticsFiltersSchema.optional(),
  assetIds: z.array(z.string()).optional(), // Specific assets to analyze
  minFailureCount: z.number().min(0).default(1), // Only include assets with at least X failures
  sortBy: z.enum(["mtbf", "mttr", "availability", "oee", "failures"]).default("availability"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  limit: z.number().min(1).max(100).default(20),
})

export const maintenancePerformanceRequestSchema = z.object({
  filters: analyticsFiltersSchema.optional(),
  periodPreset: periodPresetSchema.default("last_30_days"),
  includeBacklogDetails: z.boolean().default(true),
  includePriorityBreakdown: z.boolean().default(true),
})

export const costAnalyticsRequestSchema = z.object({
  filters: analyticsFiltersSchema.optional(),
  periodPreset: periodPresetSchema.default("last_30_days"),
  groupBy: z.enum(["site", "asset", "type", "priority", "month"]).default("site"),
  includeBudgetComparison: z.boolean().default(false),
  targetBudget: z.number().min(0).optional(),
})

export const technicianMetricsRequestSchema = z.object({
  filters: analyticsFiltersSchema.optional(),
  userIds: z.array(z.string()).optional(), // Specific technicians to analyze
  sortBy: z.enum(["completionRate", "onTimeRate", "utilization", "workload"]).default("completionRate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().min(1).max(50).default(20),
})

export const timeseriesRequestSchema = z.object({
  filters: analyticsFiltersSchema.optional(),
  periodPreset: periodPresetSchema.default("last_30_days"),
  metric: z.enum([
    "workOrders",
    "completionRate",
    "costs",
    "availability",
    "mtbf",
    "mttr",
  ]).default("workOrders"),
  interval: z.enum(["hour", "day", "week", "month"]).default("day"),
  includeComparison: z.boolean().default(false), // Compare with previous period
})

// ============================================================================
// EXPORT & REPORT SCHEMAS
// ============================================================================

export const exportFormatSchema = z.enum(["pdf", "excel", "csv"])

export const reportSectionTypeSchema = z.enum(["kpi", "chart", "table", "text"])

export const exportOptionsSchema = z.object({
  format: exportFormatSchema,
  includeCharts: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  dateRange: dateRangeSchema,
  filters: analyticsFiltersSchema.optional(),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
})

export const reportSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: reportSectionTypeSchema,
  config: z.record(z.string(), z.unknown()),
  order: z.number().min(0).default(0),
})

export const reportTemplateSchema = z.object({
  id: z.string().optional(), // Optional for creation
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional(),
  sections: z.array(reportSectionSchema),
  defaultFilters: analyticsFiltersSchema.optional(),
  isPublic: z.boolean().default(false), // Share with all users in company
  schedule: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      dayOfWeek: z.number().min(0).max(6).optional(), // For weekly (0 = Sunday)
      dayOfMonth: z.number().min(1).max(31).optional(), // For monthly
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM format
      recipients: z.array(z.string().email()),
    })
    .optional(),
})

// ============================================================================
// ANOMALY DETECTION SCHEMAS
// ============================================================================

export const anomalyTypeSchema = z.enum([
  "spike", // Sudden increase
  "drop", // Sudden decrease
  "trend", // Gradual change
  "pattern", // Unusual pattern
])

export const anomalySeveritySchema = z.enum(["low", "medium", "high", "critical"])

export const anomalyDetectionConfigSchema = z.object({
  metric: z.enum([
    "workOrderCount",
    "failureRate",
    "completionTime",
    "cost",
    "downtime",
  ]),
  sensitivity: z.enum(["low", "medium", "high"]).default("medium"),
  lookbackDays: z.number().min(7).max(365).default(30),
  threshold: z.number().min(0).max(100).optional(), // Custom threshold percentage
})

// ============================================================================
// PREDICTIVE ANALYTICS SCHEMAS (FUTURE)
// ============================================================================

export const predictiveInsightRequestSchema = z.object({
  assetId: z.string().optional(),
  predictionHorizon: z.enum(["7_days", "30_days", "90_days", "1_year"]).default("30_days"),
  includeRecommendations: z.boolean().default(true),
  includeConfidenceScore: z.boolean().default(true),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DateRange = z.infer<typeof dateRangeSchema>
export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>
export type PeriodPreset = z.infer<typeof periodPresetSchema>
export type DashboardKPIRequest = z.infer<typeof dashboardKPIRequestSchema>
export type AssetReliabilityRequest = z.infer<typeof assetReliabilityRequestSchema>
export type MaintenancePerformanceRequest = z.infer<typeof maintenancePerformanceRequestSchema>
export type CostAnalyticsRequest = z.infer<typeof costAnalyticsRequestSchema>
export type TechnicianMetricsRequest = z.infer<typeof technicianMetricsRequestSchema>
export type TimeseriesRequest = z.infer<typeof timeseriesRequestSchema>
export type ExportOptions = z.infer<typeof exportOptionsSchema>
export type ReportTemplate = z.infer<typeof reportTemplateSchema>
export type ReportSection = z.infer<typeof reportSectionSchema>
export type AnomalyDetectionConfig = z.infer<typeof anomalyDetectionConfigSchema>
export type PredictiveInsightRequest = z.infer<typeof predictiveInsightRequestSchema>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert period preset to date range
 */
export function getPeriodDateRange(preset: PeriodPreset): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case "today":
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }

    case "yesterday": {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        from: yesterday,
        to: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      }
    }

    case "last_7_days": {
      const from = new Date(today)
      from.setDate(from.getDate() - 7)
      return { from, to: now }
    }

    case "last_30_days": {
      const from = new Date(today)
      from.setDate(from.getDate() - 30)
      return { from, to: now }
    }

    case "last_90_days": {
      const from = new Date(today)
      from.setDate(from.getDate() - 90)
      return { from, to: now }
    }

    case "this_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: now,
      }

    case "last_month": {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return {
        from: firstDayLastMonth,
        to: lastDayLastMonth,
      }
    }

    case "this_quarter": {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      return {
        from: new Date(now.getFullYear(), quarterStartMonth, 1),
        to: now,
      }
    }

    case "last_quarter": {
      const currentQuarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      const lastQuarterStartMonth = currentQuarterStartMonth - 3
      const from = new Date(now.getFullYear(), lastQuarterStartMonth, 1)
      const to = new Date(now.getFullYear(), currentQuarterStartMonth, 0, 23, 59, 59, 999)
      return { from, to }
    }

    case "this_year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: now,
      }

    case "last_year":
      return {
        from: new Date(now.getFullYear() - 1, 0, 1),
        to: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
      }

    case "custom":
    default:
      // For custom, return last 30 days as default
      return {
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: now,
      }
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Determine trend direction
 */
export function getTrend(percentageChange: number): 'up' | 'down' | 'stable' {
  if (Math.abs(percentageChange) < 5) return 'stable'
  return percentageChange > 0 ? 'up' : 'down'
}
