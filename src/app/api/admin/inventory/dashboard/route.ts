import { NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { InventoryService } from "@/server/services/inventory.service"

export const dynamic = 'force-dynamic'

export const GET = async () => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const metrics = await InventoryService.getDashboardMetrics(sessionResult)
    return NextResponse.json(metrics)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para realizar esta acción") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
