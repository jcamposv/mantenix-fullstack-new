import { NextRequest, NextResponse } from "next/server"
import { WorkOrderScheduleService } from "@/server/services/work-order-schedule.service"
import { AuthService } from "@/server/services/auth.service"
import { updateMeterReadingSchema } from "@/app/api/schemas/work-order-schedule-schemas"

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/work-order-schedules/:id/meter-reading
 * Update meter reading for a meter-based schedule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse request body
    const body = await request.json()
    const { newReading } = updateMeterReadingSchema.parse(body)

    // Update meter reading
    const result = await WorkOrderScheduleService.updateMeterReading(
      session,
      params.id,
      newReading
    )

    return NextResponse.json({
      message: "Lectura de medidor actualizada exitosamente",
      ...result
    })
  } catch (error) {
    console.error("Error updating meter reading:", error)
    if (error instanceof Error) {
      if (error.message.includes("no encontrada")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("no es basada en medidores")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}
