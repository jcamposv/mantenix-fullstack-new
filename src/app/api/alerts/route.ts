import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AlertService } from "@/server"
import { createAlertSchema, alertFiltersSchema } from "../schemas/alert-schemas"


// GET /api/alerts - Obtener alertas (filtradas por sede del usuario)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { siteId, status, priority, type, my, page, limit } = alertFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { siteId, status, priority, type, my }
    const result = await AlertService.getList(sessionResult, filters, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/alerts - Crear nueva alerta
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)

    const alert = await AlertService.create(validatedData, sessionResult)
    return NextResponse.json(alert, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating alert:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}