import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { WorkOrderRepository } from "@/server/repositories/work-order.repository"

export const dynamic = 'force-dynamic'

/**
 * GET /api/work-orders/calendar
 * Get work orders for calendar view within a date range
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Validate date range
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate y endDate son requeridos" },
        { status: 400 }
      )
    }

    // Get work orders using findMany with proper filters
    const { workOrders } = await WorkOrderRepository.findMany(
      {
        scheduledDateFrom: new Date(startDate),
        scheduledDateTo: new Date(endDate)
      },
      undefined, // no pagination limit for calendar
      session.user.companyId
    )

    // Transform to FullCalendar format
    const events = workOrders.map(wo => ({
      id: wo.id,
      title: wo.title,
      start: wo.scheduledDate,
      backgroundColor: getColorByStatus(wo.status),
      borderColor: getColorByStatus(wo.status),
      extendedProps: {
        workOrderId: wo.id,
        number: wo.number,
        status: wo.status,
        priority: wo.priority,
        type: wo.type,
        assetName: wo.asset?.name,
        siteName: wo.site?.name,
        assignedTo: wo.assignments && wo.assignments.length > 0
          ? wo.assignments[0].user.name
          : undefined
      }
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching calendar work orders:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get color by work order status
 */
function getColorByStatus(status: string): string {
  const colorMap: Record<string, string> = {
    OPEN: "#ef4444", // red
    IN_PROGRESS: "#eab308", // yellow
    UNDER_REVIEW: "#3b82f6", // blue
    COMPLETED: "#22c55e", // green
    CANCELLED: "#6b7280", // gray
  }
  return colorMap[status] ?? "#6b7280"
}
