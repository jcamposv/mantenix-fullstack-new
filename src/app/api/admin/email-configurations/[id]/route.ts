import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, EmailConfigurationService } from "@/server"
import { updateEmailConfigurationSchema } from "../../../schemas/email-schemas"

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

    const configuration = await EmailConfigurationService.getById(id, sessionResult)

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuración de email no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(configuration)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos") || error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching email configuration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

async function handleUpdateEmailConfiguration(
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
    const validatedData = updateEmailConfigurationSchema.parse(body)

    const configuration = await EmailConfigurationService.update(
      id,
      validatedData,
      sessionResult
    )

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuración de email no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(configuration)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos") || error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error updating email configuration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const PUT = handleUpdateEmailConfiguration
export const PATCH = handleUpdateEmailConfiguration

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

    const configuration = await EmailConfigurationService.delete(id, sessionResult)

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuración de email no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Configuración eliminada exitosamente" })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos") || error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error deleting email configuration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
