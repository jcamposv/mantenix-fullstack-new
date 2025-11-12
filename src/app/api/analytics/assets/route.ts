import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import { assetReliabilityRequestSchema, type PeriodPreset } from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/assets
 *
 * Get asset reliability metrics (MTBF, MTTR, Availability, OEE)
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
    const validatedRequest = assetReliabilityRequestSchema.parse({
      filters,
      sortBy: searchParams.get("sortBy") || "availability",
      sortOrder: searchParams.get("sortOrder") || "asc",
      limit: parseInt(searchParams.get("limit") || "20"),
    })

    // Get asset reliability metrics
    const metrics = await AnalyticsService.getAssetReliabilityMetrics(
      session,
      periodPreset,
      validatedRequest.filters
    )

    // Apply sorting and limit
    let sortedAssets = [...metrics.assets]

    // Sort
    const sortBy = validatedRequest.sortBy
    sortedAssets.sort((a, b) => {
      let aValue: number
      let bValue: number

      // Handle special case for failures
      if (sortBy === "failures") {
        aValue = a.totalFailures
        bValue = b.totalFailures
      } else {
        aValue = a[sortBy as keyof typeof a] as number
        bValue = b[sortBy as keyof typeof b] as number
      }

      return validatedRequest.sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    // Limit
    sortedAssets = sortedAssets.slice(0, validatedRequest.limit)

    return NextResponse.json({
      assets: sortedAssets,
      overall: metrics.overall,
      totalAssets: metrics.assets.length,
    })
  } catch (error) {
    console.error("Error fetching asset reliability metrics:", error)

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
