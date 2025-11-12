/**
 * Time Tracking Service
 *
 * Business logic layer for work order time tracking
 * Handles validations, permissions, and business rules
 */

import { TimeTrackingRepository } from "@/server/repositories/time-tracking.repository"
import { WorkOrderRepository } from "@/server/repositories/work-order.repository"
import { validateTimeLogAction } from "@/schemas/time-tracking"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { TimeLogAction, PauseReason, Role } from "@prisma/client"
import type {
  WorkOrderTimeLog,
  WorkOrderTimeLogWithUser,
  TimeLogSummary,
  GeolocationCoordinates,
} from "@/types/time-tracking.types"

export class TimeTrackingService {
  private timeTrackingRepo: TimeTrackingRepository

  constructor() {
    this.timeTrackingRepo = new TimeTrackingRepository()
  }

  /**
   * Check if user can track time on work order
   */
  private async canUserTrackTime(
    userId: string,
    userRole: Role,
    workOrderId: string
  ): Promise<{ allowed: boolean; error?: string }> {
    // Get work order with assignments
    const workOrder = await WorkOrderRepository.findById(workOrderId)

    if (!workOrder) {
      return { allowed: false, error: "Orden de trabajo no encontrada" }
    }

    // Admins and supervisors can track time on any work order
    if (
      userRole === "SUPER_ADMIN" ||
      userRole === "ADMIN_EMPRESA" ||
      userRole === "ADMIN_GRUPO" ||
      userRole === "JEFE_MANTENIMIENTO" ||
      userRole === "SUPERVISOR"
    ) {
      return { allowed: true }
    }

    // Technicians can only track time on their assigned work orders
    if (userRole === "TECNICO") {
      const isAssigned = workOrder.assignments?.some((a) => a.userId === userId)

      if (!isAssigned) {
        return {
          allowed: false,
          error: "No está asignado a esta orden de trabajo",
        }
      }

      return { allowed: true }
    }

    // Other roles cannot track time
    return {
      allowed: false,
      error: "No tiene permisos para registrar tiempo",
    }
  }

  /**
   * Log a time action
   */
  async logTimeAction(
    session: AuthenticatedSession,
    data: {
      workOrderId: string
      action: TimeLogAction
      pauseReason?: PauseReason
      notes?: string
      location?: GeolocationCoordinates
    }
  ): Promise<{ success: boolean; data?: WorkOrderTimeLog; error?: string }> {
    const userId = session.user.id
    const userRole = session.user.role

    // Check permissions
    const permission = await this.canUserTrackTime(
      userId,
      userRole,
      data.workOrderId
    )

    if (!permission.allowed) {
      return { success: false, error: permission.error }
    }

    // Get last time log to validate action
    const lastLog = await this.timeTrackingRepo.getLastTimeLog(data.workOrderId)
    const validation = validateTimeLogAction(lastLog?.action || null, data.action)

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Validate pause reason is provided when pausing
    if (data.action === "PAUSE" && !data.pauseReason) {
      return {
        success: false,
        error: "Debe proporcionar una razón para la pausa",
      }
    }

    // Create time log
    try {
      const timeLog = await this.timeTrackingRepo.createTimeLog({
        workOrderId: data.workOrderId,
        userId,
        action: data.action,
        pauseReason: data.pauseReason,
        notes: data.notes,
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
        timestamp: new Date(),
      })

      // If action is COMPLETE, update work order metrics
      if (data.action === "COMPLETE") {
        await this.timeTrackingRepo.updateWorkOrderTimeMetrics(data.workOrderId)
      }

      return { success: true, data: timeLog }
    } catch (error) {
      console.error("Error logging time action:", error)
      return {
        success: false,
        error: "Error al registrar la acción de tiempo",
      }
    }
  }

