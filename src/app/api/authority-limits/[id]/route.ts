import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ApprovalService } from '@/server/services/approval.service'
import { updateAuthorityLimitSchema } from '@/app/api/schemas/approval-schemas'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const authorityLimit = await ApprovalService.getAuthorityLimitById(id, session)

    if (!authorityLimit) {
      return NextResponse.json(
        { error: 'Límite de autoridad no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(authorityLimit)
  } catch (error) {
    if (error instanceof Error && error.message.includes('No tienes permisos')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const body = await request.json()

    const validationResult = updateAuthorityLimitSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const authorityLimit = await ApprovalService.updateAuthorityLimit(
      id,
      validationResult.data,
      session
    )

    return NextResponse.json({
      authorityLimit,
      message: 'Límite de autoridad actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      if (error.message.includes('no encontrad')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes('Ya existe')) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message.includes('No tienes permisos')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    await ApprovalService.deleteAuthorityLimit(id, session)

    return NextResponse.json({
      message: 'Límite de autoridad eliminado exitosamente'
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('no encontrad')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes('No tienes permisos')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
