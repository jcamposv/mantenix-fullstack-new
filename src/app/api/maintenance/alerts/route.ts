/**
 * Maintenance Alerts API Endpoint
 *
 * GET /api/maintenance/alerts - Get maintenance alerts from database
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED' | 'AUTO_CLOSED'
 * - severity: 'CRITICAL' | 'WARNING' | 'INFO' (can repeat)
 * - criticality: 'A' | 'B' | 'C' (can repeat)
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - componentId: string
 * - assetId: string
 *
 * Following Next.js Expert standards:
 * - Repository pattern for data access
 * - Type-safe with Prisma types
 * - Server-side filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertHistoryRepository } from '@/server/repositories/maintenance-alert-history.repository'
import { getCurrentCompanyId } from '@/lib/company-context'
import { MaintenanceAlertStatus, MaintenanceAlertSeverity } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET - Retrieve maintenance alerts from database
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
        { error: 'Feature de Mantenimiento Predictivo no está activo' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // Status filter - default to ACTIVE for backwards compatibility
    const statusParam = searchParams.get('status')
    const status = statusParam as MaintenanceAlertStatus | null

    // Severity filter (can have multiple)
    const severityParam = searchParams.get('severity')
    const severity = severityParam as MaintenanceAlertSeverity | null

    // Other filters
    const componentId = searchParams.get('componentId')
    const assetId = searchParams.get('assetId')
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    // Validate status and severity if provided
    const validStatuses: MaintenanceAlertStatus[] = ['ACTIVE', 'RESOLVED', 'DISMISSED', 'AUTO_CLOSED']
    const validSeverities: MaintenanceAlertSeverity[] = ['CRITICAL', 'WARNING', 'INFO']

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido. Valores permitidos: ACTIVE, RESOLVED, DISMISSED, AUTO_CLOSED' },
        { status: 400 }
      )
    }

    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Severidad inválida. Valores permitidos: CRITICAL, WARNING, INFO' },
        { status: 400 }
      )
    }

    // Get alerts from repository with filters
    const result = await MaintenanceAlertHistoryRepository.findMany({
      companyId,
      status: status || undefined,
      severity: severity || undefined,
      componentId: componentId || undefined,
      assetId: assetId || undefined,
      startDate,
      endDate,
      page,
      limit,
    })

    // Calculate summary
    const summary = {
      total: result.total,
      critical: result.items.filter((a) => a.severity === 'CRITICAL').length,
      warnings: result.items.filter((a) => a.severity === 'WARNING').length,
      info: result.items.filter((a) => a.severity === 'INFO').length,
      byType: {} as Record<string, number>, // Can be calculated from details JSON if needed
    }

    // Map to include alertHistoryId for compatibility
    const items = result.items.map(alert => ({
      ...alert,
      alertHistoryId: alert.id, // The DB id IS the alertHistoryId
    }))

    return NextResponse.json({
      items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
      summary,
    })
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
