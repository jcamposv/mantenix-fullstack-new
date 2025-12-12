import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import {
  maintenancePerformanceRequestSchema,
  type PeriodPreset,
} from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/maintenance
 *
 * Get maintenance performance metrics
 * Includes: completion rate, PM compliance, backlog, response time, etc.
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
    const validatedRequest = maintenancePerformanceRequestSchema.parse({
      periodPreset,
      filters,
      includeBacklogDetails: searchParams.get("includeBacklogDetails") !== "false",
      includePriorityBreakdown:
        searchParams.get("includePriorityBreakdown") !== "false",
    })

    // Get maintenance performance metrics
    const metrics = await AnalyticsService.getMaintenancePerformanceMetrics(
      session,
      validatedRequest.periodPreset,
      validatedRequest.filters
    )

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching maintenance performance metrics:", error)

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
