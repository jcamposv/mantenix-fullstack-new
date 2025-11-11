import { NextRequest, NextResponse } from "next/server"
import { CalendarService } from "@/server/services/calendar.service"
import { AuthService } from "@/server/services/auth.service"
import { calendarDateRangeSchema, calendarFiltersSchema } from "@/schemas/calendar.schema"
import { z } from "zod"

export const dynamic = "force-dynamic"

/**
 * GET /api/calendar/events
 * Get all calendar events (schedules + work orders) for a date range
 *
 * Query params:
 * - startDate: ISO datetime string (required)
 * - endDate: ISO datetime string (required)
 * - filters: JSON string with CalendarFilters (optional)
 *
 * Example:
 * GET /api/calendar/events?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const filtersParam = searchParams.get("filters")

    // Validate required date parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          error: "Los parámetros startDate y endDate son requeridos",
          details: "Ambas fechas deben estar en formato ISO 8601 (ej: 2025-01-01T00:00:00Z)",
        },
        { status: 400 }
      )
    }

    // Validate date range
    const dateRangeValidation = calendarDateRangeSchema.safeParse({
      startDate,
      endDate,
    })

    if (!dateRangeValidation.success) {
      return NextResponse.json(
        {
          error: "Rango de fechas inválido",
          details: dateRangeValidation.error.errors,
        },
        { status: 400 }
      )
    }

    // Parse and validate filters if provided
    let filters
    if (filtersParam) {
      try {
        const parsedFilters = JSON.parse(filtersParam)
        const filtersValidation = calendarFiltersSchema.safeParse(parsedFilters)

        if (!filtersValidation.success) {
          return NextResponse.json(
            {
              error: "Filtros inválidos",
              details: filtersValidation.error.errors,
            },
            { status: 400 }
          )
        }

        filters = filtersValidation.data
      } catch (error) {
        return NextResponse.json(
          {
            error: "Formato de filtros inválido",
            details: "Los filtros deben ser un objeto JSON válido",
          },
          { status: 400 }
        )
      }
    }

    // Get calendar events from service
    const events = await CalendarService.getCalendarEvents(
      session.user.companyId,
      {
        start: new Date(startDate),
        end: new Date(endDate),
      },
      filters
    )

    // Return events in FullCalendar format
    return NextResponse.json(
      {
        success: true,
        events,
        meta: {
          total: events.length,
          startDate,
          endDate,
          filters: filters ?? null,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching calendar events:", error)

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
