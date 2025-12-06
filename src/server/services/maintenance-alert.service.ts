/**
 * Maintenance Alert Service
 *
 * Business logic for generating and managing MTBF-based maintenance alerts.
 * Integrates with inventory and component data to predict stock needs.
 *
 * Following Next.js Expert standards:
 * - Service layer pattern
 * - Type-safe operations
 * - SOLID principles
 */

import { prisma } from '@/lib/prisma'
import type {
  MaintenanceAlert,
  MTBFAlertParams,
  PaginatedAlertsResponse,
  AlertFilters,
} from '@/types/maintenance-alert.types'
import {
  generateMTBFAlert,
  generateBulkMTBFAlerts,
  getAlertSummary,
} from '@/lib/maintenance/mtbf-alerts'
import type { AuthenticatedSession } from '@/types/auth.types'
import { getCurrentCompanyId } from '@/lib/company-context'
import { getComponentOperatingHours } from '@/lib/maintenance/operating-hours'

export class MaintenanceAlertService {
  /**
   * Generate MTBF alerts for all components with inventory
   */
  static async generateAllAlerts(
    session: AuthenticatedSession
  ): Promise<MaintenanceAlert[]> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    // Fetch all components with inventory and technical data
    const components = await prisma.explodedViewComponent.findMany({
      where: {
        companyId,
        isActive: true,
        inventoryItemId: { not: null },
        mtbf: { not: null },
      },
      include: {
        inventoryItem: {
          include: {
            stockLocations: {
              select: {
                availableQuantity: true,
              },
            },
          },
        },
      },
    })

    // Get operating hours for all components in parallel
    const operatingHoursPromises = components.map((component) =>
      getComponentOperatingHours(component.id)
    )
    const operatingHoursArray = await Promise.all(operatingHoursPromises)

    // Generate alert parameters for each component
    const alertParams: MTBFAlertParams[] = components.map((component, index) => {
      // Calculate total stock across all locations
      const totalStock =
        component.inventoryItem?.stockLocations?.reduce(
          (sum, location) => sum + location.availableQuantity,
          0
        ) || 0

      return {
        componentId: component.id,
        componentName: component.name,
        partNumber: component.partNumber,
        criticality: component.criticality,
        mtbf: component.mtbf,
        currentOperatingHours: operatingHoursArray[index],
        inventoryItemId: component.inventoryItemId,
        currentStock: totalStock,
        minimumStock: component.inventoryItem?.minStock || 0,
        reorderPoint: component.inventoryItem?.reorderPoint || 0,
        leadTime: component.inventoryItem?.leadTime || 7,
      }
    })

