/**
 * Calculate Minimum Stock API Endpoint
 *
 * POST /api/maintenance/calculate-min-stock - Update min stock for component
 * POST /api/maintenance/calculate-min-stock/bulk - Update all components
 *
 * Following Next.js Expert standards:
 * - Server-side API route
 * - Proper error handling
 * - Type-safe responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/server/services/auth.service'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'

export const dynamic = 'force-dynamic'

/**
 * Request schema for single component update
 */
const updateStockSchema = z.object({
  componentId: z.string().cuid('ID de componente inválido'),
})

/**
 * POST - Update minimum stock for a specific component
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const { componentId } = updateStockSchema.parse(body)

    const result = await MaintenanceAlertService.updateMinimumStockForComponent(
      componentId,
      sessionResult
    )

    if (!result.updated) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      newMinStock: result.newMinStock,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error calculating minimum stock:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al calcular stock mínimo',
      },
      { status: 500 }
    )
  }
}
