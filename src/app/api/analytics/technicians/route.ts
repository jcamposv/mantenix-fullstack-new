import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { AnalyticsService } from "@/server/services/analytics.service"
import {
  technicianMetricsRequestSchema,
  type PeriodPreset,
} from "@/schemas/analytics"

export const dynamic = "force-dynamic"

/**
 * GET /api/analytics/technicians
 *
 * Get technician performance and utilization metrics
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
      userId: searchParams.get("userId") || undefined,
    }

    // Validate request
    const validatedRequest = technicianMetricsRequestSchema.parse({
      filters,
      sortBy: searchParams.get("sortBy") || "completionRate",
      sortOrder: searchParams.get("sortOrder") || "desc",
      limit: parseInt(searchParams.get("limit") || "20"),
    })

    // Get technician metrics
    const metrics = await AnalyticsService.getTechnicianMetrics(
      session,
      periodPreset,
      validatedRequest.filters
    )

    // Apply sorting and limit
    let sortedTechnicians = [...metrics.technicians]

    // Sort
    const sortBy = validatedRequest.sortBy
    sortedTechnicians.sort((a, b) => {
      let aValue: number
      let bValue: number

      // Map sortBy values to actual properties
      switch (sortBy) {
        case "onTimeRate":
          aValue = a.onTimeCompletionRate
          bValue = b.onTimeCompletionRate
          break
        case "workload":
          aValue = a.assignedWorkOrders
          bValue = b.assignedWorkOrders
          break
        default:
          aValue = a[sortBy as keyof typeof a] as number
          bValue = b[sortBy as keyof typeof b] as number
      }

      return validatedRequest.sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    // Limit
    sortedTechnicians = sortedTechnicians.slice(0, validatedRequest.limit)

    return NextResponse.json({
      technicians: sortedTechnicians,
      overall: metrics.overall,
      totalTechnicians: metrics.technicians.length,
    })
  } catch (error) {
    console.error("Error fetching technician metrics:", error)

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
