import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, EmailTemplateService } from "@/server"
import { updateEmailTemplateSchema } from "../../../schemas/email-schemas"

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

    const template = await EmailTemplateService.getById(id, sessionResult)

    if (!template) {
      return NextResponse.json(
        { error: "Template de email no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos") || error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching email template:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

async function handleUpdateEmailTemplate(
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
    const validatedData = updateEmailTemplateSchema.parse(body)

    const template = await EmailTemplateService.update(
      id,
      validatedData,
      sessionResult
    )

    if (!template) {
      return NextResponse.json(
        { error: "Template de email no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)

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

    console.error("Error updating email template:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const PUT = handleUpdateEmailTemplate
export const PATCH = handleUpdateEmailTemplate

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

    const template = await EmailTemplateService.delete(id, sessionResult)

    if (!template) {
      return NextResponse.json(
        { error: "Template de email no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Template eliminado exitosamente" })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos") || error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error deleting email template:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
