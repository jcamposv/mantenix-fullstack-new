import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { LOTOProcedureService } from '@/server/services/loto-procedure.service'
import {
  createLOTOProcedureSchema,
  lotoProcedureFiltersAPISchema
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

    const filters = lotoProcedureFiltersAPISchema.parse(rawFilters)

    const result = await LOTOProcedureService.getList(
      session,
      {
        workOrderId: filters.workOrderId,
        assetId: filters.assetId,
        status: filters.status,
        authorizedBy: filters.authorizedBy
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

    const validationResult = createLOTOProcedureSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const procedure = await LOTOProcedureService.create(
      validationResult.data,
      session
    )

    return NextResponse.json(
      {
        procedure,
        message: 'Procedimiento LOTO creado exitosamente'
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
