/**
 * Bulk Calculate Minimum Stock API Endpoint
 *
 * POST /api/maintenance/calculate-min-stock/bulk - Update all components
 *
 * Following Next.js Expert standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'

export const dynamic = 'force-dynamic'

/**
 * POST - Update minimum stock for ALL components with inventory
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const result = await MaintenanceAlertService.bulkUpdateMinimumStock(
      sessionResult
    )

    return NextResponse.json({
      success: true,
      message: `Actualización completada: ${result.updated} exitosos, ${result.failed} fallidos`,
      updated: result.updated,
      failed: result.failed,
    })
  } catch (error) {
    console.error('Error in bulk stock calculation:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al calcular stock mínimo en lote',
      },
      { status: 500 }
    )
  }
}
