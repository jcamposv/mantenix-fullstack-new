import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import type { WorkOrderFilters, WorkOrderType, WorkOrderPriority, WorkOrderStatus } from '@/types/work-order.types'

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    // Build filters (excluding assignedToMe since this endpoint is specifically for user's assigned work orders)
    const filters: Omit<WorkOrderFilters, 'assignedToMe'> = {}
    
    if (searchParams.get('siteId')) filters.siteId = searchParams.get('siteId')!
    if (searchParams.get('assetId')) filters.assetId = searchParams.get('assetId')!
    if (searchParams.get('templateId')) filters.templateId = searchParams.get('templateId')!
    if (searchParams.get('type')) filters.type = searchParams.get('type') as WorkOrderType
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority') as WorkOrderPriority
    if (searchParams.get('status')) filters.status = searchParams.get('status') as WorkOrderStatus
    if (searchParams.get('search')) filters.search = searchParams.get('search')!
    
    // Date filters
    if (searchParams.get('scheduledDateFrom')) {
      filters.scheduledDateFrom = new Date(searchParams.get('scheduledDateFrom')!)
    }
    if (searchParams.get('scheduledDateTo')) {
      filters.scheduledDateTo = new Date(searchParams.get('scheduledDateTo')!)
    }

    // Get work orders assigned to current user
    const result = await WorkOrderService.getMyWorkOrders(
      session,
      filters,
      { page, limit }
    )

    const totalPages = Math.ceil(result.total / limit)

    return NextResponse.json({
      workOrders: result.workOrders,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching my work orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}