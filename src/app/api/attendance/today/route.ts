import { NextRequest, NextResponse } from "next/server"
import { AuthService, AttendanceService } from "@/server"

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const record = await AttendanceService.getTodayRecord(sessionResult)

    return NextResponse.json(record || {})

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Usuario sin")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error fetching today attendance:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
