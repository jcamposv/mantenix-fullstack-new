/**
 * Maintenance Alert Detail API Route
 *
 * GET /api/maintenance/alerts/[id] - Get alert for specific component
 *
 * Following Next.js Expert standards:
 * - Type-safe
 * - Proper error handling
 * - Service layer pattern
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { id } = await context.params
    const alert = await MaintenanceAlertService.getAlertsForComponent(
      id,
      sessionResult
    )

    if (!alert) {
      return NextResponse.json({ error: 'No se encontró alerta' }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error fetching component alert:', error)
    return NextResponse.json(
      { error: 'Error al obtener la alerta' },
      { status: 500 }
    )
  }
}
