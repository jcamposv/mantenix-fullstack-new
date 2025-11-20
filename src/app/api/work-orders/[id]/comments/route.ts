/**
 * API Routes for Work Order Comments
 * GET /api/work-orders/[id]/comments - Get all comments for a work order
 * POST /api/work-orders/[id]/comments - Create a new comment
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { WorkOrderCommentService } from "@/server/services/work-order-comment.service"
import { createWorkOrderCommentSchema } from "@/app/api/schemas/work-order-comment-schemas"

export const dynamic = "force-dynamic"

/**
 * GET /api/work-orders/[id]/comments
 * Get all comments for a work order
 * Respects internal comment visibility based on user role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workOrderId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const comments = await WorkOrderCommentService.getByWorkOrder(
      workOrderId,
      sessionResult
    )

    return NextResponse.json(comments)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Orden de trabajo no encontrada o sin acceso"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.error("Error fetching work order comments:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/work-orders/[id]/comments
 * Create a new comment on a work order
 * Validates permissions and comment data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workOrderId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = createWorkOrderCommentSchema.parse(body)

    const comment = await WorkOrderCommentService.create(
      workOrderId,
      validatedData,
      sessionResult
    )

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "Orden de trabajo no encontrada o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "No tienes permisos para comentar en órdenes de trabajo") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes permisos para crear comentarios internos") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error creating work order comment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
