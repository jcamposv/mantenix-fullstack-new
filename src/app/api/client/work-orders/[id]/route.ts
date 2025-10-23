import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ClientWorkOrderService } from '@/server/services/client-work-order.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/client/work-orders/[id]
 * Get work order by ID for client users
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Verify user is a client user
    const clientRoles = ['CLIENTE_ADMIN_GENERAL', 'CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO']
    if (!clientRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo para usuarios clientes.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Get work order using client service (automatically filtered by permissions)
    const workOrder = await ClientWorkOrderService.getWorkOrderById(session, id)

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Orden de trabajo no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ workOrder })
  } catch (error) {
    console.error('Error fetching client work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
