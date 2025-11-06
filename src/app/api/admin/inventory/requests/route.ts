import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { RequestUrgency } from "@prisma/client"
import { AuthService } from "@/server/services/auth.service"
import { InventoryRequestService } from "@/server/services/inventory-request.service"
import { createInventoryRequestSchema, inventoryRequestFiltersSchema } from "../../../schemas/inventory-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { workOrderId, inventoryItemId, status, urgency, page, limit } = inventoryRequestFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { 
      workOrderId, 
      inventoryItemId, 
      status, 
      urgency: urgency as RequestUrgency | undefined
    }
    const result = await InventoryRequestService.getList(sessionResult, filters, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching inventory requests:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = createInventoryRequestSchema.parse(body)

    // Transform validated data to match CreateInventoryRequestData type
    const createData = {
      workOrderId: validatedData.workOrderId,
      inventoryItemId: validatedData.inventoryItemId,
      quantityRequested: validatedData.requestedQuantity,
      urgency: validatedData.urgency as RequestUrgency | undefined,
      notes: validatedData.notes
    }

    const inventoryRequest = await InventoryRequestService.create(sessionResult, createData)

    return NextResponse.json(inventoryRequest, { status: 201 })

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
    }

    console.error("Error creating inventory request:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
