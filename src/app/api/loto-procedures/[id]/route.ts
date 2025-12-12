import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { LOTOProcedureService } from '@/server/services/loto-procedure.service'
import { updateLOTOProcedureSchema } from '@/app/api/schemas/safety-schemas'
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

    const procedure = await LOTOProcedureService.getById(id, session)

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedimiento LOTO no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(procedure)
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

    const validationResult = updateLOTOProcedureSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const procedure = await LOTOProcedureService.update(
      id,
      validationResult.data,
      session
    )

    return NextResponse.json({
      procedure,
      message: 'Procedimiento LOTO actualizado exitosamente'
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

    await LOTOProcedureService.delete(id, session)

    return NextResponse.json({
      message: 'Procedimiento LOTO eliminado exitosamente'
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
