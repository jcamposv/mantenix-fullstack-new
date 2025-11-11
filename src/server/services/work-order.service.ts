import { Prisma } from '@prisma/client'
import { WorkOrderRepository } from '@/server/repositories/work-order.repository'
import { WorkOrderTemplateRepository } from '@/server/repositories/work-order-template.repository'
import { EmailSenderService } from './email-sender.service'
import { prisma } from '@/lib/prisma'
import { getCurrentCompanyId } from '@/lib/company-context'
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
  ): Promise<{ workOrders: WorkOrderWithRelations[]; total: number }> {
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
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    const workOrder = await WorkOrderRepository.findById(id, companyId)

    // Additional permission check for external users
    if (workOrder && session.user.role.startsWith("CLIENTE") && session.user.siteId) {
      if (workOrder.siteId !== session.user.siteId) {
        throw new Error("No tienes permisos para ver esta orden de trabajo")
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
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // Permission check - only certain roles can create work orders
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'SUPERVISOR']
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error("No tienes permisos para crear órdenes de trabajo")
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

    // Add template if provided
    if (workOrderData.templateId) {
      createData.template = { connect: { id: workOrderData.templateId } }
    }

    // Create work order
    const workOrder = await WorkOrderRepository.create(createData)

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
    // Get existing work order (getCurrentCompanyId is called inside)
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Permission check - only creator, supervisors, and assigned users can update
    const canUpdate =
      existingWorkOrder.createdBy === session.user.id ||
      ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'SUPERVISOR'].includes(session.user.role) ||
      existingWorkOrder.assignments?.some(assignment => assignment.userId === session.user.id)

    if (!canUpdate) {
      throw new Error("No tienes permisos para modificar esta orden de trabajo")
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

    // Handle status changes
    if (updateData.status) {
      if (updateData.status === "IN_PROGRESS" && !existingWorkOrder.startedAt) {
        updatePrismaData.startedAt = new Date()
      } else if (updateData.status === "COMPLETED" && !existingWorkOrder.completedAt) {
        updatePrismaData.completedAt = new Date()
      }
    }

    // Update assignments if provided
    if (updateData.assignedUserIds !== undefined) {
      if (updateData.assignedUserIds.length > 0) {
        // Create/update assignments
        await WorkOrderRepository.createAssignments(
          id,
          updateData.assignedUserIds,
          session.user.id
        )

        // Update status to ASSIGNED if currently DRAFT
        if (!updateData.status && existingWorkOrder.status === 'DRAFT') {
          updatePrismaData.status = 'ASSIGNED'
        }
      } else {
        // Remove all assignments if empty array provided
        await WorkOrderRepository.createAssignments(id, [], session.user.id)
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
    // Get existing work order
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Permission check - only assigned users can complete
    const isAssigned = existingWorkOrder.assignments?.some(
      assignment => assignment.userId === session.user.id
    )
    const isSupervisor = ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'SUPERVISOR'].includes(session.user.role)

    if (!isAssigned && !isSupervisor) {
      throw new Error("Solo los usuarios asignados pueden completar esta orden de trabajo")
    }

    // Prepare completion data
    const updateData: UpdateWorkOrderData = {
      status: "COMPLETED",
      observations: completionData.observations,
      completionNotes: completionData.completionNotes,
      actualDuration: completionData.actualDuration,
      actualCost: completionData.actualCost,
      customFieldValues: completionData.customFieldValues
    }

    const updatedWorkOrder = await this.updateWorkOrder(session, id, updateData)

    // Send email notifications (async, don't block response)
    if (updatedWorkOrder) {
      this.sendWorkOrderCompletedEmails(updatedWorkOrder, session).catch(error => {
        console.error('Error sending work order completed emails:', error)
      })
    }

    return updatedWorkOrder
  }

  /**
   * Assign users to work order
   */
  static async assignUsers(
    session: AuthenticatedSession,
    workOrderId: string,
    assignmentData: WorkOrderAssignmentData
  ) {
    // Permission check - only supervisors can assign
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'SUPERVISOR']
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error("No tienes permisos para asignar usuarios")
    }

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
    // Get existing work order
    const existingWorkOrder = await this.getWorkOrderById(session, id)
    if (!existingWorkOrder) {
      throw new Error("Orden de trabajo no encontrada")
    }

    // Permission check - only creator or supervisors can cancel
    const canCancel =
      existingWorkOrder.createdBy === session.user.id ||
      ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'SUPERVISOR'].includes(session.user.role)

    if (!canCancel) {
      throw new Error("No tienes permisos para cancelar esta orden de trabajo")
    }

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
    // Permission check - only admins can delete
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA']
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error("No tienes permisos para eliminar órdenes de trabajo")
    }

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
  ): Promise<{ workOrders: WorkOrderWithRelations[]; total: number }> {
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
          role: { in: ['ADMIN_EMPRESA', 'ADMIN_GRUPO'] },
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
          role: { in: ['ADMIN_EMPRESA', 'ADMIN_GRUPO'] },
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