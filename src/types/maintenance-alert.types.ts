/**
 * Maintenance Alert Types
 *
 * TypeScript types for MTBF-based maintenance alerts and inventory warnings.
 * Follows ISO 14224 standards for predictive maintenance.
 */

import type { ComponentCriticality } from '@prisma/client'

/**
 * Alert severity levels
 */
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO'

/**
 * Alert type categories
 */
export type AlertType =
  | 'URGENT_MTBF' // Stock critically low with imminent maintenance
  | 'WARNING_MTBF' // Stock low approaching maintenance date
  | 'LEAD_TIME_EXCEEDED' // Lead time longer than time to maintenance
  | 'STOCK_OUT_CRITICAL' // Out of stock for critical component
  | 'REORDER_RECOMMENDED' // Stock below reorder point

/**
 * MTBF-based maintenance alert
 */
export interface MaintenanceAlert {
  id: string
  type: AlertType
  severity: AlertSeverity

  // Component information
  componentId: string
  componentName: string
  partNumber: string | null
  criticality: ComponentCriticality | null

  // Technical data (for persistence)
  mtbf: number | null // Mean Time Between Failures (hours)
  currentOperatingHours: number // Current operating hours

  // Inventory information
  inventoryItemId: string | null
  currentStock: number
  minimumStock: number
  reorderPoint: number

  // Timing information
  hoursUntilMaintenance: number
  daysUntilMaintenance: number
  leadTimeDays: number

  // Alert details
  message: string
  recommendation: string
  priority: number // 1 = highest, 5 = lowest

  // Timestamps
  generatedAt: Date
  expiresAt: Date | null
}

/**
 * Alert summary for dashboard display
 */
export interface AlertSummary {
  total: number
  critical: number
  warnings: number
  info: number
  byType: Record<AlertType, number>
}

/**
 * Parameters for generating MTBF alerts
 */
export interface MTBFAlertParams {
  componentId: string
  componentName: string
  partNumber: string | null
  criticality: ComponentCriticality | null

  // Technical data
  mtbf: number | null
  currentOperatingHours: number

  // Inventory data
  inventoryItemId: string | null
  currentStock: number
  minimumStock: number
  reorderPoint: number
  leadTime: number // days
}

/**
 * Stock status derived from inventory levels
 */
export type StockStatus = 'CRITICAL' | 'LOW' | 'SUFFICIENT'

/**
 * Alert filter options
 */
export interface AlertFilters {
  severity?: AlertSeverity[]
  type?: AlertType[]
  criticality?: ComponentCriticality[]
  daysUntilMaintenance?: {
    min?: number
    max?: number
  }
  stockStatus?: StockStatus[]
}

/**
 * Paginated alerts response
 */
export interface PaginatedAlertsResponse {
  items: MaintenanceAlert[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: AlertSummary
}
