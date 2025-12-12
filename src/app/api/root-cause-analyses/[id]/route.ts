import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { RootCauseAnalysisService } from '@/server/services/root-cause-analysis.service'
import { updateRootCauseAnalysisSchema } from '@/app/api/schemas/rca-schemas'
import { ZodError } from 'zod'
import type { UpdateRootCauseAnalysisData } from '@/types/root-cause-analysis.types'

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

    const rca = await RootCauseAnalysisService.getById(id, session)

    if (!rca) {
      return NextResponse.json(
        { error: 'Análisis de causa raíz no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(rca)
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

    const validationResult = updateRootCauseAnalysisSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Transform fishboneData to match the expected type structure
    const rawData = validationResult.data
    const updateData: UpdateRootCauseAnalysisData = {
      ...rawData,
      fishboneData: rawData.fishboneData
        ? 'categories' in rawData.fishboneData
          ? (rawData.fishboneData as UpdateRootCauseAnalysisData['fishboneData'])
          : ({ categories: rawData.fishboneData } as UpdateRootCauseAnalysisData['fishboneData'])
        : rawData.fishboneData
    }

    const rca = await RootCauseAnalysisService.update(
      id,
      updateData,
      session
    )

    return NextResponse.json({
      rca,
      message: 'Análisis de causa raíz actualizado exitosamente'
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

    await RootCauseAnalysisService.delete(id, session)

    return NextResponse.json({
      message: 'Análisis de causa raíz eliminado exitosamente'
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
