/**
 * Exploded Views API Endpoint
 *
 * GET  /api/exploded-views - List exploded views with filters and pagination
 * POST /api/exploded-views - Create new exploded view
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { ExplodedViewService } from "@/server/services/exploded-view.service"
import {
  createExplodedViewAPISchema,
  explodedViewFiltersAPISchema,
} from "../schemas/exploded-view-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { assetId, search, isActive, page, limit } = explodedViewFiltersAPISchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { assetId, search, isActive }
    const result = await ExplodedViewService.getViewList(sessionResult, filters, page, limit)
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

    console.error("Error fetching exploded views:", error)
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
    const validatedData = createExplodedViewAPISchema.parse(body)

    const explodedView = await ExplodedViewService.createView(validatedData, sessionResult)

    return NextResponse.json(explodedView, { status: 201 })

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
      if (error.message.includes("No tienes acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error creating exploded view:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
