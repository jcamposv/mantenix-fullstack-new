import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import type { WorkOrderFilters } from '@/types/work-order.types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse query parameters for filters
    const { searchParams } = new URL(request.url)
    
    // Build filters
    const filters: WorkOrderFilters = {}
    
    if (searchParams.get('siteId')) filters.siteId = searchParams.get('siteId')!
    if (searchParams.get('assetId')) filters.assetId = searchParams.get('assetId')!
    if (searchParams.get('templateId')) filters.templateId = searchParams.get('templateId')!

    // Get work order statistics
    const stats = await WorkOrderService.getWorkOrderStats(session, filters)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching work order stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}