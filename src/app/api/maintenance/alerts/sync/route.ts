/**
 * API Route: Sync Maintenance Alerts
 *
 * POST /api/maintenance/alerts/sync
 * Generates current alerts and persists them to database for historical tracking
 *
 * Following Next.js Expert standards:
 * - Feature flag gated
 * - Type-safe
 * - Uses Service layer
 */

import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'
import { getCurrentCompanyId } from '@/lib/company-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST - Sync alerts to database
 */
export async function POST() {
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
        { error: 'Feature de Mantenimiento Predictivo no está activo' },
        { status: 403 }
      )
    }

    // Generate and sync alerts
    const result = await MaintenanceAlertService.generateAndSyncAlerts(sessionResult)

    return NextResponse.json({
      success: true,
      totalAlerts: result.alerts.length,
      sync: result.sync,
    })
  } catch (error) {
    console.error('Error syncing alerts:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar alertas' },
      { status: 500 }
    )
  }
}
