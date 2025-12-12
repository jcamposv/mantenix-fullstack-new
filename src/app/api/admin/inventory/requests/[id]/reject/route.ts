import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { InventoryRequestService } from "@/server/services/inventory-request.service"
import { rejectInventoryRequestSchema } from "../../../../../schemas/inventory-schemas"

export const dynamic = 'force-dynamic'

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = rejectInventoryRequestSchema.parse(body)

    const inventoryRequest = await InventoryRequestService.reject(
      sessionResult,
      id,
      {
        status: "REJECTED",
        reviewNotes: validatedData.notes
      }
    )

    return NextResponse.json(inventoryRequest)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("no puede ser rechazada")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error rejecting inventory request:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
