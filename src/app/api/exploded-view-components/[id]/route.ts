/**
 * Component by ID API Endpoint
 *
 * GET    /api/exploded-view-components/[id] - Get component by ID
 * PUT    /api/exploded-view-components/[id] - Update component
 * DELETE /api/exploded-view-components/[id] - Delete component (soft delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { ExplodedViewService } from "@/server/services/exploded-view.service"
import { updateComponentAPISchema } from "../../schemas/exploded-view-schemas"

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
    const component = await ExplodedViewService.getComponentById(id, sessionResult)

    if (!component) {
      return NextResponse.json(
        { error: "Componente no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(component)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching component:", error)
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
    const validatedData = updateComponentAPISchema.parse(body)

    const { id } = await params
    const component = await ExplodedViewService.updateComponent(
      id,
      validatedData,
      sessionResult
    )

    return NextResponse.json(component)

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
      if (error.message === "Componente no encontrado o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("Ya existe un componente con el número de parte")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    console.error("Error updating component:", error)
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
    const component = await ExplodedViewService.deleteComponent(id, sessionResult)

    return NextResponse.json({
      message: "Componente eliminado exitosamente",
      deletedComponent: component,
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Componente no encontrado o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("No se puede eliminar el componente porque está en uso")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    console.error("Error deleting component:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
