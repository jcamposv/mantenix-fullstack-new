/**
 * Maintenance Alerts API Endpoint
 *
 * GET /api/maintenance/alerts - Get MTBF-based maintenance alerts
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - severity: 'CRITICAL' | 'WARNING' | 'INFO' (can repeat)
 * - criticality: 'A' | 'B' | 'C' (can repeat)
 * - critical_only: 'true' | 'false'
 *
 * Following Next.js Expert standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'
import type {
  AlertSeverity,
  AlertFilters,
} from '@/types/maintenance-alert.types'
import type { ComponentCriticality } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET - Retrieve maintenance alerts
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const searchParams = request.nextUrl.searchParams

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Check for critical-only mode
    const criticalOnly = searchParams.get('critical_only') === 'true'

    if (criticalOnly) {
      const criticalAlerts =
        await MaintenanceAlertService.getCriticalAlerts(sessionResult, limit)

      return NextResponse.json({
        items: criticalAlerts,
        total: criticalAlerts.length,
        page: 1,
        limit,
        totalPages: 1,
        summary: {
          total: criticalAlerts.length,
          critical: criticalAlerts.length,
          warnings: 0,
          info: 0,
          byType: {},
        },
      })
    }

    // Parse filters
    const filters: AlertFilters = {}

    // Severity filter (can have multiple)
    const severities = searchParams.getAll('severity')
    if (severities.length > 0) {
      filters.severity = severities as AlertSeverity[]
    }

    // Criticality filter (can have multiple)
    const criticalities = searchParams.getAll('criticality')
    if (criticalities.length > 0) {
      filters.criticality = criticalities as ComponentCriticality[]
    }

    // Days until maintenance filter
    const minDays = searchParams.get('min_days')
    const maxDays = searchParams.get('max_days')
    if (minDays || maxDays) {
      filters.daysUntilMaintenance = {
        min: minDays ? parseInt(minDays) : undefined,
        max: maxDays ? parseInt(maxDays) : undefined,
      }
    }

    // Get alerts with filters
    const result = await MaintenanceAlertService.getAlerts(
      sessionResult,
      filters,
      page,
      limit
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching maintenance alerts:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener alertas de mantenimiento',
      },
      { status: 500 }
    )
  }
}
