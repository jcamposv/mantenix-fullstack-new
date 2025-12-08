/**
 * API Route: Maintenance Analytics Summary
 *
 * GET /api/maintenance/analytics/summary
 * Returns KPIs and summary metrics for MTBF alerts
 *
 * Following Next.js Expert standards:
 * - Feature flag gated (PREDICTIVE_MAINTENANCE)
 * - Type-safe with explicit return types
 * - Uses Service layer
 */

import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'
import { getCurrentCompanyId } from '@/lib/company-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface AnalyticsSummary {
  totalAlerts: number
  critical: number
  warnings: number
  info: number
  averageResponseTime: number // hours
  effectiveness: number // percentage
  topComponents: Array<{
    id: string
    name: string
    partNumber: string | null
    alertCount: number
    criticality: string | null
  }>
  byCriticality: {
    A: number
    B: number
    C: number
  }
}

/**
 * GET - Retrieve analytics summary
 */
export async function GET() {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Get company ID
    const companyId = await getCurrentCompanyId(sessionResult)
    if (!companyId) {
      return NextResponse.json(
        { error: 'No se pudo determinar la empresa' },
        { status: 400 }
      )
    }

    // Check feature flag
    const hasPredictiveMaintenance = await FeatureService.isModuleEnabled(
      companyId,
      'PREDICTIVE_MAINTENANCE'
    )

    if (!hasPredictiveMaintenance) {
      return NextResponse.json(
        { error: 'Feature de Mantenimiento Predictivo no está activo' },
        { status: 403 }
      )
    }

    // Get all alerts
    const allAlerts = await MaintenanceAlertService.generateAllAlerts(sessionResult)

    // Calculate metrics
    const totalAlerts = allAlerts.length
    const critical = allAlerts.filter(a => a.severity === 'CRITICAL').length
    const warnings = allAlerts.filter(a => a.severity === 'WARNING').length
    const info = allAlerts.filter(a => a.severity === 'INFO').length

    // Calculate average response time (mock for now - will be real when we track actions)
    // For now, use daysUntilMaintenance as a proxy
    const avgDays = allAlerts.length > 0
      ? allAlerts.reduce((sum, a) => sum + Math.abs(a.daysUntilMaintenance), 0) / allAlerts.length
      : 0
    const averageResponseTime = avgDays * 24 // convert to hours

    // Calculate effectiveness (mock - will be real when we track OT creation)
    // For now, assume 70% effectiveness
    const effectiveness = 70

    // Get top components (by alert severity and frequency)
    const componentMap = new Map<string, {
      id: string
      name: string
      partNumber: string | null
      criticality: string | null
      score: number
    }>()

    allAlerts.forEach(alert => {
      const existing = componentMap.get(alert.componentId)
      // Score: CRITICAL=3, WARNING=2, INFO=1
      const score = alert.severity === 'CRITICAL' ? 3 : alert.severity === 'WARNING' ? 2 : 1

      if (existing) {
        existing.score += score
      } else {
        componentMap.set(alert.componentId, {
          id: alert.componentId,
          name: alert.componentName,
          partNumber: alert.partNumber,
          criticality: alert.criticality,
          score,
        })
      }
    })

    const topComponents = Array.from(componentMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...rest }) => ({ ...rest, alertCount: score }))

    // Count by criticality
    const byCriticality = {
      A: allAlerts.filter(a => a.criticality === 'A').length,
      B: allAlerts.filter(a => a.criticality === 'B').length,
      C: allAlerts.filter(a => a.criticality === 'C').length,
    }

    const summary: AnalyticsSummary = {
      totalAlerts,
      critical,
      warnings,
      info,
      averageResponseTime,
      effectiveness,
      topComponents,
      byCriticality,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error getting analytics summary:', error)
    return NextResponse.json(
      { error: 'Error al obtener analytics' },
      { status: 500 }
    )
  }
}
