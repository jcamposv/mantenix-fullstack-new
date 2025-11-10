import { NextRequest, NextResponse } from "next/server"
import { WorkOrderScheduleService } from "@/server/services/work-order-schedule.service"
import { AuthService } from "@/server/services/auth.service"
import {
  createWorkOrderScheduleSchema,
  workOrderScheduleFiltersSchema
} from "@/app/api/schemas/work-order-schedule-schemas"

export const dynamic = 'force-dynamic'

/**
 * GET /api/work-order-schedules
 * List all work order schedules with filters
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
    const params = Object.fromEntries(searchParams)
    const filters = workOrderScheduleFiltersSchema.parse(params)

    // Extract pagination
    const { page, limit, ...scheduleFilters } = filters

    // Get schedules
    const result = await WorkOrderScheduleService.getSchedules(
      session,
      scheduleFilters,
      page && limit ? { page, limit } : undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching work order schedules:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/work-order-schedules
 * Create new work order schedule
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse request body
    const body = await request.json()
    const scheduleData = createWorkOrderScheduleSchema.parse(body)

    // Convert date strings (YYYY-MM-DD) to Date objects
    // Add time to avoid timezone issues
    const input = {
      ...scheduleData,
      recurrenceEndDate: scheduleData.recurrenceEndDate
        ? new Date(`${scheduleData.recurrenceEndDate}T00:00:00`)
        : undefined,
      startDate: scheduleData.startDate
        ? new Date(`${scheduleData.startDate}T00:00:00`)
        : undefined
    }

    // Create schedule
    const schedule = await WorkOrderScheduleService.createSchedule(session, input)

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("Error creating work order schedule:", error)
    if (error instanceof Error) {
      // Check for validation errors
      if (error.message.includes("Ya existe")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("debe")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}
