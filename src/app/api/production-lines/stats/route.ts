import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'

/**
 * GET /api/production-lines/stats
 * Get production line statistics
 */
export async function GET() {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    // Type guard: return early if not authenticated
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const stats = await ProductionLineService.getStats(sessionResult)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error fetching production line stats:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('permisos') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas de líneas de producción',
      },
      { status: 500 }
    )
  }
}
