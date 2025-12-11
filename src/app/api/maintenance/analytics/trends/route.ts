/**
 * API Route: Maintenance Analytics Trends
 *
 * GET /api/maintenance/analytics/trends?period=7d|30d|90d
 * Returns time-series data for alert trends from historical data
 *
 * Following Next.js Expert standards:
 * - Feature flag gated
 * - Type-safe
 * - Uses Repository layer for historical data
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertHistoryRepository } from '@/server/repositories/maintenance-alert-history.repository'
import { getCurrentCompanyId } from '@/lib/company-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


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

    // Get trends data from repository (real historical data)
    const trends = await MaintenanceAlertHistoryRepository.getTrendsData(companyId, days)

    return NextResponse.json({ trends, period })
  } catch (error) {
    console.error('Error getting trends:', error)
    return NextResponse.json(
      { error: 'Error al obtener tendencias' },
      { status: 500 }
    )
  }
}
