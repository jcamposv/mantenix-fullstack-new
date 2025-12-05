/**
 * Exploded View by ID API Endpoint
 *
 * GET    /api/exploded-views/[id] - Get exploded view by ID
 * PUT    /api/exploded-views/[id] - Update exploded view
 * DELETE /api/exploded-views/[id] - Delete exploded view (soft delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { ExplodedViewService } from "@/server/services/exploded-view.service"
import { updateExplodedViewAPISchema } from "../../schemas/exploded-view-schemas"

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
    const explodedView = await ExplodedViewService.getViewById(id, sessionResult)

    if (!explodedView) {
      return NextResponse.json(
        { error: "Vista explosionada no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(explodedView)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching exploded view:", error)
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
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateExplodedViewAPISchema.parse(body)

    const { id } = await params
    const explodedView = await ExplodedViewService.updateView(
      id,
      validatedData,
      sessionResult
    )

    return NextResponse.json(explodedView)

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
    }

    console.error("Error updating exploded view:", error)
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
    const explodedView = await ExplodedViewService.deleteView(id, sessionResult)

    return NextResponse.json({
      message: "Vista explosionada eliminada exitosamente",
      deletedView: explodedView,
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Vista no encontrada o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error("Error deleting exploded view:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
