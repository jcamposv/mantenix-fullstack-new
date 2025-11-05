import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { InventoryService } from "@/server/services/inventory.service"
import { transferInventoryStockSchema } from "../../../../schemas/inventory-schemas"

export const dynamic = 'force-dynamic'

export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = transferInventoryStockSchema.parse(body)

    const {
      inventoryItemId,
      fromLocationId,
      fromLocationType,
      toLocationId,
      toLocationType,
      quantity,
      reason,
      notes
    } = validatedData

    const movement = await InventoryService.transferStock(
      sessionResult,
      {
        inventoryItemId,
        fromLocationId,
        fromLocationType,
        toLocationId,
        toLocationType,
        quantity,
        reason,
        notes
      }
    )

    return NextResponse.json(movement, { status: 200 })

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
      if (error.message.includes("no encontrado")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("insuficiente")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error transferring inventory stock:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
