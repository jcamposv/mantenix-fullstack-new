import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import type { WorkOrderFilters } from '@/types/work-order.types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse query parameters for filters
    const searchParams = request.nextUrl.searchParams
    const filters: WorkOrderFilters = {}

    // Date range filters
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (dateFrom) {
      filters.createdAtFrom = new Date(dateFrom)
    }

    if (dateTo) {
      filters.createdAtTo = new Date(dateTo)
    }

    // Get dashboard statistics with filters
    const stats = await WorkOrderService.getDashboardStats(session, filters)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching work order dashboard stats:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}