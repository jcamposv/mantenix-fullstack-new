import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkPermitService } from '@/server/services/work-permit.service'
import {
  createWorkPermitSchema,
  workPermitFiltersAPISchema
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

    const filters = workPermitFiltersAPISchema.parse(rawFilters)

    const result = await WorkPermitService.getList(
      session,
      {
        workOrderId: filters.workOrderId,
        permitType: filters.permitType,
        status: filters.status,
        issuedBy: filters.issuedBy,
        location: filters.location
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

    const validationResult = createWorkPermitSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const workPermit = await WorkPermitService.create(
      validationResult.data,
      session
    )

    return NextResponse.json(
      {
        workPermit,
        message: 'Permiso de trabajo creado exitosamente'
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
