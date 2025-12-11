import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { WorkOrderService } from '@/server/services/work-order.service'
import { MaintenanceAlertHistoryRepository } from '@/server/repositories/maintenance-alert-history.repository'
import { z } from 'zod'
import { workOrderPrioritySchema } from '@/schemas/work-order'
import type { WorkOrderFromTemplateData } from '@/types/work-order.types'

export const dynamic = 'force-dynamic'

const createFromTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID es requerido"),
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().optional(),
  siteId: z.string().min(1, "La sede es requerida"),
  assetId: z.string().optional(),
  scheduledDate: z.date().optional(),
  assignedUserIds: z.array(z.string()).min(1, "Debe asignar al menos un usuario"),
  customFieldValues: z.record(z.string(), z.unknown()).optional(),
  priority: workOrderPrioritySchema.optional(),
  instructions: z.string().optional(),
  safetyNotes: z.string().optional(),
  tools: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  // Maintenance alert integration
  alertHistoryId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const body = await request.json()
    
    // Validate request data
    const validationResult = createFromTemplateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const templateData: WorkOrderFromTemplateData = {
      ...validationResult.data,
      scheduledDate: validationResult.data.scheduledDate 
        ? new Date(validationResult.data.scheduledDate) 
        : undefined
    }

    // Create work order from template
    const workOrder = await WorkOrderService.createFromTemplate(session, templateData)

    // If alertHistoryId is provided, link alert to work order (but don't resolve it yet)
    // Alert will be auto-resolved when work order is completed (ISO 55001 workflow)
    if (validationResult.data.alertHistoryId) {
      try {
        await MaintenanceAlertHistoryRepository.linkToWorkOrder(
          validationResult.data.alertHistoryId,
          workOrder.id
        )
      } catch (alertError) {
        console.error('Error linking alert to work order:', alertError)
        // Continue even if alert linking fails - OT was created successfully
      }
    }

    return NextResponse.json({
      workOrder,
      message: 'Orden de trabajo creada exitosamente desde template'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating work order from template:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}