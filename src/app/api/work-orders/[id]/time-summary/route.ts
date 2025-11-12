/**
 * Work Order Time Summary API Route
 *
 * GET /api/work-orders/[id]/time-summary - Get time summary for work order
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { TimeTrackingService } from "@/server/services/time-tracking.service"

export const dynamic = "force-dynamic"

/**
 * GET /api/work-orders/[id]/time-summary
 * Get time tracking summary for a work order
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get work order ID from params
    const params = await context.params
    const workOrderId = params.id

    // Get time summary
    const timeTrackingService = new TimeTrackingService()
    const result = await timeTrackingService.getTimeSummary(session, workOrderId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("Error getting time summary:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
