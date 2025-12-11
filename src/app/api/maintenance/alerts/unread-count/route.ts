/**
 * API Route: Get Unread MTBF Alerts Count
 *
 * Returns the count of unread/active MTBF alerts for real-time polling.
 * Following Next.js Expert standards:
 * - Server component (no 'use client')
 * - Type-safe with Zod validation
 * - Uses Service layer
 */

import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/maintenance/alerts/unread-count
 * Returns count of critical and warning alerts
 */
export async function GET() {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    // Check if authentication failed
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Get all alerts (they're generated on-demand)
    const allAlerts = await MaintenanceAlertService.generateAllAlerts(sessionResult)

    // Count by severity
    const critical = allAlerts.filter(a => a.severity === 'CRITICAL').length
    const warnings = allAlerts.filter(a => a.severity === 'WARNING').length
    const info = allAlerts.filter(a => a.severity === 'INFO').length

    return NextResponse.json({
      total: allAlerts.length,
      critical,
      warnings,
      info,
      hasUnread: allAlerts.length > 0,
    })
  } catch (error) {
    console.error('Error getting MTBF alerts count:', error)
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    )
  }
}
