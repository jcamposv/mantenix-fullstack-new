import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import {
  createProductionLineSchema,
  type CreateProductionLineFormData,
} from '@/schemas/production-line'
import type { ProductionLineFilters } from '@/types/production-line.types'

/**
 * GET /api/production-lines
 * Get all production lines with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const siteId = searchParams.get('siteId') || undefined
    const search = searchParams.get('search') || undefined
    const isActive = searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined

    const filters: ProductionLineFilters = {
      siteId,
      search,
      isActive,
    }

    const result = await ProductionLineService.getProductionLines(
      sessionResult,
      filters,
      { page, limit }
    )

    return NextResponse.json({
      success: true,
      data: result.productionLines,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching production lines:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al obtener líneas de producción' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/production-lines
 * Create new production line
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()

    // Validate with Zod
    const validationResult = createProductionLineSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data: CreateProductionLineFormData = validationResult.data

    const productionLine = await ProductionLineService.createProductionLine(
      sessionResult,
      data
    )

    return NextResponse.json(
      {
        success: true,
        data: productionLine,
        message: 'Línea de producción creada exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating production line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al crear línea de producción' },
      { status: 500 }
    )
  }
}
