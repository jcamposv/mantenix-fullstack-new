import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AttendanceService } from "@/server/services/attendance.service"
import { markAbsentSchema } from "@/app/api/schemas/attendance-schemas"

/**
 * POST /api/attendance/mark-absent
 * Create a manual absence record
 * Only supervisors and admins can mark absences
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()

    // Validate with Zod
    const validationResult = markAbsentSchema.safeParse(body)

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

    const { userId, date, notes } = validationResult.data

    const record = await AttendanceService.markAsAbsent(
      sessionResult,
      userId,
      date,
      notes
    )

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: "Ausencia registrada exitosamente",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error marking absence:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("permisos") ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Error al registrar ausencia" },
      { status: 500 }
    )
  }
}
