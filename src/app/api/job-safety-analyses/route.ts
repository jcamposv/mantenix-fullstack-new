import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { JobSafetyAnalysisService } from '@/server/services/job-safety-analysis.service'
import {
  createJobSafetyAnalysisSchema,
  jsaFiltersAPISchema
} from '@/app/api/schemas/safety-schemas'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const { searchParams } = new URL(request.url)
    const rawFilters = Object.fromEntries(searchParams.entries())

    const filters = jsaFiltersAPISchema.parse(rawFilters)

    const result = await JobSafetyAnalysisService.getList(
      session,
      {
        workOrderId: filters.workOrderId,
        status: filters.status,
        preparedBy: filters.preparedBy,
        reviewedBy: filters.reviewedBy,
        approvedBy: filters.approvedBy
      },
      filters.page,
      filters.limit
    )

    const totalPages = Math.ceil(result.total / filters.limit)

    return NextResponse.json({
      items: result.items,
      total: result.total,
      page: filters.page,
      limit: filters.limit,
      totalPages
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message.includes('No tienes permisos')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const body = await request.json()

    const validationResult = createJobSafetyAnalysisSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Transform jobSteps - if it's a plain text string, split it into steps
    let jobStepsData: import('@/types/job-safety-analysis.types').JSAStep[]

    if (typeof validationResult.data.jobSteps === 'string') {
      // Split by newlines and create simple step objects
      const lines = validationResult.data.jobSteps.split('\n').filter(line => line.trim())
      jobStepsData = lines.map((line, index) => ({
        step: index + 1,
        description: line.trim(),
        hazards: [],
        controls: []
      }))
    } else {
      jobStepsData = validationResult.data.jobSteps as import('@/types/job-safety-analysis.types').JSAStep[]
    }

    const createData: import('@/types/job-safety-analysis.types').CreateJobSafetyAnalysisData = {
      workOrderId: validationResult.data.workOrderId,
      jobSteps: jobStepsData,
      hazardsPerStep: {},
      controlsPerStep: {}
    }

    const jsa = await JobSafetyAnalysisService.create(
      createData,
      session
    )

    return NextResponse.json(
      {
        jsa,
        message: 'Análisis de seguridad creado exitosamente'
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
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
