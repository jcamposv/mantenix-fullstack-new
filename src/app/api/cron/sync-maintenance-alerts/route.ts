/**
 * Cron job endpoint para sincronizar alertas de mantenimiento predictivo
 *
 * Este endpoint genera y sincroniza alertas de mantenimiento basadas en MTBF
 * para todas las empresas con la feature PREDICTIVE_MAINTENANCE activa.
 *
 * Debería ser llamado periódicamente por:
 * - Vercel Cron (vercel.json)
 * - External cron service (cron-job.org, EasyCron, etc.)
 * - GitHub Actions scheduled workflow
 *
 * Protegido con CRON_SECRET para evitar accesos no autorizados
 *
 * Following Next.js Expert standards:
 * - Delegates to Service layer
 * - Type-safe
 * - Proper error handling
 *
 * @example
 * // Configurar en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-maintenance-alerts",
 *     "schedule": "0 * * * *"  // Cada hora
 *   }]
 * }
 *
 * // O llamar con curl:
 * curl -X POST https://tu-app.com/api/cron/sync-maintenance-alerts \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaintenanceAlertService } from '@/server/services/maintenance-alert.service'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del cron job
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      )
    }

    // Verificar token
    const token = authHeader?.replace('Bearer ', '')
    if (token !== cronSecret) {
      console.warn('[CRON] Unauthorized cron job attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting maintenance alerts sync...')

    // Delegar al servicio (Repository + Service pattern)
    const result = await MaintenanceAlertService.syncAlertsForAllCompanies()

    console.log(
      `[CRON] Sync completed: ${result.successCount} successful, ${result.failCount} failed`
    )

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[CRON] Error syncing maintenance alerts:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'sync-maintenance-alerts',
    message: 'Use POST method with Authorization header',
    schedule: 'Recommended: Every 1 hour (0 * * * *)',
  })
}
