import { Prisma } from '@prisma/client'
import { WorkOrderRepository } from '@/server/repositories/work-order.repository'
import { WorkOrderTemplateRepository } from '@/server/repositories/work-order-template.repository'
import { EmailSenderService } from './email-sender.service'
import { PermissionGuard } from '../helpers/permission-guard'
import { prisma } from '@/lib/prisma'
import { getCurrentCompanyId } from '@/lib/company-context'
import { ApprovalService } from './approval.service'
import { DigitalSignatureService } from './digital-signature.service'
import type {
  CreateWorkOrderData,
  UpdateWorkOrderData,
  CompleteWorkOrderData,
  WorkOrderWithRelations,
  WorkOrderFilters,
  WorkOrderAssignmentData,
  WorkOrderFromTemplateData,
  WorkOrderStats
} from '@/types/work-order.types'
import type { AuthenticatedSession } from '@/types/auth.types'

export class WorkOrderService {
  /**
   * Get all work orders with filtering and pagination
   */
  static async getWorkOrders(
    session: AuthenticatedSession,
    filters?: WorkOrderFilters,
    pagination?: { page: number; limit: number }
  ): Promise<{ items: WorkOrderWithRelations[]; total: number }> {
    // Verificar permisos - usuario debe tener permiso para ver todas las OT o solo las asignadas
    await PermissionGuard.requireAny(session, ['work_orders.view_all', 'work_orders.view_assigned'])

    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    // For external users, filter based on their role
    const enhancedFilters = { ...filters }

    // CLIENTE_ADMIN_GENERAL sees all work orders from their client company
    if (session.user.role === 'CLIENTE_ADMIN_GENERAL' && session.user.clientCompanyId) {
      enhancedFilters.clientCompanyId = session.user.clientCompanyId
    }
    // CLIENTE_ADMIN_SEDE and CLIENTE_OPERARIO see only work orders from their site
    else if ((session.user.role === 'CLIENTE_ADMIN_SEDE' || session.user.role === 'CLIENTE_OPERARIO') && session.user.siteId) {
      enhancedFilters.siteId = session.user.siteId
    }

    return await WorkOrderRepository.findMany(
      enhancedFilters,
      pagination,
      companyId
    )
  }

  /**
   * Get work order by ID
   */
  static async getWorkOrderById(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos - usuario debe tener permiso para ver todas las OT, las asignadas, o las de su cliente
    await PermissionGuard.requireAny(session, [
      'work_orders.view_all',
      'work_orders.view_assigned',
      'work_orders.view_client'
    ])

    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    const workOrder = await WorkOrderRepository.findById(id, companyId)

    if (!workOrder) {
      return null
    }

    // Additional permission check for external users (client users)
    if (session.user.role.startsWith("CLIENTE")) {
      // CLIENTE_ADMIN_GENERAL: can view work orders from their client company
      if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
        if (!session.user.clientCompanyId) {
          throw new Error("Usuario CLIENTE_ADMIN_GENERAL no tiene clientCompanyId asignado")
        }

        // Verify work order belongs to a site of their client company
        if (workOrder.site?.clientCompany?.id !== session.user.clientCompanyId) {
          throw new Error("No tienes permisos para ver esta orden de trabajo")
        }
      }
      // CLIENTE_ADMIN_SEDE and CLIENTE_OPERARIO: can only view work orders from their site
      else if (session.user.role === "CLIENTE_ADMIN_SEDE" || session.user.role === "CLIENTE_OPERARIO") {
        if (!session.user.siteId) {
          throw new Error(`Usuario ${session.user.role} no tiene siteId asignado`)
        }

        if (workOrder.siteId !== session.user.siteId) {
          throw new Error("No tienes permisos para ver esta orden de trabajo")
        }
      }
    }

