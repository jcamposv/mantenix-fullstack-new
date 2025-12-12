/**
 * Work Order Safety Briefings API Route
 * GET endpoint to fetch all safety briefings for a work order
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit interfaces
 * - Proper error handling
 * - Authentication required
 * - Single responsibility: fetch briefings
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { SafetyBriefingRepository } from '@/server/repositories/safety-briefing.repository'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/work-orders/[id]/safety-briefings
 * Returns all safety briefings for a work order with user info
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // Authentication check
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Get work order ID from params
    const { id: workOrderId } = await context.params

    if (!workOrderId) {
      return NextResponse.json(
        { error: 'Work order ID is required' },
        { status: 400 }
      )
    }

    // Fetch briefings from repository
    const briefings = await SafetyBriefingRepository.findByWorkOrder(workOrderId)

    return NextResponse.json({ briefings })
  } catch (error) {
    console.error('Error fetching safety briefings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
