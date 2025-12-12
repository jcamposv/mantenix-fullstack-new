import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AssetStatusService } from "@/server"
import { changeAssetStatusSchema } from "@/schemas/asset-status"

export const dynamic = 'force-dynamic'

/**
 * POST /api/assets/status
 * Change asset status
 * Authorized roles: OPERARIO, TECNICO, SUPERVISOR, JEFE_MANTENIMIENTO, admins
 */
export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = changeAssetStatusSchema.parse(body)

    const result = await AssetStatusService.changeAssetStatus(
      validatedData,
      sessionResult
    )

    return NextResponse.json(result, { status: 200 })

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
        error.message.includes("no corresponde") ||
        error.message.includes("ya tiene este estado") ||
        error.message.includes("Sin")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error changing asset status:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
