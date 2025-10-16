import {  NextResponse } from "next/server"
import { WorkOrderTemplateService } from "@/server/services/work-order-template.service"
import { AuthService } from "@/server/services/auth.service"

export async function GET() {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get stats
    const stats = await WorkOrderTemplateService.getStats(session)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching template stats:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}