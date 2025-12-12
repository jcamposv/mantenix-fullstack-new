import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ClientWorkOrderService } from '@/server/services/client-work-order.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/client/work-orders
 * Get work orders for client users (filtered by clientCompanyId or siteId)
 */
export async function GET(request: NextRequest) {
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

    // Parse pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Get work orders using client service
    const result = await ClientWorkOrderService.getWorkOrders(
      session,
      { page, limit }
    )

    return NextResponse.json({
      items: result.workOrders,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error) {
    console.error('Error fetching client work orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
