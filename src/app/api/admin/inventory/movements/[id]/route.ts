import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { InventoryService } from "@/server/services/inventory.service"

export const dynamic = 'force-dynamic'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const inventoryMovement = await InventoryService.getMovementById(sessionResult, id)

    if (!inventoryMovement) {
      return NextResponse.json(
        { error: "Movimiento de inventario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(inventoryMovement)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching inventory movement:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
