import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, SiteService } from "@/server"
import { updateSiteSchema } from "../../../schemas/site-schemas"

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

    const site = await SiteService.getById(id, sessionResult)

    if (!site) {
      return NextResponse.json({ error: "Sede no encontrada" }, { status: 404 })
    }

    return NextResponse.json(site)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Rol no autorizado para gestionar sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error fetching site:", error)
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
    const validatedData = updateSiteSchema.parse(body)

    const updatedSite = await SiteService.update(id, validatedData, sessionResult)
    
    if (!updatedSite) {
      return NextResponse.json({ error: "Sede no encontrada" }, { status: 404 })
    }

    return NextResponse.json(updatedSite)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para actualizar sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error updating site:", error)
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

    const deletedSite = await SiteService.delete(id, sessionResult)
    
    if (!deletedSite) {
      return NextResponse.json({ error: "Sede no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Sede desactivada exitosamente",
      id 
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para eliminar sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes acceso a esta sede") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("No se puede eliminar una sede")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error deleting site:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}