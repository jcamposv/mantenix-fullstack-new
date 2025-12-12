/**
 * API Routes for Individual Work Order Comments
 * GET /api/work-orders/[id]/comments/[commentId] - Get a specific comment
 * PATCH /api/work-orders/[id]/comments/[commentId] - Update a comment
 * DELETE /api/work-orders/[id]/comments/[commentId] - Delete a comment
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/server/services/auth.service"
import { WorkOrderCommentService } from "@/server/services/work-order-comment.service"
import { updateWorkOrderCommentSchema } from "@/app/api/schemas/work-order-comment-schemas"

export const dynamic = "force-dynamic"

/**
 * GET /api/work-orders/[id]/comments/[commentId]
 * Get a specific work order comment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const comment = await WorkOrderCommentService.getById(commentId, sessionResult)

    if (!comment) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(comment)
  } catch (error) {
    if (error instanceof Error && error.message === "No tienes acceso a este comentario") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error("Error fetching work order comment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/work-orders/[id]/comments/[commentId]
 * Update a work order comment
 * Only the author or admins can update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateWorkOrderCommentSchema.parse(body)

    const comment = await WorkOrderCommentService.update(
      commentId,
      validatedData,
      sessionResult
    )

    return NextResponse.json(comment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "Comentario no encontrado") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "No tienes permisos para editar este comentario") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes acceso a este comentario") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error updating work order comment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/work-orders/[id]/comments/[commentId]
 * Delete a work order comment
 * Only the author or admins can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    await WorkOrderCommentService.delete(commentId, sessionResult)

    return NextResponse.json(
      { message: "Comentario eliminado exitosamente" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Comentario no encontrado") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "No tienes permisos para eliminar este comentario") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes acceso a este comentario") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error deleting work order comment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
