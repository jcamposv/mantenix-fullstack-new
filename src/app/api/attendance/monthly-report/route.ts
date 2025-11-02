import { NextRequest, NextResponse } from "next/server"
import { AuthService, AttendanceService } from "@/server"

export const dynamic = 'force-dynamic'

// GET /api/attendance/monthly-report?userId=xxx&month=1&year=2025
export const GET = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!userId || !month || !year) {
      return NextResponse.json(
        { error: "userId, month y year son requeridos" },
        { status: 400 }
      )
    }

    const report = await AttendanceService.getMonthlyReport(
      sessionResult,
      userId,
      parseInt(month),
      parseInt(year)
    )

    return NextResponse.json(report)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching monthly report:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