  /**
   * Get time logs for a work order
   */
  async getTimeLogsForWorkOrder(
    session: AuthenticatedSession,
    workOrderId: string,
    options?: {
      includeUser?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<{
    success: boolean
    data?: WorkOrderTimeLog[] | WorkOrderTimeLogWithUser[]
    error?: string
  }> {
    // Check if work order exists and user has access
    const workOrder = await WorkOrderRepository.findById(workOrderId)

    if (!workOrder) {
      return { success: false, error: "Orden de trabajo no encontrada" }
    }

    // Check company access
    if (workOrder.companyId !== session.user.companyId) {
      return { success: false, error: "No tiene acceso a esta orden de trabajo" }
    }

    try {
      const logs = await this.timeTrackingRepo.getTimeLogsByWorkOrder(
        workOrderId,
        options
      )

      return { success: true, data: logs }
    } catch (error) {
      console.error("Error getting time logs:", error)
      return { success: false, error: "Error al obtener registros de tiempo" }
    }
  }

  /**
   * Get time summary for a work order
   */
  async getTimeSummary(
    session: AuthenticatedSession,
    workOrderId: string
  ): Promise<{ success: boolean; data?: TimeLogSummary; error?: string }> {
    // Check if work order exists and user has access
    const workOrder = await WorkOrderRepository.findById(workOrderId)

    if (!workOrder) {
      return { success: false, error: "Orden de trabajo no encontrada" }
    }

    // Check company access
    if (workOrder.companyId !== session.user.companyId) {
      return { success: false, error: "No tiene acceso a esta orden de trabajo" }
    }

    try {
      const summary = await this.timeTrackingRepo.getTimeSummary(workOrderId)

      return { success: true, data: summary }
    } catch (error) {
      console.error("Error getting time summary:", error)
      return { success: false, error: "Error al obtener resumen de tiempo" }
    }
  }

  /**
   * Update a time log
   */
  async updateTimeLog(
    session: AuthenticatedSession,
    id: string,
    data: {
      notes?: string
      pauseReason?: PauseReason
    }
  ): Promise<{ success: boolean; data?: WorkOrderTimeLog; error?: string }> {
    // Get the time log
    const timeLog = await this.timeTrackingRepo.getTimeLogById(id)

    if (!timeLog) {
      return { success: false, error: "Registro de tiempo no encontrado" }
    }

    // Check permissions - only the user who created it or admin can update
    if (
      timeLog.userId !== session.user.id &&
      session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "ADMIN_EMPRESA" &&
      session.user.role !== "JEFE_MANTENIMIENTO"
    ) {
      return {
        success: false,
        error: "No tiene permisos para actualizar este registro",
      }
    }

    try {
      const updated = await this.timeTrackingRepo.updateTimeLog(id, data)
      return { success: true, data: updated }
    } catch (error) {
      console.error("Error updating time log:", error)
      return { success: false, error: "Error al actualizar registro de tiempo" }
    }
  }

  /**
   * Delete a time log (admin only)
   */
  async deleteTimeLog(
    session: AuthenticatedSession,
    id: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    // Only admins can delete
    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "ADMIN_EMPRESA" &&
      session.user.role !== "JEFE_MANTENIMIENTO"
    ) {
      return {
        success: false,
        error: "No tiene permisos para eliminar registros de tiempo",
      }
    }

    // Get the time log
    const timeLog = await this.timeTrackingRepo.getTimeLogById(id)

    if (!timeLog) {
      return { success: false, error: "Registro de tiempo no encontrado" }
    }

    // Log the deletion reason (you might want to store this in an audit log)
    console.log(
      `Time log ${id} deleted by ${session.user.id}. Reason: ${reason}`
    )

    try {
      await this.timeTrackingRepo.deleteTimeLog(id)

      // Recalculate work order metrics
      await this.timeTrackingRepo.updateWorkOrderTimeMetrics(timeLog.workOrderId)

      return { success: true }
    } catch (error) {
      console.error("Error deleting time log:", error)
      return { success: false, error: "Error al eliminar registro de tiempo" }
    }
  }

  /**
   * Get active work orders for a user
   */
  async getActiveWorkOrders(
    session: AuthenticatedSession
  ): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      const activeWorkOrderIds = await this.timeTrackingRepo.getActiveWorkOrders(
        session.user.id
      )

      return { success: true, data: activeWorkOrderIds }
    } catch (error) {
      console.error("Error getting active work orders:", error)
      return {
        success: false,
        error: "Error al obtener órdenes de trabajo activas",
      }
    }
  }

  /**
   * Get current working status for a user
   */
  async getCurrentWorkingStatus(
    session: AuthenticatedSession
  ): Promise<{
    success: boolean
    data?: {
      isWorking: boolean
      workOrderId?: string
      startTime?: Date
      isPaused: boolean
    }
    error?: string
  }> {
    try {
      const activeWorkOrders = await this.timeTrackingRepo.getActiveWorkOrders(
        session.user.id
      )

      if (activeWorkOrders.length === 0) {
        return {
          success: true,
          data: {
            isWorking: false,
            isPaused: false,
          },
        }
      }

      // Get the most recent active work order
      const workOrderId = activeWorkOrders[0]
      const lastLog = await this.timeTrackingRepo.getLastTimeLog(workOrderId)

      if (!lastLog) {
        return {
          success: true,
          data: {
            isWorking: false,
            isPaused: false,
          },
        }
      }

      return {
        success: true,
        data: {
          isWorking: true,
          workOrderId,
          startTime: lastLog.timestamp,
          isPaused: lastLog.action === "PAUSE",
        },
      }
    } catch (error) {
      console.error("Error getting current working status:", error)
      return {
        success: false,
        error: "Error al obtener estado de trabajo actual",
      }
    }
  }
}