    // Generate alerts
    return generateBulkMTBFAlerts(alertParams)
  }

  /**
   * Get paginated alerts with filters
   */
  static async getAlerts(
    session: AuthenticatedSession,
    filters?: AlertFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedAlertsResponse> {
    // Generate all alerts
    const allAlerts = await this.generateAllAlerts(session)

    // Apply filters
    let filteredAlerts = allAlerts

    if (filters?.severity) {
      filteredAlerts = filteredAlerts.filter((alert) =>
        filters.severity!.includes(alert.severity)
      )
    }

    if (filters?.type) {
      filteredAlerts = filteredAlerts.filter((alert) =>
        filters.type!.includes(alert.type)
      )
    }

    if (filters?.criticality) {
      filteredAlerts = filteredAlerts.filter(
        (alert) =>
          alert.criticality && filters.criticality!.includes(alert.criticality)
      )
    }

    if (filters?.daysUntilMaintenance) {
      const { min, max } = filters.daysUntilMaintenance
      filteredAlerts = filteredAlerts.filter((alert) => {
        if (min !== undefined && alert.daysUntilMaintenance < min) return false
        if (max !== undefined && alert.daysUntilMaintenance > max) return false
        return true
      })
    }

    // Calculate pagination
    const total = filteredAlerts.length
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit
    const items = filteredAlerts.slice(skip, skip + limit)

    // Get summary
    const summary = getAlertSummary(filteredAlerts)

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      summary,
    }
  }

  /**
   * Get critical alerts only (for dashboard display)
   */
  static async getCriticalAlerts(
    session: AuthenticatedSession,
    limit: number = 10
  ): Promise<MaintenanceAlert[]> {
    const allAlerts = await this.generateAllAlerts(session)

    return allAlerts
      .filter((alert) => alert.severity === 'CRITICAL')
      .slice(0, limit)
  }

  /**
   * Get alerts for specific component
   */
  static async getAlertsForComponent(
    componentId: string,
    session: AuthenticatedSession
  ): Promise<MaintenanceAlert | null> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    // Fetch component with inventory
    const component = await prisma.explodedViewComponent.findFirst({
      where: {
        id: componentId,
        companyId,
        isActive: true,
      },
      include: {
        inventoryItem: {
          include: {
            stockLocations: {
              select: {
                availableQuantity: true,
              },
            },
          },
        },
      },
    })

    if (!component || !component.inventoryItem || !component.mtbf) {
      return null
    }

    // Calculate total stock
    const totalStock =
      component.inventoryItem.stockLocations?.reduce(
        (sum, location) => sum + location.availableQuantity,
        0
      ) || 0

    // Get operating hours for this component
    const currentOperatingHours = await getComponentOperatingHours(componentId)

    const params: MTBFAlertParams = {
      componentId: component.id,
      componentName: component.name,
      partNumber: component.partNumber,
      criticality: component.criticality,
      mtbf: component.mtbf,
      currentOperatingHours,
      inventoryItemId: component.inventoryItemId,
      currentStock: totalStock,
      minimumStock: component.inventoryItem.minStock || 0,
      reorderPoint: component.inventoryItem.reorderPoint || 0,
      leadTime: component.inventoryItem.leadTime || 7,
    }

    return generateMTBFAlert(params)
  }

  /**
   * Calculate and update minimum stock for component's inventory item
   */
  static async updateMinimumStockForComponent(
    componentId: string,
    session: AuthenticatedSession
  ): Promise<{ updated: boolean; newMinStock: number; message: string }> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    const component = await prisma.explodedViewComponent.findFirst({
      where: { id: componentId, companyId, isActive: true },
      include: { inventoryItem: true },
    })

    if (!component || !component.inventoryItem) {
      return {
        updated: false,
        newMinStock: 0,
        message: 'Componente no tiene item de inventario vinculado',
      }
    }

    // Calculate new minimum stock using stock calculator
    const { calculateMinimumStock } = await import(
      '@/lib/inventory/stock-calculator'
    )

    const result = calculateMinimumStock({
      criticality: component.criticality,
      mtbf: component.mtbf,
      mttr: component.mttr,
      leadTime: component.inventoryItem.leadTime || 7,
      currentStock: 0, // Not used in calculation
    })

    // Update inventory item
    await prisma.inventoryItem.update({
      where: { id: component.inventoryItem.id },
      data: {
        minStock: result.minimumStock,
        reorderPoint: result.reorderPoint,
      },
    })

    return {
      updated: true,
      newMinStock: result.minimumStock,
      message: `Stock mínimo actualizado a ${result.minimumStock} unidades`,
    }
  }

  /**
   * Bulk update minimum stock for all components
   */
  static async bulkUpdateMinimumStock(
    session: AuthenticatedSession
  ): Promise<{ updated: number; failed: number }> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    const components = await prisma.explodedViewComponent.findMany({
      where: {
        companyId,
        isActive: true,
        inventoryItemId: { not: null },
      },
      include: { inventoryItem: true },
    })

    let updated = 0
    let failed = 0

    for (const component of components) {
      try {
        await this.updateMinimumStockForComponent(component.id, session)
        updated++
      } catch (error) {
        console.error(
          `Failed to update stock for component ${component.id}:`,
          error
        )
        failed++
      }
    }

    return { updated, failed }
  }
}
