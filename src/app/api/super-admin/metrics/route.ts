import { NextResponse } from "next/server"
import { SuperAdminService } from "@/server/services/super-admin.service"
import { AuthService } from "@/server/services/auth.service"

export const GET = async () => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const metrics = await SuperAdminService.getMetrics(session)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching metrics:", error)

    if (error instanceof Error && error.message === "No autorizado") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500 }
    )
  }
}
