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
import { MaintenanceAlertHistoryRepository } from '@/server/repositories/maintenance-alert-history.repository'
import { MaintenanceAlertSeverity, Prisma } from '@prisma/client'

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

    if (filters?.stockStatus) {
      filteredAlerts = filteredAlerts.filter((alert) => {
        // Determine stock status
        let status: 'CRITICAL' | 'LOW' | 'SUFFICIENT'
        if (alert.currentStock === 0) {
          status = 'CRITICAL'
        } else if (alert.currentStock < alert.reorderPoint) {
          status = 'LOW'
        } else {
          status = 'SUFFICIENT'
        }
        return filters.stockStatus!.includes(status)
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

  /**
   * Sync generated alerts to database history
   * Creates/updates alert records for persistence and analytics
   */
  static async syncAlertsToHistory(
    alerts: MaintenanceAlert[],
    companyId: string
  ): Promise<{
    created: number
    updated: number
    autoClosed: number
    alertHistoryIds: Map<string, string> // componentId -> alertHistoryId
  }> {
    let created = 0
    let updated = 0
    let autoClosed = 0
    const alertHistoryIds = new Map<string, string>()

    // Get all active alert IDs from generated alerts
    const activeComponentIds = new Set(alerts.map((a) => a.componentId))

    // Find currently active alerts in DB that are no longer in generated list
    const existingActiveAlerts = await prisma.maintenanceAlertHistory.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        componentId: true,
      },
    })

    // Auto-close alerts that are no longer active
    for (const existing of existingActiveAlerts) {
      if (!activeComponentIds.has(existing.componentId)) {
        await MaintenanceAlertHistoryRepository.autoClose(
          existing.id,
          'Condiciones de alerta ya no se cumplen'
        )
        autoClosed++
      }
    }

    // Upsert each alert
    for (const alert of alerts) {
      try {
        // Map severity to enum
        const severity: MaintenanceAlertSeverity =
          alert.severity === 'CRITICAL'
            ? 'CRITICAL'
            : alert.severity === 'WARNING'
            ? 'WARNING'
            : 'INFO'

        // Get asset ID from component
        const component = await prisma.explodedViewComponent.findUnique({
          where: { id: alert.componentId },
          select: {
            hotspots: {
              take: 1,
              select: {
                view: {
                  select: {
                    assetId: true,
                    asset: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        const assetId = component?.hotspots[0]?.view.assetId
        const assetName = component?.hotspots[0]?.view.asset.name || 'Unknown'

        if (!assetId) {
          console.warn(`Component ${alert.componentId} has no associated asset, skipping`)
          continue
        }

        // Check if alert already exists
        const existing = await prisma.maintenanceAlertHistory.findFirst({
          where: {
            componentId: alert.componentId,
            companyId,
            status: 'ACTIVE',
          },
        })

        // Skip if mtbf is null (shouldn't happen but type safety)
        if (!alert.mtbf) {
          console.warn(`Alert for component ${alert.componentId} has no MTBF, skipping`)
          continue
        }

        const alertData: Omit<
          Prisma.MaintenanceAlertHistoryCreateInput,
          'component' | 'company' | 'asset'
        > = {
          componentName: alert.componentName,
          assetName,
          partNumber: alert.partNumber,
          severity,
          criticality: alert.criticality,
          mtbf: alert.mtbf,
          currentOperatingHours: alert.currentOperatingHours,
          hoursUntilMaintenance: alert.hoursUntilMaintenance,
          daysUntilMaintenance: alert.daysUntilMaintenance,
          mtbfUtilization: (alert.currentOperatingHours / alert.mtbf) * 100,
          stockAvailable: alert.currentStock,
          message: alert.message,
          details: alert as unknown as Prisma.InputJsonValue,
        }

        if (existing) {
          // Update existing alert
          await MaintenanceAlertHistoryRepository.update(existing.id, alertData)
          alertHistoryIds.set(alert.componentId, existing.id)
          updated++
        } else {
          // Create new alert
          const newAlert = await MaintenanceAlertHistoryRepository.create({
            ...alertData,
            component: { connect: { id: alert.componentId } },
            company: { connect: { id: companyId } },
            asset: { connect: { id: assetId } },
          } as Prisma.MaintenanceAlertHistoryCreateInput)
          alertHistoryIds.set(alert.componentId, newAlert.id)
          created++
        }
      } catch (error) {
        console.error(
          `Failed to sync alert for component ${alert.componentId}:`,
          error
        )
      }
    }

    return { created, updated, autoClosed, alertHistoryIds }
  }

  /**
   * Generate and sync alerts (combines generation + persistence)
   */
  static async generateAndSyncAlerts(
    session: AuthenticatedSession
  ): Promise<{
    alerts: MaintenanceAlert[]
    sync: { created: number; updated: number; autoClosed: number }
    alertHistoryIds: Map<string, string>
  }> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    // Generate alerts
    const alerts = await this.generateAllAlerts(session)

    // Sync to database
    const { alertHistoryIds, ...syncStats } = await this.syncAlertsToHistory(alerts, companyId)

    return { alerts, sync: syncStats, alertHistoryIds }
  }

  /**
   * Sync alerts for all companies (used by cron job)
   */
  static async syncAlertsForAllCompanies(): Promise<{
    companiesProcessed: number
    successCount: number
    failCount: number
    results: Array<{
      companyId: string
      companyName: string
      alertsGenerated?: number
      alertsSynced?: number
      success: boolean
      error?: string
    }>
  }> {
    // Get all companies with PREDICTIVE_MAINTENANCE enabled
    const companies = await prisma.companyFeature.findMany({
      where: {
        module: 'PREDICTIVE_MAINTENANCE',
        isEnabled: true,
      },
      select: {
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const results = []

    // Process each company
    for (const { company } of companies) {
      try {
        // Create a mock session for this company
        const mockSession: AuthenticatedSession = {
          user: {
            id: 'system-cron',
            email: 'system@cron',
            companyId: company.id,
          },
        } as AuthenticatedSession

        // Generate and sync alerts
        const { alerts, alertHistoryIds } = await this.generateAndSyncAlerts(mockSession)

        results.push({
          companyId: company.id,
          companyName: company.name,
          alertsGenerated: alerts.length,
          alertsSynced: alertHistoryIds.size,
          success: true,
        })
      } catch (error) {
        console.error(`Error processing company ${company.name}:`, error)
        results.push({
          companyId: company.id,
          companyName: company.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return {
      companiesProcessed: companies.length,
      successCount,
      failCount,
      results,
    }
  }
}
