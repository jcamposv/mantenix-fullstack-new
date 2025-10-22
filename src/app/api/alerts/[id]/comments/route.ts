import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, CommentService } from "@/server"
import { createCommentSchema } from "../../../schemas/comment-schemas"

export const dynamic = 'force-dynamic'

// POST /api/alerts/[id]/comments - Crear comentario en alerta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: alertId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const comment = await CommentService.create(alertId, validatedData, sessionResult)
    return NextResponse.json(comment, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "Alerta no encontrada o sin acceso") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "No tienes permisos para comentar en alertas") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// GET /api/alerts/[id]/comments - Obtener comentarios de alerta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: alertId } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const comments = await CommentService.getByAlert(alertId, sessionResult)
    return NextResponse.json(comments)

  } catch (error) {
    if (error instanceof Error && error.message === "Alerta no encontrada o sin acceso") {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}