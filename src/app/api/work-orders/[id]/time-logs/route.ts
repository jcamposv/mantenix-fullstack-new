/**
 * Work Order Time Logs API Routes
 *
 * POST /api/work-orders/[id]/time-logs - Log a time action
 * GET /api/work-orders/[id]/time-logs - Get all time logs for work order
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { TimeTrackingService } from "@/server/services/time-tracking.service"
import { timeLogActionSchema } from "@/schemas/time-tracking"
import { z } from "zod"

export const dynamic = "force-dynamic"

/**
 * POST /api/work-orders/[id]/time-logs
 * Log a time tracking action (START, PAUSE, RESUME, COMPLETE)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get work order ID from params
    const params = await context.params
    const workOrderId = params.id

    // Parse request body
    const body = await request.json()

    // Validate request
    const validated = timeLogActionSchema.parse({
      ...body,
      workOrderId,
    })

    // Log time action
    const timeTrackingService = new TimeTrackingService()
    const result = await timeTrackingService.logTimeAction(session, validated)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("Error logging time action:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/work-orders/[id]/time-logs
 * Get all time logs for a work order
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get work order ID from params
    const params = await context.params
    const workOrderId = params.id

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const includeUser = searchParams.get("includeUser") === "true"
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined

    // Get time logs
    const timeTrackingService = new TimeTrackingService()
    const result = await timeTrackingService.getTimeLogsForWorkOrder(
      session,
      workOrderId,
      {
        includeUser,
        limit,
        offset,
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("Error getting time logs:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
