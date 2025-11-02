import { NextRequest, NextResponse } from "next/server"
import { AuthService, AttendanceService } from "@/server"
import { attendanceFiltersSchema } from "@/app/api/schemas/attendance-schemas"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { userId, locationId, status, startDate, endDate, month, year, page, limit } =
      attendanceFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { userId, locationId, status, startDate, endDate, month, year }
    const result = await AttendanceService.getList(sessionResult, filters, page, limit)

    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error fetching attendance records:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
