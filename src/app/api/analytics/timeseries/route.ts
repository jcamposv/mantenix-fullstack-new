import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import { timeseriesRequestSchema, type PeriodPreset } from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/timeseries
 *
 * Get timeseries data for trend charts
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
    const validatedRequest = timeseriesRequestSchema.parse({
      periodPreset,
      filters,
      metric: searchParams.get("metric") || "workOrders",
      interval: searchParams.get("interval") || "day",
      includeComparison: searchParams.get("includeComparison") === "true",
    })

    // Map metric if needed (handle extended metrics)
    let metric: "workOrders" | "completionRate" | "costs" = validatedRequest.metric as "workOrders" | "completionRate" | "costs"

    // For now, unsupported metrics default to workOrders
    if (!["workOrders", "completionRate", "costs"].includes(metric)) {
      metric = "workOrders"
    }

    // Map interval (filter out unsupported values)
    let interval: "day" | "week" | "month" = "day"
    if (validatedRequest.interval === "week" || validatedRequest.interval === "month") {
      interval = validatedRequest.interval
    }

    // Get timeseries data
    const timeseriesData = await AnalyticsService.getTimeseriesData(
      session,
      metric,
      validatedRequest.periodPreset,
      interval,
      validatedRequest.filters
    )

    return NextResponse.json(timeseriesData)
  } catch (error) {
    console.error("Error fetching timeseries data:", error)

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
