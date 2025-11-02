import { NextRequest, NextResponse } from "next/server"
import { AuthService, LocationService } from "@/server"

export const dynamic = 'force-dynamic'

// GET /api/admin/locations - Get all locations for user's company
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const locations = await LocationService.getByCompany(sessionResult)

    return NextResponse.json(locations)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching locations:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/admin/locations - Create new location
export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()

    // Add companyId from session
    const companyId = sessionResult.user.companyId
    if (!companyId) {
      return NextResponse.json(
        { error: "Usuario sin empresa asignada" },
        { status: 400 }
      )
    }

    const dataWithCompanyId = {
      ...body,
      companyId
    }

    const location = await LocationService.create(sessionResult, dataWithCompanyId)

    return NextResponse.json(location, { status: 201 })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Error creating location:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
