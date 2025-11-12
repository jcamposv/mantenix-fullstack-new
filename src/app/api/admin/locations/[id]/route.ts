import { NextRequest, NextResponse } from "next/server"
import { AuthService, LocationService } from "@/server"

export const dynamic = 'force-dynamic'

// GET /api/admin/locations/[id] - Get location by ID
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

    const location = await LocationService.getById(sessionResult, id)

    if (!location) {
      return NextResponse.json(
        { error: "Ubicación no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(location)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching location:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/locations/[id] - Update location
export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { id } = await params
    const body = await request.json()

    const location = await LocationService.update(sessionResult, id, body)

    return NextResponse.json(location)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Error updating location:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/locations/[id] - Delete location
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

    await LocationService.delete(sessionResult, id)

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Error deleting location:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
