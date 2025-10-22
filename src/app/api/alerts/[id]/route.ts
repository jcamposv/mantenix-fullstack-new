import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AlertService } from "@/server"
import { updateAlertSchema } from "../../schemas/alert-schemas"

export const dynamic = 'force-dynamic'

// GET /api/alerts/[id] - Obtener alerta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const alert = await AlertService.getById(id, sessionResult)

    if (!alert) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(alert)

  } catch (error) {
    console.error("Error fetching alert:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/alerts/[id] - Actualizar alerta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateAlertSchema.parse(body)

    const updatedAlert = await AlertService.update(id, validatedData, sessionResult)
    
    if (!updatedAlert) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(updatedAlert)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating alert:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/alerts/[id] - Eliminar alerta (solo para casos especiales)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const deletedAlert = await AlertService.delete(id, sessionResult)
    
    if (!deletedAlert) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Alerta eliminada exitosamente",
      id 
    })

  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}