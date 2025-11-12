import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import { type PeriodPreset } from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/comprehensive
 *
 * Get comprehensive analytics (all metrics in one response)
 * Use for complete analytics page load
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const periodPreset = (searchParams.get("period") || "last_30_days") as PeriodPreset

    // Build filters
    const filters = {
      siteId: searchParams.get("siteId") || undefined,
      clientCompanyId: searchParams.get("clientCompanyId") || undefined,
      assetId: searchParams.get("assetId") || undefined,
      userId: searchParams.get("userId") || undefined,
    }

    // Get comprehensive analytics
    const analytics = await AnalyticsService.getComprehensiveAnalytics(
      session,
      periodPreset,
      filters
    )

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error)

    if (error instanceof Error) {
      if (error.message.includes("permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
