import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get dashboard statistics
    const stats = await WorkOrderService.getDashboardStats(session)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching work order dashboard stats:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}