import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { WorkOrderPrefixService } from "@/server/services/work-order-prefix.service"
import {
  createWorkOrderPrefixSchema,
  workOrderPrefixFiltersSchema,
} from "@/schemas/work-order-prefix"
import { ZodError } from "zod"
import type { SystemRoleKey } from "@/types/auth.types"

/**
 * GET /api/work-order-prefixes
 * List all work order prefixes with optional filters and pagination
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
    const params = Object.fromEntries(searchParams.entries())

    // Validate and parse filters
    const filters = workOrderPrefixFiltersSchema.parse(params)

    const page = filters.page || 1
    const limit = filters.limit || 50

    // Get prefixes
    const result = await WorkOrderPrefixService.listPrefixes(
      session.user.companyId!,
      session.user.role as SystemRoleKey,
      {
        search: filters.search,
        isActive: filters.isActive,
      },
      page,
      limit
    )

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error listing work order prefixes:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to list work order prefixes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/work-order-prefixes
 * Create a new work order prefix
 * Only SUPER_ADMIN and ADMIN_EMPRESA can create prefixes
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    // Parse and validate request body
    const body = await request.json()
    const data = createWorkOrderPrefixSchema.parse(body)

    // Create prefix
    const prefix = await WorkOrderPrefixService.createPrefix(
      data,
      session.user.companyId!,
      session.user.id,
      session.user.role as SystemRoleKey
    )

    return NextResponse.json(prefix, { status: 201 })
  } catch (error) {
    console.error("Error creating work order prefix:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create work order prefix" },
      { status: 500 }
    )
  }
}
