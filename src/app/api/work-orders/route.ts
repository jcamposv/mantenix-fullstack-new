import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { createWorkOrderSchema } from '@/schemas/work-order'
import type { CreateWorkOrderData, WorkOrderFilters, WorkOrderType, WorkOrderPriority, WorkOrderStatus } from '@/types/work-order.types'

export const dynamic = 'force-dynamic'

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
    
    // Build filters
    const filters: WorkOrderFilters = {}
    
    if (searchParams.get('siteId')) filters.siteId = searchParams.get('siteId')!
    if (searchParams.get('assetId')) filters.assetId = searchParams.get('assetId')!
    if (searchParams.get('templateId')) filters.templateId = searchParams.get('templateId')!
    if (searchParams.get('type')) filters.type = searchParams.get('type') as WorkOrderType
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority') as WorkOrderPriority
    if (searchParams.get('status')) filters.status = searchParams.get('status') as WorkOrderStatus
    if (searchParams.get('search')) filters.search = searchParams.get('search')!
    if (searchParams.get('assignedToMe') === 'true') filters.assignedToMe = true
    if (searchParams.get('createdByMe') === 'true') filters.createdByMe = true
    
    // Date filters
    if (searchParams.get('scheduledDateFrom')) {
      filters.scheduledDateFrom = new Date(searchParams.get('scheduledDateFrom')!)
    }
    if (searchParams.get('scheduledDateTo')) {
      filters.scheduledDateTo = new Date(searchParams.get('scheduledDateTo')!)
    }

    // Get work orders
    const result = await WorkOrderService.getWorkOrders(
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
    console.error('Error fetching work orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const body = await request.json()
    
    // Validate request data
    const validationResult = createWorkOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const workOrderData: CreateWorkOrderData = {
      ...validationResult.data,
      scheduledDate: validationResult.data.scheduledDate 
        ? new Date(validationResult.data.scheduledDate) 
        : undefined,
      ...(validationResult.data.siteId && { siteId: validationResult.data.siteId })
    } as CreateWorkOrderData

    // Create work order
    const workOrder = await WorkOrderService.createWorkOrder(session, workOrderData)

    return NextResponse.json({ 
      workOrder,
      message: 'Orden de trabajo creada exitosamente' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}