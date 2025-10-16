import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { workOrderAssignmentSchema } from '@/schemas/work-order'
import type { WorkOrderAssignmentData } from '@/types/work-order.types'

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
    const validationResult = workOrderAssignmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const assignmentData: WorkOrderAssignmentData = {
      userIds: validationResult.data.userIds
    }

    // Assign users to work order
    const assignments = await WorkOrderService.assignUsers(
      session,
      resolvedParams.id,
      assignmentData
    )

    return NextResponse.json({ 
      assignments,
      message: 'Usuarios asignados exitosamente' 
    })
  } catch (error) {
    console.error('Error assigning users to work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}