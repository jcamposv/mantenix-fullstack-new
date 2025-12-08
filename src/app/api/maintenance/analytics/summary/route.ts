/**
 * API Route: Maintenance Analytics Summary
 *
 * GET /api/maintenance/analytics/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Returns KPIs and summary metrics for MTBF alerts
 *
 * Following Next.js Expert standards:
 * - Feature flag gated (PREDICTIVE_MAINTENANCE)
 * - Type-safe with explicit return types
 * - Uses Repository layer for historical data
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertHistoryRepository } from '@/server/repositories/maintenance-alert-history.repository'
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
    componentId: string
    componentName: string
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
 * GET - Retrieve analytics summary with optional date filters
 */
export async function GET(request: NextRequest) {
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

    // Get date filters from query params
    const searchParams = request.nextUrl.searchParams
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    // Get analytics summary from repository (historical data)
    const summary = await MaintenanceAlertHistoryRepository.getAnalyticsSummary(
      companyId,
      startDate,
      endDate
    )

    // Calculate average response time
    // TODO: In future, calculate from actual resolved alerts
    const averageResponseTime = 48 // Mock: 48 hours average

    // Calculate effectiveness
    // TODO: In future, calculate from resolved vs total alerts
    const effectiveness = 70 // Mock: 70% effectiveness

    const fullSummary: AnalyticsSummary = {
      ...summary,
      averageResponseTime,
      effectiveness,
    }

    return NextResponse.json(fullSummary)
  } catch (error) {
    console.error('Error getting analytics summary:', error)
    return NextResponse.json(
      { error: 'Error al obtener analytics' },
      { status: 500 }
    )
  }
}
