import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import {
  addAssetToLineSchema,
  type AddAssetToLineFormData,
} from '@/schemas/production-line'

/**
 * POST /api/production-lines/[id]/assets
 * Add asset to production line
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    
    const { id: productionLineId } = await context.params

    const body = await request.json()

    // Validate with Zod
    const validationResult = addAssetToLineSchema.safeParse(body)

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

    const data: AddAssetToLineFormData = validationResult.data

    const lineAsset = await ProductionLineService.addAssetToLine(
      sessionResult,
      productionLineId,
      data
    )

    return NextResponse.json(
      {
        success: true,
        data: lineAsset,
        message: 'Activo agregado a la línea exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding asset to line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al agregar activo a la línea' },
      { status: 500 }
    )
  }
}
