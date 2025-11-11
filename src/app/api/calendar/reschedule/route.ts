import { NextRequest, NextResponse } from "next/server"
import { CalendarService } from "@/server/services/calendar.service"
import { AuthService } from "@/server/services/auth.service"
import { eventRescheduleSchema } from "@/schemas/calendar.schema"
import { z } from "zod"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/calendar/reschedule
 * Reschedule a calendar event (schedule or work order)
 *
 * Body:
 * {
 *   eventId: string,
 *   eventType: "schedule" | "workOrder",
 *   newDate: string (ISO datetime),
 *   delta?: number (milliseconds)
 * }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse and validate request body
    const body = await request.json()
    const validation = eventRescheduleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos de entrada inválidos",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { eventId, eventType, newDate } = validation.data

    // Extract actual ID (remove prefix if present)
    const actualId = eventId.replace(/^(schedule-|workorder-)/, "")

    // Call service to reschedule
    const result = await CalendarService.rescheduleEvent(
      actualId,
      eventType,
      session.user.companyId,
      new Date(newDate)
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error rescheduling event:", error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validación de datos fallida",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Handle generic errors
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
