import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, EmailConfigurationService } from "@/server"
import { createEmailConfigurationSchema, emailConfigurationFiltersSchema } from "../../schemas/email-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { page, limit } = emailConfigurationFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const result = await EmailConfigurationService.getList(sessionResult, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching email configurations:", error)
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
    const validatedData = createEmailConfigurationSchema.parse(body)

    const configuration = await EmailConfigurationService.create(validatedData, sessionResult)

    return NextResponse.json(configuration, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Ya existe una configuración")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.message.includes("sin empresa") || error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error creating email configuration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
