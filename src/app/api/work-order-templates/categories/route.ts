import { NextResponse } from "next/server"
import { WorkOrderTemplateService } from "@/server/services/work-order-template.service"
import { AuthService } from "@/server/services/auth.service"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get categories
    const categories = await WorkOrderTemplateService.getCategories(session)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching template categories:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}