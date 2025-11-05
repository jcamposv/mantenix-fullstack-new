import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { InventoryService } from "@/server/services/inventory.service"
import { inventoryMovementFiltersSchema } from "../../../schemas/inventory-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const {
      inventoryItemId,
      movementType,
      locationId,
      locationType,
      startDate,
      endDate,
      page,
      limit
    } = inventoryMovementFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = {
      inventoryItemId,
      movementType,
      locationId,
      locationType,
      startDate,
      endDate
    }
    const result = await InventoryService.getMovementList(sessionResult, filters, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching inventory movements:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