    return workOrder
  }

  /**
   * Create new work order
   */
  static async createWorkOrder(
    session: AuthenticatedSession,
    workOrderData: CreateWorkOrderData
  ): Promise<WorkOrderWithRelations> {
    // Verificar permisos
    await PermissionGuard.require(session, 'work_orders.create')

    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // For external users, ensure they can only create work orders for their site
    if (session.user.role.startsWith("CLIENTE") && session.user.siteId) {
      if (workOrderData.siteId !== session.user.siteId) {
        throw new Error("Solo puedes crear órdenes de trabajo para tu sede")
      }
    }

    // Generate work order number (with prefix if provided)
    const number = await WorkOrderRepository.generateNumber(
      companyId,
      workOrderData.prefixId
    )

    // Validate template if provided
    let templateData = null
    if (workOrderData.templateId) {
      templateData = await WorkOrderTemplateRepository.findFirst({
        id: workOrderData.templateId,
        companyId,
        isActive: true
      })
      if (!templateData) {
        throw new Error("Template no encontrado")
      }
    }

    // Determine status based on assignments
    const hasAssignments = workOrderData.assignedUserIds && workOrderData.assignedUserIds.length > 0
    const defaultStatus = hasAssignments ? "ASSIGNED" : "DRAFT"

    // Prepare data for creation
    const createData: Prisma.WorkOrderCreateInput = {
      number,
      title: workOrderData.title,
      description: workOrderData.description,
      type: workOrderData.type,
      priority: workOrderData.priority || "MEDIUM",
      status: workOrderData.status || defaultStatus,
      scheduledDate: workOrderData.scheduledDate,
      estimatedDuration: workOrderData.estimatedDuration,
      estimatedCost: workOrderData.estimatedCost,
      instructions: workOrderData.instructions,
      safetyNotes: workOrderData.safetyNotes,
      tools: workOrderData.tools || [],
      materials: workOrderData.materials || [],
      customFieldValues: (workOrderData.customFieldValues ?? undefined) as Prisma.InputJsonValue | undefined,
      company: { connect: { id: companyId } },
      creator: { connect: { id: session.user.id } }
    }

    // Add site if provided (required only when EXTERNAL_CLIENT_MANAGEMENT is enabled)
    if (workOrderData.siteId) {
      createData.site = { connect: { id: workOrderData.siteId } }
    }

    // Add prefix if provided
    if (workOrderData.prefixId) {
      createData.prefix = { connect: { id: workOrderData.prefixId } }
    }

    // Add asset if provided
    if (workOrderData.assetId) {
      createData.asset = { connect: { id: workOrderData.assetId } }
    }

    // Add maintenance component if provided (PREDICTIVE_MAINTENANCE feature)
    if (workOrderData.maintenanceComponentId) {
      createData.maintenanceComponent = { connect: { id: workOrderData.maintenanceComponentId } }
    }

    // Add template if provided
    if (workOrderData.templateId) {
      createData.template = { connect: { id: workOrderData.templateId } }
    }

    // Create work order
    const workOrder = await WorkOrderRepository.create(createData)

    // Link to maintenance alert if provided (ISO 55001 standard)
    // Alert remains ACTIVE until work order is completed
    if (workOrderData.alertHistoryId) {
      try {
        const { MaintenanceAlertHistoryRepository } = await import('@/server/repositories/maintenance-alert-history.repository')
        await MaintenanceAlertHistoryRepository.update(workOrderData.alertHistoryId, {
          workOrder: { connect: { id: workOrder.id } }
          // Note: Status remains ACTIVE - alert is only RESOLVED when WO completes
        })
      } catch (error) {
        console.error('Error linking maintenance alert to work order:', error)
        // Don't fail WO creation if alert linking fails
      }
    }

    // Evaluate if approval is needed
    // Note: Asset model doesn't have criticality field directly
    // Asset criticality would come from components if needed in the future
    const evaluation = await ApprovalService.evaluateWorkOrderForApproval({
      estimatedCost: workOrderData.estimatedCost,
      priority: workOrderData.priority || "MEDIUM",
      type: workOrderData.type,
      assetCriticality: undefined // Asset model doesn't have criticality field
    }, companyId)

    if (evaluation.needsApproval) {
      // Update work order status to PENDING_APPROVAL
      await WorkOrderRepository.update(workOrder.id, {
        status: "PENDING_APPROVAL",
        updatedAt: new Date()
      })

      // Create approval records
      await ApprovalService.createApprovalsForWorkOrder(
        workOrder.id,
        evaluation.approvalLevels
      )
    }

    // Set requiresQA flag if QA sign-off is required
    if (evaluation.requiresQA) {
      await WorkOrderRepository.update(workOrder.id, {
        requiresQA: true,
        updatedAt: new Date()
      })
    }

    // Note: Asset status must be changed MANUALLY by technician/operator
    // Users can change status from the work order view or assets page

    // Create assignments
    if (workOrderData.assignedUserIds && workOrderData.assignedUserIds.length > 0) {
      await WorkOrderRepository.createAssignments(
        workOrder.id,
        workOrderData.assignedUserIds,
        session.user.id
      )
    }

    // Return the complete work order with assignments
    const completeWorkOrder = await WorkOrderRepository.findById(workOrder.id, companyId) as WorkOrderWithRelations

    // Send email notifications (async, don't block response)
    this.sendWorkOrderCreatedEmails(completeWorkOrder, session).catch(error => {
      console.error('Error sending work order created emails:', error)
    })

    return completeWorkOrder
  }

  /**
   * Create work order from template
   */
  static async createFromTemplate(
    session: AuthenticatedSession,
    templateData: WorkOrderFromTemplateData
  ): Promise<WorkOrderWithRelations> {
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // Get template data
    const template = await WorkOrderTemplateRepository.findFirst({
      id: templateData.templateId,
      companyId,
      isActive: true
    })

    if (!template) {
      throw new Error("Template no encontrado")
    }

    // Create work order data based on template
    const workOrderData: CreateWorkOrderData = {
      title: templateData.title,
      description: templateData.description || template.description || undefined,
      type: "PREVENTIVO", // Default, can be customized
      priority: templateData.priority || "MEDIUM",
      siteId: templateData.siteId,
      assetId: templateData.assetId,
      templateId: template.id,
      customFieldValues: templateData.customFieldValues,
      scheduledDate: templateData.scheduledDate,
      instructions: templateData.instructions,
      safetyNotes: templateData.safetyNotes,
      tools: templateData.tools,
      materials: templateData.materials,
      assignedUserIds: templateData.assignedUserIds
    }

    return await this.createWorkOrder(session, workOrderData)
  }

  /**
   * Update work order
   */
  static async updateWorkOrder(
    session: AuthenticatedSession,
    id: string,
    updateData: UpdateWorkOrderData
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos
    await PermissionGuard.require(session, 'work_orders.update')

    // Get existing work order (getCurrentCompanyId is called inside)
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Prepare data for update
    const updatePrismaData: Prisma.WorkOrderUpdateInput = {
      title: updateData.title,
      description: updateData.description,
      type: updateData.type,
      priority: updateData.priority,
      status: updateData.status,
      scheduledDate: updateData.scheduledDate,
      estimatedDuration: updateData.estimatedDuration,
      estimatedCost: updateData.estimatedCost,
      instructions: updateData.instructions,
      safetyNotes: updateData.safetyNotes,
      tools: updateData.tools,
      materials: updateData.materials,
      observations: updateData.observations,
      completionNotes: updateData.completionNotes,
      actualDuration: updateData.actualDuration,
      actualCost: updateData.actualCost,
      customFieldValues: (updateData.customFieldValues ?? undefined) as Prisma.InputJsonValue | undefined,
      updatedAt: new Date()
    }

    // Update site if provided
    if (updateData.siteId) {
      updatePrismaData.site = { connect: { id: updateData.siteId } }
    } else if (updateData.siteId === null) {
      updatePrismaData.site = { disconnect: true }
    }

    // Update asset if provided
    if (updateData.assetId) {
      updatePrismaData.asset = { connect: { id: updateData.assetId } }
    } else if (updateData.assetId === null) {
      updatePrismaData.asset = { disconnect: true }
    }

    // Update maintenance component if provided (PREDICTIVE_MAINTENANCE feature)
    if (updateData.maintenanceComponentId) {
      updatePrismaData.maintenanceComponent = { connect: { id: updateData.maintenanceComponentId } }
    } else if (updateData.maintenanceComponentId === null) {
      updatePrismaData.maintenanceComponent = { disconnect: true }
    }

    // Handle status changes
    if (updateData.status) {
      if (updateData.status === "IN_PROGRESS" && !existingWorkOrder.startedAt) {
        updatePrismaData.startedAt = new Date()
      } else if (updateData.status === "COMPLETED" && !existingWorkOrder.completedAt) {
        updatePrismaData.completedAt = new Date()

        // Auto-calculate costs when marking as completed
        // This ensures costs are calculated even if completed manually (not via Time Tracker)
        const { TimeTrackingRepository } = await import("@/server/repositories/time-tracking.repository")
        const timeTrackingRepo = new TimeTrackingRepository()

        // Check if there are time logs for this work order
        const timeLogs = await prisma.workOrderTimeLog.findMany({
          where: { workOrderId: id },
          take: 1,
        })

        // Only calculate costs if there are time logs
        if (timeLogs.length > 0) {
          try {
            const costs = await timeTrackingRepo.calculateActualCost(id)
            const summary = await timeTrackingRepo.getTimeSummary(id)

            updatePrismaData.actualDuration = summary.totalElapsedMinutes
            updatePrismaData.activeWorkTime = summary.activeWorkMinutes
            updatePrismaData.waitingTime = summary.pausedMinutes
            updatePrismaData.laborCost = costs.laborCost
            updatePrismaData.partsCost = costs.partsCost
            updatePrismaData.downtimeCost = costs.downtimeCost
            updatePrismaData.actualCost = costs.totalCost
          } catch (error) {
            console.error("Error calculating costs on work order completion:", error)
            // Don't fail the update if cost calculation fails
          }
        }

        // Note: Asset status must be changed MANUALLY by technician/operator
        // Users can change status from the work order view or assets page
      }
    }

    // Handle assignment updates
    if (updateData.assignedUserIds !== undefined) {
      if (updateData.assignedUserIds.length > 0) {
        // Create/update assignments
        await WorkOrderRepository.createAssignments(
          id,
          updateData.assignedUserIds,
          session.user.id
        )

        // If status is DRAFT and we're adding assignments, change to ASSIGNED
        if (existingWorkOrder.status === "DRAFT" && !updateData.status) {
          updatePrismaData.status = "ASSIGNED"
        }
      } else {
        // If empty array is provided, remove all assignments
        await prisma.workOrderAssignment.deleteMany({
          where: { workOrderId: id }
        })

        // If removing all assignments and status was ASSIGNED, revert to DRAFT
        if (existingWorkOrder.status === "ASSIGNED" && !updateData.status) {
          updatePrismaData.status = "DRAFT"
        }
      }
    }

    return await WorkOrderRepository.update(id, updatePrismaData)
  }

  /**
   * Complete work order
   */
  static async completeWorkOrder(
    session: AuthenticatedSession,
    id: string,
    completionData: CompleteWorkOrderData
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos
    await PermissionGuard.require(session, 'work_orders.complete')

    // Get existing work order
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Check if there are any time logs for this work order
    const { TimeTrackingRepository } = await import("@/server/repositories/time-tracking.repository")
    const timeTrackingRepo = new TimeTrackingRepository()
    const hasTimeLogs = await timeTrackingRepo.hasTimeLogs(id)

    // If there are time logs but no COMPLETE log, create one
    if (hasTimeLogs) {
      const lastLog = await timeTrackingRepo.getLastTimeLog(id)

      // Only create COMPLETE log if the last action wasn't already COMPLETE
      if (lastLog && lastLog.action !== "COMPLETE") {
        try {
          // Create COMPLETE time log
          await timeTrackingRepo.createTimeLog({
            workOrderId: id,
            userId: session.user.id,
            action: "COMPLETE",
            notes: completionData.completionNotes,
            timestamp: new Date(),
          })

          // updateWorkOrderTimeMetrics is automatically called by createTimeLog
          // when action is COMPLETE, so we don't need to call it here
        } catch (error) {
          console.error("Error creating COMPLETE time log:", error)
          // Continue with completion even if time log creation fails
        }
      }
    }

    // Determine final status based on QA requirements
    // If work order requires QA sign-off, set status to PENDING_QA instead of COMPLETED
    const finalStatus = existingWorkOrder.requiresQA ? "PENDING_QA" : "COMPLETED"

    // Prepare completion data
    const updateData: UpdateWorkOrderData = {
      status: finalStatus,
      observations: completionData.observations,
      completionNotes: completionData.completionNotes,
      actualDuration: completionData.actualDuration,
      actualCost: completionData.actualCost,
      customFieldValues: completionData.customFieldValues
    }

    const updatedWorkOrder = await this.updateWorkOrder(session, id, updateData)

    // Create digital signature for work order completion (ISO compliance)
    if (updatedWorkOrder) {
      try {
        await DigitalSignatureService.createSignature(
          session,
          'WORK_ORDER',
          id,
          finalStatus === 'PENDING_QA' ? 'EXECUTED' : 'COMPLETED',
          completionData.completionNotes
        )
      } catch (error) {
        console.error('Error creating digital signature:', error)
        // Don't fail completion if signature creation fails
      }

      // Resolve linked maintenance alert if exists and status is COMPLETED (ISO 55001 standard)
      // Alert is only resolved when work is actually completed, not when PENDING_QA
      if (finalStatus === 'COMPLETED') {
        try {
          // Check if this WO is linked to a maintenance alert
          const { MaintenanceAlertHistoryRepository } = await import('@/server/repositories/maintenance-alert-history.repository')
          const alerts = await MaintenanceAlertHistoryRepository.findByWorkOrder(id)

          // Resolve all linked alerts that are still ACTIVE
          for (const alert of alerts) {
            if (alert.status === 'ACTIVE') {
              await MaintenanceAlertHistoryRepository.resolve(
                alert.id,
                session.user.id,
                id,
                `Resuelta automáticamente al completar orden de trabajo ${updatedWorkOrder.number}`
              )
            }
          }
        } catch (error) {
          console.error('Error resolving linked maintenance alerts:', error)
          // Don't fail completion if alert resolution fails
        }
      }

      // Send email notifications (async, don't block response)
      this.sendWorkOrderCompletedEmails(updatedWorkOrder, session).catch(error => {
        console.error('Error sending work order completed emails:', error)
      })
    }

    return updatedWorkOrder
  }

  /**
   * QA Approve work order
   */
  static async qaApproveWorkOrder(
    session: AuthenticatedSession,
    id: string,
    comments?: string
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos - requires QA permission
    await PermissionGuard.require(session, 'work_orders.qa_signoff')

    // Get existing work order
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Verify status is PENDING_QA
    if (existingWorkOrder.status !== "PENDING_QA") {
      throw new Error("La orden de trabajo no está pendiente de QA sign-off")
    }

    // Update status to COMPLETED and record QA approval
    const updateData: UpdateWorkOrderData = {
      status: "COMPLETED",
      qaSignedOffBy: session.user.id,
      qaSignedOffAt: new Date(),
      qaComments: comments
    }

    const updatedWorkOrder = await this.updateWorkOrder(session, id, updateData)

    // Create QA digital signature (ISO compliance)
    if (updatedWorkOrder) {
      try {
        await DigitalSignatureService.createSignature(
          session,
          'WORK_ORDER',
          id,
          'QA_SIGNOFF',
          comments
        )
      } catch (error) {
        console.error('Error creating QA digital signature:', error)
        // Don't fail QA approval if signature creation fails
      }

      // Resolve linked maintenance alert (ISO 55001 standard)
      // When QA approves, work is considered completed
      try {
        const { MaintenanceAlertHistoryRepository } = await import('@/server/repositories/maintenance-alert-history.repository')
        const alerts = await MaintenanceAlertHistoryRepository.findByWorkOrder(id)

        // Resolve all linked alerts that are still ACTIVE
        for (const alert of alerts) {
          if (alert.status === 'ACTIVE') {
            await MaintenanceAlertHistoryRepository.resolve(
              alert.id,
              session.user.id,
              id,
              `Resuelta automáticamente - QA aprobó orden de trabajo ${updatedWorkOrder.number}`
            )
          }
        }
      } catch (error) {
        console.error('Error resolving linked maintenance alerts:', error)
        // Don't fail QA approval if alert resolution fails
      }
    }

    return updatedWorkOrder
  }

  /**
   * QA Reject work order
   */
  static async qaRejectWorkOrder(
    session: AuthenticatedSession,
    id: string,
    comments: string
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos - requires QA permission
    await PermissionGuard.require(session, 'work_orders.qa_signoff')

    // Get existing work order
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Verify status is PENDING_QA
    if (existingWorkOrder.status !== "PENDING_QA") {
      throw new Error("La orden de trabajo no está pendiente de QA sign-off")
    }

    // Update status back to IN_PROGRESS and record QA rejection
    const updateData: UpdateWorkOrderData = {
      status: "IN_PROGRESS",
      qaRejectedBy: session.user.id,
      qaRejectedAt: new Date(),
      qaComments: comments
    }

    return await this.updateWorkOrder(session, id, updateData)
  }

  /**
   * Assign users to work order
   */
  static async assignUsers(
    session: AuthenticatedSession,
    workOrderId: string,
    assignmentData: WorkOrderAssignmentData
  ) {
    // Verificar permisos
    await PermissionGuard.require(session, 'work_orders.assign')

    // Verify work order exists and belongs to current company (getCurrentCompanyId is called inside)
    const workOrder = await this.getWorkOrderById(session, workOrderId)
    if (!workOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Create assignments
    return await WorkOrderRepository.createAssignments(
      workOrderId,
      assignmentData.userIds,
      session.user.id
    )
  }

  /**
   * Cancel work order
   */
  static async cancelWorkOrder(
    session: AuthenticatedSession,
    id: string,
    reason?: string
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos
    await PermissionGuard.require(session, 'work_orders.cancel')

    // Get existing work order
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Note: Asset status must be changed MANUALLY by technician/operator
    // Users can change status from the work order view or assets page

    // Update status to cancelled
    const updateData: UpdateWorkOrderData = {
      status: "CANCELLED",
      completionNotes: reason || "Orden cancelada"
    }

    return await this.updateWorkOrder(session, id, updateData)
  }

  /**
   * Delete work order (soft delete)
   */
  static async deleteWorkOrder(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderWithRelations | null> {
    // Verificar permisos
    await PermissionGuard.require(session, 'work_orders.delete')

    // Verify work order exists and belongs to current company (getCurrentCompanyId is called inside)
    const workOrder = await this.getWorkOrderById(session, id)
    if (!workOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    return await WorkOrderRepository.softDelete(id)
  }

  /**
   * Get work orders assigned to current user
   */
  static async getMyWorkOrders(
    session: AuthenticatedSession,
    filters?: Omit<WorkOrderFilters, 'assignedToMe'>,
    pagination?: { page: number; limit: number }
  ): Promise<{ items: WorkOrderWithRelations[]; total: number }> {
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado")
    }

    return await WorkOrderRepository.findByAssignedUser(
      session.user.id,
      filters,
      pagination
    )
  }

  /**
   * Get work order statistics
   */
  static async getWorkOrderStats(
    session: AuthenticatedSession,
    filters?: WorkOrderFilters
  ): Promise<WorkOrderStats> {
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // For external users, filter based on their role
    const enhancedFilters = { ...filters }

    // CLIENTE_ADMIN_GENERAL sees all work orders from their client company
    if (session.user.role === 'CLIENTE_ADMIN_GENERAL' && session.user.clientCompanyId) {
      enhancedFilters.clientCompanyId = session.user.clientCompanyId
    }
    // CLIENTE_ADMIN_SEDE and CLIENTE_OPERARIO see only work orders from their site
    else if ((session.user.role === 'CLIENTE_ADMIN_SEDE' || session.user.role === 'CLIENTE_OPERARIO') && session.user.siteId) {
      enhancedFilters.siteId = session.user.siteId
    }

    return await WorkOrderRepository.getStats(
      companyId,
      enhancedFilters
    )
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(
    session: AuthenticatedSession,
    filters?: WorkOrderFilters
  ) {
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // For external users, filter based on their role
    const enhancedFilters = { ...filters }

    // CLIENTE_ADMIN_GENERAL sees all work orders from their client company
    if (session.user.role === 'CLIENTE_ADMIN_GENERAL' && session.user.clientCompanyId) {
      enhancedFilters.clientCompanyId = session.user.clientCompanyId
    }
    // CLIENTE_ADMIN_SEDE and CLIENTE_OPERARIO see only work orders from their site
    else if ((session.user.role === 'CLIENTE_ADMIN_SEDE' || session.user.role === 'CLIENTE_OPERARIO') && session.user.siteId) {
      enhancedFilters.siteId = session.user.siteId
    }

    const [stats, recentActivity, performanceMetrics, upcomingWorkOrders] = await Promise.all([
      WorkOrderRepository.getDashboardStats(companyId, enhancedFilters),
      WorkOrderRepository.getRecentActivity(companyId, 10, enhancedFilters),
      WorkOrderRepository.getPerformanceMetrics(companyId, 7, enhancedFilters),
      WorkOrderRepository.getUpcomingWorkOrders(companyId, 10, enhancedFilters)
    ])

    return {
      ...stats,
      recentActivity,
      performanceMetrics,
      upcomingWorkOrders
    }
  }

  /**
   * Send email notifications when a work order is created
   */
  private static async sendWorkOrderCreatedEmails(
    workOrder: WorkOrderWithRelations,
    session: AuthenticatedSession
  ): Promise<void> {
    try {
      if (!workOrder.companyId) return

      // Get recipient emails
      const recipientEmails: string[] = []

      // 1. Get assigned users emails
      if (workOrder.assignments && workOrder.assignments.length > 0) {
        const assignedUsers = await prisma.user.findMany({
          where: {
            id: { in: workOrder.assignments.map(a => a.userId) }
          },
          select: { email: true }
        })
        recipientEmails.push(...assignedUsers.map(u => u.email))
      }

      // 2. Get tenant admins (ADMIN_EMPRESA and ADMIN_GRUPO)
      const tenantAdmins = await prisma.user.findMany({
        where: {
          companyId: workOrder.companyId,
          role: { key: { in: ['ADMIN_EMPRESA', 'ADMIN_GRUPO'] } },
          isLocked: false
        },
        select: { email: true }
      })
      recipientEmails.push(...tenantAdmins.map(u => u.email))

      // Remove duplicates
      const uniqueEmails = [...new Set(recipientEmails)]

      if (uniqueEmails.length === 0) {
        console.log('No recipients found for work order created email')
        return
      }

      // Build work order URL
      const company = await prisma.company.findUnique({
        where: { id: workOrder.companyId },
        select: { subdomain: true }
      })

      const domainBase = process.env.DOMAIN_BASE || "mantenix.com"
      const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://${company?.subdomain}.${domainBase}`
        : `http://${company?.subdomain}.localhost:3000`
      const workOrderUrl = `${baseUrl}/work-orders/${workOrder.id}`

      // Format scheduled date
      const scheduledDate = workOrder.scheduledDate
        ? new Date(workOrder.scheduledDate).toLocaleString('es-ES', {
            dateStyle: 'long',
            timeStyle: 'short'
          })
        : 'No programada'

      // Get creator name
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true }
      })

      // Send email
      await EmailSenderService.sendWorkOrderCreatedEmail(
        uniqueEmails,
        workOrder.number,
        workOrder.title,
        workOrder.description || '',
        workOrder.type,
        workOrder.priority,
        workOrder.status,
        workOrder.site?.name || 'Sin sede',
        scheduledDate,
        creator?.name || 'Usuario',
        workOrderUrl,
        workOrder.companyId
      )

      console.log(`Work order created email sent to ${uniqueEmails.length} recipients`)
    } catch (error) {
      console.error('Error sending work order created emails:', error)
      // Don't throw - email errors shouldn't fail work order creation
    }
  }

  /**
   * Send email notifications when a work order is completed
   */
  private static async sendWorkOrderCompletedEmails(
    workOrder: WorkOrderWithRelations,
    session: AuthenticatedSession
  ): Promise<void> {
    try {
      if (!workOrder.companyId) return

      // Get recipient emails
      const recipientEmails: string[] = []

      // 1. Get assigned users emails
      if (workOrder.assignments && workOrder.assignments.length > 0) {
        const assignedUsers = await prisma.user.findMany({
          where: {
            id: { in: workOrder.assignments.map(a => a.userId) }
          },
          select: { email: true }
        })
        recipientEmails.push(...assignedUsers.map(u => u.email))
      }

      // 2. Get tenant admins (ADMIN_EMPRESA and ADMIN_GRUPO)
      const tenantAdmins = await prisma.user.findMany({
        where: {
          companyId: workOrder.companyId,
          role: { key: { in: ['ADMIN_EMPRESA', 'ADMIN_GRUPO'] } },
          isLocked: false
        },
        select: { email: true }
      })
      recipientEmails.push(...tenantAdmins.map(u => u.email))

      // Remove duplicates
      const uniqueEmails = [...new Set(recipientEmails)]

      if (uniqueEmails.length === 0) {
        console.log('No recipients found for work order completed email')
        return
      }

      // Build work order URL
      const company = await prisma.company.findUnique({
        where: { id: workOrder.companyId },
        select: { subdomain: true }
      })

      const domainBase = process.env.DOMAIN_BASE || "mantenix.com"
      const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://${company?.subdomain}.${domainBase}`
        : `http://${company?.subdomain}.localhost:3000`
      const workOrderUrl = `${baseUrl}/work-orders/${workOrder.id}`

      // Format completion date
      const completedAt = workOrder.completedAt
        ? new Date(workOrder.completedAt).toLocaleString('es-ES', {
            dateStyle: 'long',
            timeStyle: 'short'
          })
        : new Date().toLocaleString('es-ES', {
            dateStyle: 'long',
            timeStyle: 'short'
          })

      // Get user name
      const completedBy = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true }
      })

      // Send email
      await EmailSenderService.sendWorkOrderCompletedEmail(
        uniqueEmails,
        workOrder.number,
        workOrder.title,
        workOrder.description || '',
        workOrder.type,
        workOrder.priority,
        workOrder.status,
        workOrder.site?.name || 'Sin sede',
        completedBy?.name || 'Usuario',
        completedAt,
        workOrderUrl,
        workOrder.companyId
      )

      console.log(`Work order completed email sent to ${uniqueEmails.length} recipients`)
    } catch (error) {
      console.error('Error sending work order completed emails:', error)
      // Don't throw - email errors shouldn't fail work order completion
    }
  }
}