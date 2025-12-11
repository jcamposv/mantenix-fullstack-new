import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { JobSafetyAnalysisService } from '@/server/services/job-safety-analysis.service'
import { updateJobSafetyAnalysisSchema } from '@/app/api/schemas/safety-schemas'
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

    const jsa = await JobSafetyAnalysisService.getById(id, session)

    if (!jsa) {
      return NextResponse.json(
        { error: 'Análisis de seguridad no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(jsa)
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

    const validationResult = updateJobSafetyAnalysisSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Transform jobSteps from string to JSAStep[] if needed
    const updateData: import('@/types/job-safety-analysis.types').UpdateJobSafetyAnalysisData = {
      ...(validationResult.data.workOrderId !== undefined && { workOrderId: validationResult.data.workOrderId }),
      ...(validationResult.data.jobSteps !== undefined && {
        jobSteps: typeof validationResult.data.jobSteps === 'string'
          ? (JSON.parse(validationResult.data.jobSteps) as import('@/types/job-safety-analysis.types').JSAStep[])
          : (validationResult.data.jobSteps as import('@/types/job-safety-analysis.types').JSAStep[])
      })
    }

    const jsa = await JobSafetyAnalysisService.update(
      id,
      updateData,
      session
    )

    return NextResponse.json({
      jsa,
      message: 'Análisis de seguridad actualizado exitosamente'
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

    await JobSafetyAnalysisService.delete(id, session)

    return NextResponse.json({
      message: 'Análisis de seguridad eliminado exitosamente'
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
