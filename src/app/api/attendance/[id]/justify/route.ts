import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AttendanceService } from "@/server/services/attendance.service"
import { justifyAttendanceSchema } from "@/app/api/schemas/attendance-schemas"

/**
 * PATCH /api/attendance/[id]/justify
 * Mark an attendance record as justified
 * Only supervisors and admins can justify attendance
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Await params in Next.js 15
    const { id } = await params

    const body = await request.json()

    // Validate with Zod
    const validationResult = justifyAttendanceSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { justificationNotes } = validationResult.data

    const record = await AttendanceService.markAsJustified(
      sessionResult,
      id,
      justificationNotes
    )

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: "Asistencia justificada exitosamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error justifying attendance:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("permisos") ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Error al justificar asistencia" },
      { status: 500 }
    )
  }
}
