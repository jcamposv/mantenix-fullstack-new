import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import { costAnalyticsRequestSchema, type PeriodPreset } from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/costs
 *
 * Get cost analytics
 * Includes: total costs, breakdown by site/asset/type, ROI, etc.
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
    }

    // Validate request
    const validatedRequest = costAnalyticsRequestSchema.parse({
      periodPreset,
      filters,
      groupBy: searchParams.get("groupBy") || "site",
      includeBudgetComparison: searchParams.get("includeBudgetComparison") === "true",
      targetBudget: searchParams.get("targetBudget")
        ? parseFloat(searchParams.get("targetBudget")!)
        : undefined,
    })

    // Get cost metrics
    const costData = await AnalyticsService.getCostMetrics(
      session,
      validatedRequest.periodPreset,
      validatedRequest.filters
    )

    return NextResponse.json(costData)
  } catch (error) {
    console.error("Error fetching cost analytics:", error)

    if (error instanceof Error) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Parámetros inválidos", details: error.message },
          { status: 400 }
        )
      }

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
