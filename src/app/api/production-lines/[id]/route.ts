import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import {
  updateProductionLineSchema,
  type UpdateProductionLineFormData,
} from '@/schemas/production-line'

/**
 * GET /api/production-lines/[id]
 * Get production line by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    
    const { id } = await context.params

    const productionLine = await ProductionLineService.getProductionLineById(
      sessionResult,
      id
    )

    if (!productionLine) {
      return NextResponse.json(
        { success: false, error: 'Línea de producción no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: productionLine,
    })
  } catch (error) {
    console.error('Error fetching production line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al obtener línea de producción' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/production-lines/[id]
 * Update production line
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    
    const { id } = await context.params

    const body = await request.json()

    // Validate with Zod
    const validationResult = updateProductionLineSchema.safeParse(body)

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

    const data: UpdateProductionLineFormData = validationResult.data

    const productionLine = await ProductionLineService.updateProductionLine(
      sessionResult,
      id,
      data
    )

    return NextResponse.json({
      success: true,
      data: productionLine,
      message: 'Línea de producción actualizada exitosamente',
    })
  } catch (error) {
    console.error('Error updating production line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar línea de producción' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/production-lines/[id]
 * Soft delete production line
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    
    const { id } = await context.params

    await ProductionLineService.deleteProductionLine(sessionResult, id)

    return NextResponse.json({
      success: true,
      message: 'Línea de producción eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error deleting production line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al eliminar línea de producción' },
      { status: 500 }
    )
  }
}
