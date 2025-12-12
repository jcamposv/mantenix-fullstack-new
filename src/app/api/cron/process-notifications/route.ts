import { NextRequest, NextResponse } from "next/server"
import { NotificationService } from "@/server/services/notification.service"

/**
 * Cron job endpoint para procesar notificaciones pendientes
 *
 * Este endpoint debería ser llamado periódicamente por:
 * - Vercel Cron (vercel.json)
 * - External cron service (cron-job.org, EasyCron, etc.)
 * - GitHub Actions scheduled workflow
 *
 * Protegido con CRON_SECRET para evitar accesos no autorizados
 *
 * @example
 * // Configurar en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-notifications",
 *     "schedule": "* /5 * * * *"
 *   }]
 * }
 *
 * // O llamar con curl:
 * curl -X POST https://tu-app.com/api/cron/process-notifications \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del cron job
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error("CRON_SECRET not configured")
      return NextResponse.json(
        { error: "Cron job not configured" },
        { status: 500 }
      )
    }

    // Verificar token
    const token = authHeader?.replace("Bearer ", "")
    if (token !== cronSecret) {
      console.warn("Unauthorized cron job attempt")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Procesar notificaciones pendientes
    const processed = await NotificationService.processPendingNotifications(100)

    return NextResponse.json({
      success: true,
      processed,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error processing notifications:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Permite GET para health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "process-notifications",
    message: "Use POST method with Authorization header"
  })
}
