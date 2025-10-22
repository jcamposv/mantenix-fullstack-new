import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { completeWorkOrderSchema } from '@/schemas/work-order'
import type { CompleteWorkOrderData } from '@/types/work-order.types'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const resolvedParams = await params
    const body = await request.json()

    // Validate request data
    const validationResult = completeWorkOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const completionData: CompleteWorkOrderData = validationResult.data

    // Complete work order
    const workOrder = await WorkOrderService.completeWorkOrder(
      session,
      resolvedParams.id,
      completionData
    )

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      workOrder,
      message: 'Orden de trabajo completada exitosamente' 
    })
  } catch (error) {
    console.error('Error completing work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}