import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AlertService, CommentService } from "@/server"

export const dynamic = 'force-dynamic'

/**
 * GET /api/client/alerts/[id]/comments
 * Get comments for an alert
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

    // Verify user is a client user
    const clientRoles = ['CLIENTE_ADMIN_GENERAL', 'CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO']
    if (!clientRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo para usuarios clientes.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verify alert access first
    const alert = await AlertService.getById(id, session)
    if (!alert) {
      return NextResponse.json(
        { error: 'Alerta no encontrada' },
        { status: 404 }
      )
    }

    // Return comments (already included in alert)
    return NextResponse.json({ comments: alert.comments || [] })
  } catch (error) {
    console.error("Error fetching alert comments:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client/alerts/[id]/comments
 * Add a comment to an alert
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Verify user is a client user
    const clientRoles = ['CLIENTE_ADMIN_GENERAL', 'CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO']
    if (!clientRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo para usuarios clientes.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate comment content
    const commentSchema = z.object({
      content: z.string().min(1, "El comentario no puede estar vacío").max(2000)
    })

    const { content } = commentSchema.parse(body)

    // Add comment using CommentService
    const comment = await CommentService.create(id, { content }, session)

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error adding comment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
