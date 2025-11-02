import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, FeatureService } from "@/server"
import { toggleFeatureSchema } from "@/app/api/schemas/attendance-schemas"

export const dynamic = 'force-dynamic'

export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = toggleFeatureSchema.parse(body)

    const feature = await FeatureService.toggleFeature(sessionResult, {
      ...validatedData,
      changedBy: sessionResult.user.id
    })

    return NextResponse.json(feature, { status: 200 })

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
    }

    console.error("Error toggling feature:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
