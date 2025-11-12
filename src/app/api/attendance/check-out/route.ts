import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AttendanceService } from "@/server"
import { checkOutSchema } from "@/app/api/schemas/attendance-schemas"

export const dynamic = 'force-dynamic'

export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = checkOutSchema.parse(body)

    const record = await AttendanceService.checkOut(sessionResult, validatedData)

    return NextResponse.json(record, { status: 200 })

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
        error.message.includes("no encontrado") ||
        error.message.includes("Ya has marcado salida") ||
        error.message.includes("Solo puedes")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error in check-out:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
