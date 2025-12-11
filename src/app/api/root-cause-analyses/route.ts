import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { RootCauseAnalysisService } from '@/server/services/root-cause-analysis.service'
import {
  createRootCauseAnalysisSchema,
  rcaFiltersAPISchema
} from '@/app/api/schemas/rca-schemas'
import { ZodError } from 'zod'
import type { CreateRootCauseAnalysisData } from '@/types/root-cause-analysis.types'

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

    const filters = rcaFiltersAPISchema.parse(rawFilters)

    const result = await RootCauseAnalysisService.getList(
      session,
      {
        search: filters.search,
        workOrderId: filters.workOrderId,
        assetId: filters.assetId,
        analysisType: filters.analysisType,
        status: filters.status,
        analyzedBy: filters.analyzedBy
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

    const validationResult = createRootCauseAnalysisSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Transform fishboneData to match the expected type structure
    const rawData = validationResult.data
    const createData: CreateRootCauseAnalysisData = {
      ...rawData,
      fishboneData: rawData.fishboneData
        ? 'categories' in rawData.fishboneData
          ? (rawData.fishboneData as CreateRootCauseAnalysisData['fishboneData'])
          : ({ categories: rawData.fishboneData } as CreateRootCauseAnalysisData['fishboneData'])
        : rawData.fishboneData
    }

    const rca = await RootCauseAnalysisService.create(
      createData,
      session
    )

    return NextResponse.json(
      {
        rca,
        message: 'Análisis de causa raíz creado exitosamente'
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
