/**
 * API Route: Maintenance Alert History Actions
 *
 * GET /api/maintenance/alert-history/[id] - Get alert details
 * PATCH /api/maintenance/alert-history/[id] - Update alert status (resolve, dismiss)
 *
 * Following Next.js Expert standards:
 * - Feature flag gated
 * - Type-safe with Zod validation
 * - Uses Repository layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/server/services/auth.service'
import { FeatureService } from '@/server/services/feature.service'
import { MaintenanceAlertHistoryRepository } from '@/server/repositories/maintenance-alert-history.repository'
import { getCurrentCompanyId } from '@/lib/company-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Request body schema for resolving alert
 */
const ResolveAlertSchema = z.object({
  action: z.literal('resolve'),
  workOrderId: z.string().optional().nullable(),
  notes: z.string().optional(),
})

/**
 * Request body schema for dismissing alert
 */
const DismissAlertSchema = z.object({
  action: z.literal('dismiss'),
  reason: z.string().min(1, 'Se requiere una razón para dismissar la alerta'),
})

/**
 * Combined schema
 */
const UpdateAlertSchema = z.discriminatedUnion('action', [
  ResolveAlertSchema,
  DismissAlertSchema,
])

/**
 * PATCH - Update alert status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const companyId = await getCurrentCompanyId(sessionResult)
    if (!companyId) {
      return NextResponse.json(
        { error: 'No se pudo determinar la empresa' },
        { status: 400 }
      )
    }

    // Check feature flag
    const hasPredictiveMaintenance = await FeatureService.isModuleEnabled(
      companyId,
      'PREDICTIVE_MAINTENANCE'
    )

    if (!hasPredictiveMaintenance) {
      return NextResponse.json(
        { error: 'Feature de Mantenimiento Predictivo no está activo' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = UpdateAlertSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify alert exists and belongs to this company
    const alert = await MaintenanceAlertHistoryRepository.findById(id)
    if (!alert) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 })
    }

    if (alert.companyId !== companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Check if alert is already resolved/dismissed
    if (alert.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `La alerta ya está ${alert.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Process action
    let updatedAlert
    const userId = sessionResult.user.id

    if (data.action === 'resolve') {
      updatedAlert = await MaintenanceAlertHistoryRepository.resolve(
        id,
        userId,
        data.workOrderId || null,
        data.notes
      )
    } else if (data.action === 'dismiss') {
      updatedAlert = await MaintenanceAlertHistoryRepository.dismiss(
        id,
        userId,
        data.reason
      )
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la alerta' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get alert details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const companyId = await getCurrentCompanyId(sessionResult)
    if (!companyId) {
      return NextResponse.json(
        { error: 'No se pudo determinar la empresa' },
        { status: 400 }
      )
    }

    // Check feature flag
    const hasPredictiveMaintenance = await FeatureService.isModuleEnabled(
      companyId,
      'PREDICTIVE_MAINTENANCE'
    )

    if (!hasPredictiveMaintenance) {
      return NextResponse.json(
        { error: 'Feature de Mantenimiento Predictivo no está activo' },
        { status: 403 }
      )
    }

    // Get alert
    const alert = await MaintenanceAlertHistoryRepository.findById(id)
    if (!alert) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 })
    }

    if (alert.companyId !== companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error getting alert:', error)
    return NextResponse.json(
      { error: 'Error al obtener la alerta' },
      { status: 500 }
    )
  }
}
