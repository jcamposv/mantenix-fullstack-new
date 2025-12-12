/**
 * QA Reject Work Order Endpoint
 *
 * Rejects a work order after QA inspection, changing status back to IN_PROGRESS.
 *
 * Following Next.js Expert standards:
 * - Thin controller
 * - Input validation with Zod
 * - Delegates to service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { z } from 'zod'

const qaRejectSchema = z.object({
  comments: z.string().min(1, 'Los comentarios son requeridos al rechazar')
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await AuthService.getAuthenticatedSession()
    if (session instanceof NextResponse) return session

    // Get work order ID
    const { id } = await params

    // Parse and validate body
    const body = await request.json()
    const validated = qaRejectSchema.parse(body)

    // Reject QA
    const workOrder = await WorkOrderService.qaRejectWorkOrder(
      session,
      id,
      validated.comments
    )

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Orden de trabajo no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ workOrder })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error rejecting QA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al rechazar QA' },
      { status: 500 }
    )
  }
}
