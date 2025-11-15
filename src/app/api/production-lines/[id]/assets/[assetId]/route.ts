import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import {
  updateAssetInLineSchema,
  type UpdateAssetInLineFormData,
} from '@/schemas/production-line'

/**
 * PUT /api/production-lines/[id]/assets/[assetId]
 * Update asset in production line
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    
    const { assetId } = await context.params

    const body = await request.json()

    // Validate with Zod
    const validationResult = updateAssetInLineSchema.safeParse(body)

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

    const data: UpdateAssetInLineFormData = validationResult.data

    const lineAsset = await ProductionLineService.updateAssetInLine(
      sessionResult,
      assetId,
      data
    )

    return NextResponse.json({
      success: true,
      data: lineAsset,
      message: 'Activo actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error updating asset in line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar activo en la línea' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/production-lines/[id]/assets/[assetId]
 * Remove asset from production line
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    
    const { assetId } = await context.params

    await ProductionLineService.removeAssetFromLine(sessionResult, assetId)

    return NextResponse.json({
      success: true,
      message: 'Activo removido de la línea exitosamente',
    })
  } catch (error) {
    console.error('Error removing asset from line:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al remover activo de la línea' },
      { status: 500 }
    )
  }
}
