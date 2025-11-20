import { NextRequest, NextResponse } from "next/server"
import { WorkOrderScheduleService } from "@/server/services/work-order-schedule.service"
import { WorkOrderRepository } from "@/server/repositories/work-order.repository"
import { AuthService } from "@/server/services/auth.service"
import { dateRangeSchema } from "@/app/api/schemas/work-order-schedule-schemas"

export const dynamic = 'force-dynamic'

/**
 * GET /api/work-order-schedules/upcoming
 * Get upcoming schedules AND generated work orders for calendar view
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

    const dateRange = dateRangeSchema.parse({
      startDate,
      endDate
    })

    // Get upcoming schedules (future generations)
    const schedules = await WorkOrderScheduleService.getUpcomingSchedules(
      session,
      new Date(dateRange.startDate),
      new Date(dateRange.endDate)
    )

    // Get generated work orders within date range
    const { items: allWorkOrders } = await WorkOrderRepository.findMany(
      {
        scheduledDateFrom: new Date(dateRange.startDate),
        scheduledDateTo: new Date(dateRange.endDate)
      },
      undefined, // no pagination limit for calendar
      session.user.companyId
    )

    // Filter to only include work orders generated from schedules
    const workOrders = allWorkOrders.filter(wo => wo.scheduleId !== null)

    // Transform schedules to FullCalendar format (future events)
    const scheduleEvents = schedules.map(schedule => ({
      id: `schedule-${schedule.id}`,
      title: `📅 ${schedule.name}`,
      start: schedule.nextGenerationDate,
      backgroundColor: getColorByRecurrenceType(schedule.recurrenceType),
      borderColor: getColorByRecurrenceType(schedule.recurrenceType),
      extendedProps: {
        type: 'schedule',
        scheduleId: schedule.id,
        description: schedule.description,
        recurrenceType: schedule.recurrenceType,
        assetName: schedule.asset?.name,
        siteName: schedule.site?.name,
        templateName: schedule.template.name,
        completionRate: schedule.completionRate,
        isActive: schedule.isActive
      }
    }))

    // Transform work orders to FullCalendar format (generated events)
    const workOrderEvents = workOrders.map(wo => ({
      id: `workorder-${wo.id}`,
      title: `🔧 ${wo.number}`,
      start: wo.scheduledDate,
      backgroundColor: getColorByStatus(wo.status),
      borderColor: getColorByStatus(wo.status),
      extendedProps: {
        type: 'workOrder',
        workOrderId: wo.id,
        number: wo.number,
        status: wo.status,
        priority: wo.priority,
        assetName: wo.asset?.name,
        siteName: wo.site?.name,
        scheduleId: wo.scheduleId
      }
    }))

    // Combine both types of events
    const events = [...scheduleEvents, ...workOrderEvents]

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching upcoming schedules:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get color by recurrence type (for schedules)
 */
function getColorByRecurrenceType(recurrenceType: string): string {
  const colorMap: Record<string, string> = {
    DAILY: "#3b82f6", // blue
    WEEKLY: "#10b981", // green
    MONTHLY: "#f59e0b", // amber
    YEARLY: "#8b5cf6", // purple
    METER_BASED: "#ef4444", // red
  }
  return colorMap[recurrenceType] ?? "#6b7280" // gray as default
}

/**
 * Helper function to get color by work order status
 */
function getColorByStatus(status: string): string {
  const colorMap: Record<string, string> = {
    OPEN: "#dc2626", // red-600 (darker than schedule colors)
    IN_PROGRESS: "#ca8a04", // yellow-600
    UNDER_REVIEW: "#2563eb", // blue-600
    COMPLETED: "#16a34a", // green-600
    CANCELLED: "#52525b", // zinc-600
  }
  return colorMap[status] ?? "#52525b"
}
