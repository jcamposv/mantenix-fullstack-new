import { NextRequest, NextResponse } from "next/server"
import { AuthService, LocationService } from "@/server"
import { validateGeofence } from "@/lib/geolocation"

export const dynamic = 'force-dynamic'

// POST /api/attendance/validate-location - Validate if user is within geofence
export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const { latitude, longitude } = body

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitud y longitud son requeridas" },
        { status: 400 }
      )
    }

    const companyId = sessionResult.user.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "Usuario sin empresa asignada" },
        { status: 400 }
      )
    }

    // Get active locations
    const locations = await LocationService.getActiveByCompany(companyId)

    if (locations.length === 0) {
      return NextResponse.json({
        isValid: false,
        message: "No hay ubicaciones configuradas para tu empresa",
        distance: null,
        nearestLocation: null
      })
    }

    // Validate geofence
    const result = validateGeofence({ latitude, longitude }, locations)

    return NextResponse.json({
      isValid: result.isWithinGeofence,
      message: result.message,
      distance: result.distance,
      nearestLocation: result.nearestLocation ? {
        id: result.nearestLocation.id,
        name: result.nearestLocation.name,
        radiusMeters: result.nearestLocation.radiusMeters
      } : null
    })

  } catch (error) {
    console.error("Error validating location:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
