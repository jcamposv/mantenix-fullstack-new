import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import {
  dashboardKPIRequestSchema,
  type PeriodPreset,
} from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/dashboard
 *
 * Get comprehensive dashboard KPIs
 * Includes: overview, asset reliability, maintenance performance, costs, resources, trends
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

    // Validate request
    const validatedRequest = dashboardKPIRequestSchema.parse({
      periodPreset,
      filters,
      includeTimeseries: searchParams.get("includeTimeseries") !== "false",
      includeAssetReliability:
        searchParams.get("includeAssetReliability") !== "false",
      includeMaintenancePerformance:
        searchParams.get("includeMaintenancePerformance") !== "false",
      includeCosts: searchParams.get("includeCosts") !== "false",
      includeResources: searchParams.get("includeResources") !== "false",
    })

    // Get dashboard KPIs
    const kpis = await AnalyticsService.getDashboardKPIs(
      session,
      validatedRequest.periodPreset,
      validatedRequest.filters
    )

    return NextResponse.json(kpis)
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error)

    if (error instanceof Error) {
      // Validation error
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Parámetros inválidos", details: error.message },
          { status: 400 }
        )
      }

      // Permission error
      if (error.message.includes("permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }

      // Other errors
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
