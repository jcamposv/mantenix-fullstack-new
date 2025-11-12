import { NextRequest, NextResponse } from "next/server"
import { WorkOrderScheduleService } from "@/server/services/work-order-schedule.service"
import { AuthService } from "@/server/services/auth.service"

export const dynamic = 'force-dynamic'

/**
 * POST /api/work-order-schedules/:id/generate
 * Manually generate a work order from schedule
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;

    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session = sessionResult;

    // Verify schedule ownership
    await WorkOrderScheduleService.getScheduleById(session, id);

    // Generate work order
    const workOrder = await WorkOrderScheduleService.generateWorkOrderFromSchedule(id);

    return NextResponse.json({
      message: "Orden de trabajo generada exitosamente",
      workOrder
    }, { status: 201 })
  } catch (error) {
    console.error("Error generating work order from schedule:", error)
    if (error instanceof Error) {
      if (error.message.includes("no encontrada") || error.message.includes("no está activa")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("alcanzado su límite")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}
