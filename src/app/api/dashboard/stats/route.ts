/**
 * Dashboard Stats API Endpoint
 *
 * Returns aggregated statistics for the executive dashboard.
 * Requires 'dashboard.view_global' permission.
 *
 * Following Next.js Expert standards:
 * - Next.js 15 Route Handler
 * - Type-safe
 * - Permission-based access control
 */

import { NextRequest, NextResponse } from 'next/server'
import { DashboardService } from '@/server/services/dashboard.service'
import { AuthService } from '@/server/services/auth.service'
import type { TimeRange } from '@/components/dashboard/time-range-selector'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Check permission
    const hasPermission = await AuthService.canUserPerformActionAsync(
      sessionResult,
      'dashboard.view_global'
    )
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'No tiene permisos para ver el dashboard global' },
        { status: 403 }
      )
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'month'
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    // Parse custom date range if provided
    let startDate: Date | undefined
    let endDate: Date | undefined
    if (timeRange === 'custom' && startDateStr && endDateStr) {
      startDate = new Date(startDateStr)
      endDate = new Date(endDateStr)
    }

    // Get dashboard stats with time range
    const stats = await DashboardService.getDashboardStats(
      sessionResult,
      timeRange,
      startDate,
      endDate
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener estadísticas del dashboard',
      },
      { status: 500 }
    )
  }
}
