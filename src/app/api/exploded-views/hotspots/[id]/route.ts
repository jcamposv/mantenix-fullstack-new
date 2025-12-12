/**
 * Hotspot by ID API Endpoint
 *
 * PUT    /api/exploded-views/hotspots/[id] - Update hotspot
 * DELETE /api/exploded-views/hotspots/[id] - Delete hotspot (soft delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { ExplodedViewService } from "@/server/services/exploded-view.service"
import { updateHotspotAPISchema } from "../../../schemas/exploded-view-schemas"

export const dynamic = 'force-dynamic'

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateHotspotAPISchema.parse(body)

    const { id } = await params
    const hotspot = await ExplodedViewService.updateHotspot(
      id,
      validatedData,
      sessionResult
    )

    return NextResponse.json(hotspot)

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
      if (error.message === "Hotspot no encontrado") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "Sin acceso a la vista de este hotspot") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error updating hotspot:", error)
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
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { id } = await params
    const hotspot = await ExplodedViewService.deleteHotspot(id, sessionResult)

    return NextResponse.json({
      message: "Hotspot eliminado exitosamente",
      deletedHotspot: hotspot,
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Hotspot no encontrado") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "Sin acceso a la vista de este hotspot") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error deleting hotspot:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
