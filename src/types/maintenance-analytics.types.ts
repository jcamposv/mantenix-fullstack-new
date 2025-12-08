/**
 * Maintenance Analytics Types
 *
 * Type definitions for analytics dashboard.
 * Following Next.js Expert standards: centralized types.
 */

export interface AnalyticsSummary {
  totalAlerts: number
  critical: number
  warnings: number
  info: number
  averageResponseTime: number // hours
  effectiveness: number // percentage
  topComponents: TopComponent[]
  byCriticality: CriticalityDistribution
}

export interface TopComponent {
  componentId: string
  componentName: string
  partNumber: string | null
  alertCount: number
  criticality: string | null
}

export interface CriticalityDistribution {
  A: number
  B: number
  C: number
}

export interface TrendDataPoint {
  date: string
  critical: number
  warnings: number
  info: number
  total: number
}

export interface TrendsResponse {
  trends: TrendDataPoint[]
  period: string
}
