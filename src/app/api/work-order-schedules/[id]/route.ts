import { NextRequest, NextResponse } from "next/server"
import { WorkOrderScheduleService } from "@/server/services/work-order-schedule.service"
import { AuthService } from "@/server/services/auth.service"
import { updateWorkOrderScheduleSchema } from "@/app/api/schemas/work-order-schedule-schemas"
import type { UpdateScheduleInput } from "@/server/services/work-order-schedule.service"

export const dynamic = 'force-dynamic'

/**
 * GET /api/work-order-schedules/:id
 * Get single work order schedule by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;

    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const schedule = await WorkOrderScheduleService.getScheduleById(session, id)

    if (!schedule) {
      return NextResponse.json(
        { error: "Programación no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching work order schedule:", error)
    if (error instanceof Error && error.message.includes("No tienes permisos")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/work-order-schedules/:id
 * Update work order schedule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;

    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse request body
    const body = await request.json()
    const scheduleData = updateWorkOrderScheduleSchema.parse(body)

    // Convert date strings (YYYY-MM-DD) to Date objects if present
    // Convert null to undefined for optional fields
    const input = {
      id,
      ...scheduleData,
      description: scheduleData.description ?? undefined,
      recurrenceEndDate: scheduleData.recurrenceEndDate
        ? new Date(`${scheduleData.recurrenceEndDate}T00:00:00`)
        : undefined,
      nextGenerationDate: scheduleData.nextGenerationDate
        ? new Date(`${scheduleData.nextGenerationDate}T00:00:00`)
        : undefined,
      recurrenceEndValue: scheduleData.recurrenceEndValue ?? undefined,
      meterType: (scheduleData.meterType ?? undefined) as import('@prisma/client').MeterType | undefined,
      meterThreshold: scheduleData.meterThreshold ?? undefined,
      assetId: scheduleData.assetId ?? undefined,
      siteId: scheduleData.siteId ?? undefined,
    }

    // Update schedule
    const schedule = await WorkOrderScheduleService.updateSchedule(session, input as UpdateScheduleInput)

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error updating work order schedule:", error)
    if (error instanceof Error) {
      if (error.message.includes("no encontrada")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
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

/**
 * DELETE /api/work-order-schedules/:id
 * Soft delete work order schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;

    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    await WorkOrderScheduleService.deleteSchedule(session, id)

    return NextResponse.json({ message: "Programación eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting work order schedule:", error)
    if (error instanceof Error) {
      if (error.message.includes("no encontrada")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}
