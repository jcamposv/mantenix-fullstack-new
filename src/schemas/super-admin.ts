import { z } from "zod"

// Schema para filtros de métricas
export const metricsFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  companyId: z.string().optional()
})

export type MetricsFiltersData = z.infer<typeof metricsFiltersSchema>

// Types para las métricas
export interface CompanyMetrics {
  total: number
  active: number
  inactive: number
  growth: {
    month: number
    percentage: number
  }
}

export interface UserMetrics {
  total: number
  active: number // Users not locked
  inactive: number // Locked users
  byRole: Record<string, number>
  growth: {
    month: number
    percentage: number
  }
}

export interface SystemMetrics {
  workOrders: {
    total: number
    active: number
  }
  alerts: {
    total: number
    critical: number
  }
  assets: {
    total: number
  }
  inventory: {
    total: number
  }
  companyGroups: {
    total: number
    active: number
  }
}

export interface SaaSMetrics {
  companies: CompanyMetrics
  users: UserMetrics
  system: SystemMetrics
}
