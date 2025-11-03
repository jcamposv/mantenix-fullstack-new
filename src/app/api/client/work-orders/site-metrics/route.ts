import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ClientWorkOrderService } from '@/server/services/client-work-order.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/client/work-orders/site-metrics
 * Get work order metrics grouped by site for client users
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

    // Get date filters from query params
    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const dateRange = {
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    }

    // Get site metrics using client service
    const siteMetrics = await ClientWorkOrderService.getSiteMetrics(session, dateRange)

    return NextResponse.json({ sites: siteMetrics })
  } catch (error) {
    console.error('Error fetching site metrics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
