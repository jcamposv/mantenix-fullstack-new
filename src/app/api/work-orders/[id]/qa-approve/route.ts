/**
 * QA Approve Work Order Endpoint
 *
 * Approves a work order after QA inspection, changing status from PENDING_QA to COMPLETED.
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

const qaApproveSchema = z.object({
  comments: z.string().optional()
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
    const validated = qaApproveSchema.parse(body)

    // Approve QA
    const workOrder = await WorkOrderService.qaApproveWorkOrder(
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

    console.error('Error approving QA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al aprobar QA' },
      { status: 500 }
    )
  }
}
