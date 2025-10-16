import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const cancelWorkOrderSchema = z.object({
  reason: z.string().optional()
})

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
    const validationResult = cancelWorkOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Cancel work order
    const workOrder = await WorkOrderService.cancelWorkOrder(
      session,
      resolvedParams.id,
      validationResult.data.reason
    )

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      workOrder,
      message: 'Orden de trabajo cancelada exitosamente' 
    })
  } catch (error) {
    console.error('Error cancelling work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}