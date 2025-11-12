import { InventoryMovementRepository } from "@/server/repositories/inventory-movement.repository"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  InventoryMovementWithRelations,
  InventoryMovementFilters
} from "@/types/inventory.types"

/**
 * Servicio para consulta de movimientos de inventario
 * Los movimientos se crean automáticamente por otras acciones (ajustes, transferencias, aprobaciones)
 * Este servicio es principalmente de solo lectura
 */
export class InventoryMovementService {

  /**
   * Obtener lista de movimientos de inventario con filtros
   */
  static async getList(
    session: AuthenticatedSession,
    filters: InventoryMovementFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ movements: InventoryMovementWithRelations[], total: number, page: number, limit: number }> {
    // Verificar permisos
    if (!PermissionHelper.hasPermission(session.user.role, 'VIEW_INVENTORY_MOVEMENTS')) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    const whereClause: Record<string, unknown> = {}

    if (filters.inventoryItemId) {
      whereClause.inventoryItemId = filters.inventoryItemId
    }

    if (filters.movementType) {
      whereClause.type = filters.movementType
    }

    // Filtrar por ubicación
    if (filters.locationId && filters.locationType) {
      whereClause.OR = [
        {
          fromLocationId: filters.locationId,
          fromLocationType: filters.locationType
        },
        {
          toLocationId: filters.locationId,
          toLocationType: filters.locationType
        }
      ]
    }

    // Filtrar por rango de fechas
    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {}
      if (filters.startDate) {
        (whereClause.createdAt as Record<string, unknown>).gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        (whereClause.createdAt as Record<string, unknown>).lte = new Date(filters.endDate)
      }
    }

    // Filtrar por empresa del usuario si no es superadmin
    if (session.user.role !== 'SUPER_ADMIN') {
      const companyFilter = {
        OR: [
          { fromCompanyId: session.user.companyId },
          { toCompanyId: session.user.companyId }
        ]
      }

      // Si ya hay un OR para ubicación, combinamos con AND
      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          companyFilter
        ]
        delete whereClause.OR
      } else {
        Object.assign(whereClause, companyFilter)
      }
    }

    const result = await InventoryMovementRepository.findMany(whereClause, page, limit)

    return {
      movements: result.movements,
      total: result.total,
      page,
      limit
    }
  }

  /**
   * Obtener movimiento por ID
   */
  static async getById(
    session: AuthenticatedSession,
    id: string
  ): Promise<InventoryMovementWithRelations | null> {
    // Verificar permisos
    if (!PermissionHelper.hasPermission(session.user.role, 'VIEW_INVENTORY_MOVEMENTS')) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    const movement = await InventoryMovementRepository.findById(id)

    if (!movement) {
      return null
    }

    // Verificar que pertenece a la empresa del usuario (si no es superadmin)
    if (session.user.role !== 'SUPER_ADMIN') {
      const belongsToCompany =
        movement.fromCompanyId === session.user.companyId ||
        movement.toCompanyId === session.user.companyId

      if (!belongsToCompany) {
        throw new Error("No tienes permisos para realizar esta acción")
      }
    }

    return movement
  }

  /**
   * Obtener movimientos por ítem de inventario
   */
  static async getByItem(
    session: AuthenticatedSession,
    inventoryItemId: string
  ): Promise<InventoryMovementWithRelations[]> {
    // Verificar permisos
    if (!PermissionHelper.hasPermission(session.user.role, 'VIEW_INVENTORY_MOVEMENTS')) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    const movements = await InventoryMovementRepository.findByItem(inventoryItemId)

    // Filtrar por empresa si no es superadmin
    if (session.user.role !== 'SUPER_ADMIN') {
      return movements.filter(movement =>
        movement.fromCompanyId === session.user.companyId ||
        movement.toCompanyId === session.user.companyId
      )
    }

    return movements
  }

  /**
   * Obtener movimientos por orden de trabajo
   */
  static async getByWorkOrder(
    session: AuthenticatedSession,
    workOrderId: string
  ): Promise<InventoryMovementWithRelations[]> {
    // Verificar permisos
    if (!PermissionHelper.hasPermission(session.user.role, 'VIEW_INVENTORY_MOVEMENTS')) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    return await InventoryMovementRepository.findByWorkOrder(workOrderId)
  }

  /**
   * Obtener estadísticas de movimientos por tipo
   */
  static async getStatsByType(
    session: AuthenticatedSession
  ): Promise<Record<string, number>> {
    // Verificar permisos
    if (!PermissionHelper.hasPermission(session.user.role, 'VIEW_INVENTORY_MOVEMENTS')) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    const companyId = session.user.role === 'SUPER_ADMIN' ? undefined : session.user.companyId

    return await InventoryMovementRepository.getStatsByType(companyId)
  }

  /**
   * Obtener valor total de movimientos (entradas y salidas)
   */
  static async getTotalValue(
    session: AuthenticatedSession,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{ totalIn: number, totalOut: number }> {
    // Verificar permisos
    if (!PermissionHelper.hasPermission(session.user.role, 'VIEW_INVENTORY_MOVEMENTS')) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    const companyId = session.user.role === 'SUPER_ADMIN' ? undefined : session.user.companyId

    return await InventoryMovementRepository.getTotalValue(companyId, dateFrom, dateTo)
  }
}
