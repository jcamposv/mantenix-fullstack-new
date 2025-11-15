import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import {
  flowConfigurationSchema,
  type FlowConfigurationFormData,
} from '@/schemas/production-line'

/**
 * PUT /api/production-lines/[id]/flow
 * Update React Flow configuration (nodes, edges, viewport)
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
    const validationResult = flowConfigurationSchema.safeParse(body)

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

    const flowConfiguration: FlowConfigurationFormData = validationResult.data

    const productionLine =
      await ProductionLineService.updateFlowConfiguration(
        sessionResult,
        id,
        flowConfiguration
      )

    return NextResponse.json({
      success: true,
      data: productionLine,
      message: 'Configuración del flujo actualizada exitosamente',
    })
  } catch (error) {
    console.error('Error updating flow configuration:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar configuración del flujo',
      },
      { status: 500 }
    )
  }
}
