/**
 * Exploded View Components API Endpoint
 *
 * GET  /api/exploded-view-components - List components with filters and pagination
 * POST /api/exploded-view-components - Create new component
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { ExplodedViewService } from "@/server/services/exploded-view.service"
import {
  createComponentAPISchema,
  componentFiltersAPISchema,
} from "../schemas/exploded-view-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { search, manufacturer, hasInventoryItem, isActive, page, limit } =
      componentFiltersAPISchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { search, manufacturer, hasInventoryItem, isActive }
    const result = await ExplodedViewService.getComponentList(
      sessionResult,
      filters,
      page,
      limit
    )
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching components:", error)
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
    const validatedData = createComponentAPISchema.parse(body)

    const component = await ExplodedViewService.createComponent(
      validatedData,
      sessionResult
    )

    return NextResponse.json(component, { status: 201 })

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
      if (error.message.includes("Ya existe un componente con el número de parte")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    console.error("Error creating component:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
