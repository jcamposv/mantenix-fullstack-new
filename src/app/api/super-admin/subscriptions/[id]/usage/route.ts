/**
 * API Route for Subscription Usage Metrics (SUPER_ADMIN only)
 * GET /api/super-admin/subscriptions/[id]/usage - Get usage summary
 */

import { NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { SubscriptionService } from "@/server/services/subscription.service"

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    const { id } = await params

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can view usage metrics
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const usageSummary = await SubscriptionService.getUsageSummary(id)

    return NextResponse.json(usageSummary)
  } catch (error) {
    console.error("[API] Error fetching usage metrics:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener métricas de uso" },
      { status: 500 }
    )
  }
}
