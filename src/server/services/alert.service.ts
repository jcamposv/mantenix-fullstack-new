import { Prisma } from "@prisma/client"
import { AlertRepository } from "../repositories/alert.repository"
import { AuthService } from "./auth.service"
import { NotificationService } from "./notification.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { AlertFilters, PaginatedAlertsResponse, AlertWithRelations } from "@/types/alert.types"
import type { CreateAlertInput, UpdateAlertInput } from "../../app/api/schemas/alert-schemas"

/**
 * Servicio de lógica de negocio para alertas
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class AlertService {
  
  /**
   * Construye el WHERE clause para filtrar alertas según el rol del usuario
   */
  static buildWhereClause(session: AuthenticatedSession, alertId?: string, filters?: AlertFilters): Prisma.AlertWhereInput {
    const whereClause: Prisma.AlertWhereInput = alertId ? { id: alertId } : {}

    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver cualquier alerta
      if (filters?.siteId) {
        whereClause.siteId = filters.siteId
      }
    } else if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      whereClause.site = {
        clientCompany: {
          tenantCompanyId: session.user.companyId
        }
      }
      if (filters?.siteId) {
        whereClause.siteId = filters.siteId
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario sin empresa cliente asociada")
      }
      whereClause.site = {
        clientCompanyId: session.user.clientCompanyId
      }
      if (filters?.siteId) {
        whereClause.siteId = filters.siteId
      }
    } else if (["CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO", "TECNICO"].includes(session.user.role)) {
      if (!session.user.siteId) {
        throw new Error("Usuario sin sede asociada")
      }
      whereClause.siteId = session.user.siteId
    } else {
      throw new Error("Rol no autorizado para acceder a alertas")
    }

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.status) whereClause.status = filters.status
      if (filters.priority) whereClause.priority = filters.priority
      if (filters.type) whereClause.type = filters.type
      if (filters.my === 'reported') whereClause.reportedById = session.user.id
      if (filters.my === 'assigned') whereClause.assignedToId = session.user.id
    }

    return whereClause
  }

  /**
   * Obtiene una alerta por ID verificando permisos
   */
  static async getById(alertId: string, session: AuthenticatedSession): Promise<AlertWithRelations | null> {
    const whereClause = this.buildWhereClause(session, alertId)
    return await AlertRepository.findFirst(whereClause)
  }

  /**
   * Obtiene lista paginada de alertas
   */
  static async getList(session: AuthenticatedSession, filters: AlertFilters, page: number, limit: number): Promise<PaginatedAlertsResponse> {
    const whereClause = this.buildWhereClause(session, undefined, filters)
    const { alerts, total } = await AlertRepository.findMany(whereClause, page, limit)

    return {
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Crea una nueva alerta
   */
  static async create(alertData: CreateAlertInput, session: AuthenticatedSession): Promise<AlertWithRelations> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'create_alert')) {
      throw new Error("No tienes permisos para crear alertas")
    }

    // Determinar siteId basado en el rol del usuario
    let siteId = alertData.siteId
    
    if (session.user.role === "CLIENTE_ADMIN_SEDE" || 
        session.user.role === "CLIENTE_OPERARIO" || 
        session.user.role === "TECNICO") {
      if (!session.user.siteId) {
        throw new Error("Usuario sin sede asociada")
      }
      siteId = session.user.siteId
    }

    if (!siteId) {
      throw new Error("Sede requerida para crear la alerta")
    }

    // Crear la alerta en la base de datos
    const alert = await AlertRepository.create({
      title: alertData.title,
      description: alertData.description,
      type: alertData.type,
      priority: alertData.priority,
      location: alertData.location,
      equipmentId: alertData.equipmentId,
      images: alertData.images,
      documents: alertData.documents,
      estimatedResolutionTime: alertData.estimatedResolutionTime,
      site: { connect: { id: siteId } },
      reportedBy: { connect: { id: session.user.id } }
    })

    // Enviar notificación en tiempo real
    await NotificationService.broadcastNewAlert(alert)

    return alert
  }

  /**
   * Actualiza una alerta aplicando lógica de timestamps
   */
  static async update(id: string, validatedData: UpdateAlertInput, session: AuthenticatedSession): Promise<AlertWithRelations | null> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'update_alert')) {
      throw new Error("No tienes permisos para actualizar alertas")
    }

    const whereClause = this.buildWhereClause(session, id)

    // Verificar que la alerta existe y el usuario tiene acceso
    const existingAlert = await AlertRepository.findFirst(whereClause)

    if (!existingAlert) {
      return null
    }

    // Aplicar lógica de timestamps basada en cambios de estado
    const updateData: Prisma.AlertUpdateInput = { ...validatedData }

    // Si se está asignando la alerta por primera vez
    if (validatedData.assignedToId && !existingAlert.assignedToId) {
      updateData.assignedAt = new Date()
      updateData.status = 'ASSIGNED'
    }

    // Si se está cambiando el estado a resuelto
    if (validatedData.status === 'RESOLVED' && existingAlert.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = { connect: { id: session.user.id } }
    }

    // Si se está cerrando la alerta
    if (validatedData.status === 'CLOSED' && existingAlert.status !== 'CLOSED') {
      updateData.closedAt = new Date()
    }

    // Actualizar la alerta
    const updatedAlert = await AlertRepository.update(id, updateData)

    // Enviar notificación en tiempo real
    await NotificationService.broadcastAlertUpdate(updatedAlert)
    
    return updatedAlert
  }

  /**
   * Elimina una alerta verificando permisos
   */
  static async delete(id: string, session: AuthenticatedSession): Promise<AlertWithRelations | null> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'delete_alert')) {
      throw new Error("No tienes permisos para eliminar alertas")
    }

    const whereClause = this.buildWhereClause(session, id)

    // Verificar que la alerta existe y el usuario tiene acceso
    const existingAlert = await AlertRepository.findFirst(whereClause)

    if (!existingAlert) {
      return null
    }

    return await AlertRepository.delete(id)
  }
}