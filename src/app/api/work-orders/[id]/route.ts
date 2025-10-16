import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { updateWorkOrderSchema } from '@/schemas/work-order'
import type { UpdateWorkOrderData } from '@/types/work-order.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const resolvedParams = await params
    const workOrder = await WorkOrderService.getWorkOrderById(session, resolvedParams.id)

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ workOrder })
  } catch (error) {
    console.error('Error fetching work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const resolvedParams = await params
    const body = await request.json()

    // Validate request data
    const validationResult = updateWorkOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updateData: UpdateWorkOrderData = {
      ...validationResult.data,
      scheduledDate: validationResult.data.scheduledDate 
        ? new Date(validationResult.data.scheduledDate) 
        : undefined
    }

    // Update work order
    const workOrder = await WorkOrderService.updateWorkOrder(
      session,
      resolvedParams.id,
      updateData
    )

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      workOrder,
      message: 'Orden de trabajo actualizada exitosamente' 
    })
  } catch (error) {
    console.error('Error updating work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const resolvedParams = await params
    
    // Soft delete work order
    const workOrder = await WorkOrderService.deleteWorkOrder(session, resolvedParams.id)

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Orden de trabajo eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}