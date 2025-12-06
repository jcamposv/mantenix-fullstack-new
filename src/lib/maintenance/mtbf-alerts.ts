/**
 * MTBF Alert Generator
 *
 * Generates predictive maintenance alerts based on MTBF (Mean Time Between Failures),
 * current operating hours, and inventory stock levels.
 * Follows ISO 14224 reliability standards.
 *
 * @module lib/maintenance/mtbf-alerts
 */

import type {
  MaintenanceAlert,
  MTBFAlertParams,
  AlertType,
  AlertSeverity,
} from '@/types/maintenance-alert.types'
import { randomUUID } from 'crypto'

/**
 * Priority calculation based on criticality and urgency
 */
const CRITICALITY_PRIORITY: Record<string, number> = {
  A: 1, // Critical = Highest priority
  B: 2, // Important = Medium priority
  C: 3, // Minor = Low priority
}

/**
 * Generate MTBF-based maintenance alert
 *
 * Logic:
 * 1. Calculate hours until next maintenance (MTBF - current hours)
 * 2. Convert to days
 * 3. Compare with lead time and current stock
 * 4. Generate appropriate alert if action needed
 *
 * @param params - Alert generation parameters
 * @returns MaintenanceAlert or null if no alert needed
 */
export function generateMTBFAlert(
  params: MTBFAlertParams
): MaintenanceAlert | null {
  const {
    componentId,
    componentName,
    partNumber,
    criticality,
    mtbf,
    currentOperatingHours,
    inventoryItemId,
    currentStock,
    minimumStock,
    reorderPoint,
    leadTime,
  } = params

  // Cannot generate alert without MTBF data
  if (!mtbf || mtbf <= 0) {
    return null
  }

  // Calculate time until maintenance
  const hoursUntilMaintenance = mtbf - currentOperatingHours
  const daysUntilMaintenance = hoursUntilMaintenance / 24

  // No alert needed if maintenance is far in the future
  if (daysUntilMaintenance > leadTime * 2) {
    return null
  }

  // Determine alert type and severity
  let alertType: AlertType
  let severity: AlertSeverity
  let message: string
  let recommendation: string
  let priority: number

  const basePriority = criticality
    ? CRITICALITY_PRIORITY[criticality]
    : CRITICALITY_PRIORITY.C

  // CRITICAL: Out of stock with maintenance imminent
  if (currentStock === 0 && daysUntilMaintenance <= leadTime) {
    alertType = 'STOCK_OUT_CRITICAL'
    severity = 'CRITICAL'
    message = `⚠️ CRÍTICO: Sin stock de ${componentName} y mantenimiento en ${Math.ceil(daysUntilMaintenance)} días`
    recommendation = `Pedir URGENTE con proveedor alternativo o express. Lead time normal: ${leadTime} días`
    priority = basePriority
  }
  // URGENT: Stock low and lead time exceeds time to maintenance
  else if (
    currentStock < minimumStock &&
    daysUntilMaintenance <= leadTime
  ) {
    alertType = 'URGENT_MTBF'
    severity = 'CRITICAL'
    message = `🚨 URGENTE: Pedir ${componentName} AHORA`
    recommendation = `Mantenimiento en ${Math.ceil(daysUntilMaintenance)} días, lead time ${leadTime} días, stock actual: ${currentStock}`
    priority = basePriority
  }
  // WARNING: Stock below reorder point
  else if (
    currentStock <= reorderPoint &&
    daysUntilMaintenance <= leadTime * 1.5
  ) {
    alertType = 'WARNING_MTBF'
    severity = 'WARNING'
    message = `⚠️ Stock bajo de ${componentName}`
    recommendation = `Considerar pedir pronto. Mantenimiento en ${Math.ceil(daysUntilMaintenance)} días, stock: ${currentStock}/${minimumStock}`
    priority = basePriority + 1
  }
  // INFO: Approaching reorder point
  else if (
    currentStock <= reorderPoint &&
    daysUntilMaintenance <= leadTime * 2
  ) {
    alertType = 'REORDER_RECOMMENDED'
    severity = 'INFO'
    message = `ℹ️ Reorden recomendada para ${componentName}`
    recommendation = `Stock actual: ${currentStock}, punto de reorden: ${reorderPoint}`
    priority = basePriority + 2
  }
  // No alert needed
  else {
    return null
  }

  // Generate alert object
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + 7) // Alert expires in 7 days

  return {
    id: randomUUID(),
    type: alertType,
    severity,
    componentId,
    componentName,
    partNumber,
    criticality,
    inventoryItemId,
    currentStock,
    minimumStock,
    reorderPoint,
    hoursUntilMaintenance,
    daysUntilMaintenance: Math.ceil(daysUntilMaintenance),
    leadTimeDays: leadTime,
    message,
    recommendation,
    priority,
    generatedAt: now,
    expiresAt,
  }
}

/**
 * Generate alerts for multiple components
 */
export function generateBulkMTBFAlerts(
  components: MTBFAlertParams[]
): MaintenanceAlert[] {
  return components
    .map(generateMTBFAlert)
    .filter((alert): alert is MaintenanceAlert => alert !== null)
    .sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      // Then by days until maintenance
      return a.daysUntilMaintenance - b.daysUntilMaintenance
    })
}

/**
 * Filter alerts by severity
 */
export function filterAlertsBySeverity(
  alerts: MaintenanceAlert[],
  severity: AlertSeverity
): MaintenanceAlert[] {
  return alerts.filter((alert) => alert.severity === severity)
}

/**
 * Get alert summary statistics
 */
export function getAlertSummary(alerts: MaintenanceAlert[]) {
  const summary = {
    total: alerts.length,
    critical: 0,
    warnings: 0,
    info: 0,
    byType: {} as Record<AlertType, number>,
  }

  alerts.forEach((alert) => {
    // Count by severity
    if (alert.severity === 'CRITICAL') summary.critical++
    else if (alert.severity === 'WARNING') summary.warnings++
    else if (alert.severity === 'INFO') summary.info++

    // Count by type
    summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1
  })

  return summary
}

/**
 * Check if component needs immediate attention
 */
export function needsImmediateAction(alert: MaintenanceAlert): boolean {
  return (
    alert.severity === 'CRITICAL' &&
    alert.daysUntilMaintenance <= alert.leadTimeDays
  )
}
