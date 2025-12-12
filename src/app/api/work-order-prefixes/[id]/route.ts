import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { WorkOrderPrefixService } from "@/server/services/work-order-prefix.service"
import { updateWorkOrderPrefixSchema } from "@/schemas/work-order-prefix"
import { ZodError } from "zod"
import type { SystemRoleKey } from "@/types/auth.types"

/**
 * GET /api/work-order-prefixes/[id]
 * Get a single work order prefix by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const { id } = await params

    // Get prefix
    const prefix = await WorkOrderPrefixService.getPrefix(
      id,
      session.user.companyId!
    )

    return NextResponse.json(prefix, { status: 200 })
  } catch (error) {
    console.error("Error getting work order prefix:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get work order prefix" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/work-order-prefixes/[id]
 * Update a work order prefix
 * Only SUPER_ADMIN and ADMIN_EMPRESA can update prefixes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const data = updateWorkOrderPrefixSchema.parse(body)

    // Update prefix
    const prefix = await WorkOrderPrefixService.updatePrefix(
      id,
      data,
      session.user.companyId!,
      session.user.role as SystemRoleKey
    )

    return NextResponse.json(prefix, { status: 200 })
  } catch (error) {
    console.error("Error updating work order prefix:", error)

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
      { error: "Failed to update work order prefix" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/work-order-prefixes/[id]
 * Soft delete a work order prefix
 * Only SUPER_ADMIN and ADMIN_EMPRESA can delete prefixes
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const { id } = await params

    // Delete prefix (soft delete by default)
    await WorkOrderPrefixService.deletePrefix(
      id,
      session.user.companyId!,
      session.user.role as SystemRoleKey
    )

    return NextResponse.json(
      { message: "Prefix deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting work order prefix:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete work order prefix" },
      { status: 500 }
    )
  }
}
