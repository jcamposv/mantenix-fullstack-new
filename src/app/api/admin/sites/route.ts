import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, SiteService } from "@/server"
import { createSiteSchema, siteFiltersSchema } from "../../schemas/site-schemas"

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { clientCompanyId, tenantCompanyId, search, isActive, page, limit } = siteFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { clientCompanyId, tenantCompanyId, search, isActive }
    const result = await SiteService.getList(sessionResult, filters, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para ver sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.message === "Rol no autorizado para gestionar sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching sites:", error)
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
    const validatedData = createSiteSchema.parse(body)

    const site = await SiteService.create(validatedData, sessionResult)
    
    return NextResponse.json(site, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para crear sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin") || error.message.includes("Empresa cliente")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error creating site:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}