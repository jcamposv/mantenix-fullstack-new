import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AssetService } from "@/server"
import { updateAssetSchema } from "../../../schemas/asset-schemas"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const asset = await AssetService.getById(id, sessionResult)
    
    if (!asset) {
      return NextResponse.json(
        { error: "Activo no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Usuario sin") || error.message === "Rol no autorizado para gestionar activos") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching asset:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const PUT = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateAssetSchema.parse(body)

    const asset = await AssetService.update(id, validatedData, sessionResult)
    
    if (!asset) {
      return NextResponse.json(
        { error: "Activo no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para actualizar activos") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin") || 
          error.message.includes("Sede no encontrada") ||
          error.message.includes("Ya existe un activo")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const asset = await AssetService.delete(id, sessionResult)
    
    if (!asset) {
      return NextResponse.json(
        { error: "Activo no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: "Activo desactivado exitosamente",
      asset 
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para eliminar activos") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin") || 
          error.message.includes("No tienes acceso") ||
          error.message.includes("órdenes de trabajo activas")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}