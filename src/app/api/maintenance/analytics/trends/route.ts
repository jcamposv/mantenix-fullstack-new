/**
 * API Route: Maintenance Analytics Trends
 *
 * GET /api/maintenance/analytics/trends?period=7d|30d|90d
 * Returns time-series data for alert trends
 *
 * Following Next.js Expert standards:
 * - Feature flag gated
 * - Type-safe
 * - Uses Service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'
import { getCurrentCompanyId } from '@/lib/company-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface TrendDataPoint {
  date: string
  critical: number
  warnings: number
  info: number
  total: number
}

/**
 * GET - Retrieve trend data
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

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
        { error: 'Feature no activo' },
        { status: 403 }
      )
    }

    // Get period parameter
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30d'

    // Calculate days
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    // Get current alerts (in future, we'll query historical data from DB)
    const allAlerts = await MaintenanceAlertService.generateAllAlerts(sessionResult)

    // For now, generate mock trend data
    // In production, this would query actual historical alert records
    const trends: TrendDataPoint[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // Mock data: slight variation around current state
      // In production: SELECT COUNT(*) FROM alerts WHERE DATE(createdAt) = date
      const variance = 0.1 + Math.random() * 0.3 // 10-40% variance
      const critical = Math.floor(allAlerts.filter(a => a.severity === 'CRITICAL').length * variance)
      const warnings = Math.floor(allAlerts.filter(a => a.severity === 'WARNING').length * variance)
      const info = Math.floor(allAlerts.filter(a => a.severity === 'INFO').length * variance)

      trends.push({
        date: dateStr,
        critical,
        warnings,
        info,
        total: critical + warnings + info,
      })
    }

    return NextResponse.json({ trends, period })
  } catch (error) {
    console.error('Error getting trends:', error)
    return NextResponse.json(
      { error: 'Error al obtener tendencias' },
      { status: 500 }
    )
  }
}
