import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ApprovalService } from '@/server/services/approval.service'
import {
  createAuthorityLimitSchema,
  authorityLimitFiltersAPISchema
} from '@/app/api/schemas/approval-schemas'
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

    const filters = authorityLimitFiltersAPISchema.parse(rawFilters)

    const result = await ApprovalService.getAuthorityLimits(
      session,
      {
        search: filters.search,
        roleKey: filters.roleKey,
        isActive: filters.isActive
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

    const validationResult = createAuthorityLimitSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const authorityLimit = await ApprovalService.createAuthorityLimit(
      validationResult.data,
      session
    )

    return NextResponse.json(
      {
        authorityLimit,
        message: 'Límite de autoridad creado exitosamente'
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
