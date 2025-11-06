import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { InventoryService } from "@/server/services/inventory.service"
import { updateInventoryItemSchema } from "../../../../schemas/inventory-schemas"

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

    const inventoryItem = await InventoryService.getItemById(sessionResult, id)

    if (!inventoryItem) {
      return NextResponse.json(
        { error: "Ítem de inventario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(inventoryItem)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching inventory item:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

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
    const validatedData = updateInventoryItemSchema.parse(body)

    const inventoryItem = await InventoryService.updateItem(sessionResult, id, validatedData)

    return NextResponse.json(inventoryItem)

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
      if (error.message.includes("ya existe")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    console.error("Error updating inventory item:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    await InventoryService.deleteItem(sessionResult, id)

    return NextResponse.json({ message: "Ítem de inventario eliminado exitosamente" })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("tiene stock") || error.message.includes("movimientos")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error deleting inventory item:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
