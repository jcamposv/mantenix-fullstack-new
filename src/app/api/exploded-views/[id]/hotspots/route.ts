/**
 * Exploded View Hotspots API Endpoint
 *
 * GET  /api/exploded-views/[id]/hotspots - Get all hotspots for a view
 * POST /api/exploded-views/[id]/hotspots - Create new hotspot for a view
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { ExplodedViewService } from "@/server/services/exploded-view.service"
import { createHotspotAPISchema } from "../../../schemas/exploded-view-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { id } = await params
    const hotspots = await ExplodedViewService.getHotspotsByViewId(
      id,
      sessionResult
    )

    return NextResponse.json(hotspots)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Vista no encontrada o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error("Error fetching hotspots:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()

    // Ensure viewId matches the URL parameter
    const { id } = await params
    const dataWithViewId = { ...body, viewId: id }
    const validatedData = createHotspotAPISchema.parse(dataWithViewId)

    const hotspot = await ExplodedViewService.createHotspot(validatedData, sessionResult)

    return NextResponse.json(hotspot, { status: 201 })

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
      if (error.message === "Vista no encontrada o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "Componente no encontrado o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error("Error creating hotspot:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
