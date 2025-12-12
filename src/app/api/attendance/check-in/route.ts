import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AttendanceService } from "@/server"
import { checkInSchema } from "@/app/api/schemas/attendance-schemas"

export const dynamic = 'force-dynamic'

export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = checkInSchema.parse(body)

    const record = await AttendanceService.checkIn(sessionResult, validatedData)

    return NextResponse.json(record, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (
        error.message.includes("Ya has marcado entrada") ||
        error.message.includes("dentro del área") ||
        error.message.includes("módulo") ||
        error.message.includes("Usuario sin")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error in check-in:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
