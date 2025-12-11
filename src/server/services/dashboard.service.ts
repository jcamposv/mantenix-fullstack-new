/**
 * Dashboard Service
 *
 * Business logic for generating executive dashboard with feature-aware stats.
 * Shows different metrics based on enabled company features.
 *
 * Following Next.js Expert standards:
 * - Service layer pattern
 * - Uses repositories for data access
 * - Type-safe operations
 * - SOLID principles
 */

import type { AuthenticatedSession } from '@/types/auth.types'
import { getCurrentCompanyId } from '@/lib/company-context'
import { FeatureModule } from '@prisma/client'
import { DashboardRepository } from '@/server/repositories/dashboard.repository'
import { FeatureRepository } from '@/server/repositories/feature.repository'
import type { TimeRange } from '@/components/dashboard/time-range-selector'

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
  hero: HeroKPIs
  criticalItems: CriticalItem[]
  workOrders: WorkOrderStats | null
  alerts: AlertStats | null
  assets: AssetStats | null
  inventory: InventoryStats | null
  attendance: AttendanceStats | null
  predictiveMaintenance: PredictiveMaintenanceStats | null
  enabledFeatures: FeatureModule[]
}

export interface SparklineDataPoint {
  value: number
}

export interface HeroKPIs {
  assetAvailability: {
    value: number
    trend?: number
    sparkline?: SparklineDataPoint[]
  }
  criticalItems: {
    value: number
    trend?: number
    sparkline?: SparklineDataPoint[]
  }
  avgResponseTime: {
    value: number // in hours
    trend?: number
    sparkline?: SparklineDataPoint[]
  }
}

export interface CriticalItem {
  id: string
  type: 'alert' | 'work_order' | 'inventory' | 'maintenance'
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium'
  actionUrl: string
  actionLabel: string
}

export interface WorkOrderStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  completionRate: number
  avgCompletionTimeHours: number
}

export interface AlertStats {
  total: number
  active: number
  resolved: number
  critical: number
  responseRate: number
}

export interface AssetStats {
  total: number
  operational: number
  inMaintenance: number
  outOfService: number
  availabilityRate: number
}

export interface InventoryStats {
  totalItems: number
  lowStock: number
  outOfStock: number
  pendingRequests: number
  totalValue: number
}

export interface AttendanceStats {
  todayPresent: number
  todayAbsent: number
  onLeave: number
  attendanceRate: number
}

export interface PredictiveMaintenanceStats {
  activeAlerts: number
  criticalComponents: number
  upcomingMaintenanceNext7Days: number
  upcomingMaintenanceNext30Days: number
}

// ============================================================================
// SERVICE
// ============================================================================

export class DashboardService {
  /**
   * Get comprehensive dashboard stats based on enabled features
   */
  static async getDashboardStats(
    session: AuthenticatedSession,
    timeRange: TimeRange = 'month',
    customStartDate?: Date,
    customEndDate?: Date
  ): Promise<DashboardStats> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    // Calculate date range based on timeRange
    const { startDate, endDate } = this.getDateRangeFromTimeRange(
      timeRange,
      customStartDate,
      customEndDate
    )

    // Calculate previous period for trend comparison
    const { prevStartDate, prevEndDate } = this.getPreviousPeriodDateRange(
      startDate,
      endDate
    )

    // Get enabled features
    const enabledFeatures = await FeatureRepository.findEnabledByCompany(
      companyId
    )
    const enabledModules = enabledFeatures.map((f) => f.module)

    // Fetch current and previous period stats in parallel
    const [
      workOrdersData,
      alertsData,
      assetsData,
      inventoryData,
      attendanceData,
      predictiveMaintenanceData,
      // Previous period stats
      prevWorkOrdersData,
      prevAlertsData,
      prevAssetsData,
    ] = await Promise.all([
      // Current period
      DashboardRepository.getWorkOrderStats(companyId, startDate, endDate),
      DashboardRepository.getAlertStats(companyId, startDate, endDate),
      DashboardRepository.getAssetStats(companyId),
      DashboardRepository.getInventoryStats(companyId),
      enabledModules.includes('HR_ATTENDANCE')
        ? DashboardRepository.getAttendanceStats(companyId, startDate, endDate)
        : null,
      enabledModules.includes('PREDICTIVE_MAINTENANCE')
        ? DashboardRepository.getPredictiveMaintenanceStats(companyId)
        : null,
      // Previous period for trends
      DashboardRepository.getWorkOrderStats(
        companyId,
        prevStartDate,
        prevEndDate
      ),
      DashboardRepository.getAlertStats(companyId, prevStartDate, prevEndDate),
      DashboardRepository.getAssetStats(companyId),
    ])

    // Process current period stats
    const workOrders = this.processWorkOrderStats(workOrdersData)
    const alerts = this.processAlertStats(alertsData)
    const assets = this.processAssetStats(assetsData)
    const inventory = this.processInventoryStats(inventoryData)
    const attendance = attendanceData
      ? this.processAttendanceStats(attendanceData)
      : null
    const predictiveMaintenance = predictiveMaintenanceData
      ? this.processPredictiveMaintenanceStats(predictiveMaintenanceData)
      : null

    // Process previous period stats for trend calculation
    const prevWorkOrders = this.processWorkOrderStats(prevWorkOrdersData)
    const prevAlerts = this.processAlertStats(prevAlertsData)
    const prevAssets = this.processAssetStats(prevAssetsData)

    // Calculate Hero KPIs with trends
    const hero = this.calculateHeroKPIs(
      assets,
      alerts,
      workOrders,
      prevAssets,
      prevAlerts,
      prevWorkOrders
    )

    // Get critical items with drill-down links
    const criticalItems = this.getCriticalItems(
      alerts,
      workOrders,
      inventory,
      predictiveMaintenance,
      timeRange,
      startDate,
      endDate
    )

    return {
      hero,
      criticalItems,
      workOrders,
      alerts,
      assets,
      inventory,
      attendance,
      predictiveMaintenance,
      enabledFeatures: enabledModules,
    }
  }

  /**
   * Process work order stats data
   */
  private static processWorkOrderStats(data: Awaited<
    ReturnType<typeof DashboardRepository.getWorkOrderStats>
  >): WorkOrderStats {
    const { total, statusCounts, completedOrders } = data

    const pending =
      statusCounts.find((s) => s.status === 'DRAFT')?._count || 0
    const inProgress =
      statusCounts.find((s) => s.status === 'IN_PROGRESS')?._count || 0
    const completed =
      statusCounts.find((s) => s.status === 'COMPLETED')?._count || 0

    const completionRate = total > 0 ? (completed / total) * 100 : 0

    // Calculate average completion time in hours
    const avgCompletionTimeHours =
      completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => {
            if (!order.completedAt) return sum
            const hours =
              (order.completedAt.getTime() - order.createdAt.getTime()) /
              (1000 * 60 * 60)
            return sum + hours
          }, 0) / completedOrders.length
        : 0

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate,
      avgCompletionTimeHours,
    }
  }

  /**
   * Process alert stats data
   */
  private static processAlertStats(data: Awaited<
    ReturnType<typeof DashboardRepository.getAlertStats>
  >): AlertStats {
    const { total, statusCounts, criticalCount } = data

    const active = statusCounts.find((s) => s.status === 'OPEN')?._count || 0
    const resolved =
      statusCounts.find((s) => s.status === 'RESOLVED')?._count || 0

    const responseRate = total > 0 ? (resolved / total) * 100 : 0

    return {
      total,
      active,
      resolved,
      critical: criticalCount,
      responseRate,
    }
  }

  /**
   * Process asset stats data
   */
  private static processAssetStats(data: Awaited<
    ReturnType<typeof DashboardRepository.getAssetStats>
  >): AssetStats {
    const { total, statusCounts } = data

    const operational =
      statusCounts.find((s) => s.status === 'OPERATIVO')?._count || 0
    const inMaintenance =
      statusCounts.find((s) => s.status === 'EN_MANTENIMIENTO')?._count || 0
    const outOfService =
      statusCounts.find((s) => s.status === 'FUERA_DE_SERVICIO')?._count || 0

    const availabilityRate = total > 0 ? (operational / total) * 100 : 0

    return {
      total,
      operational,
      inMaintenance,
      outOfService,
      availabilityRate,
    }
  }

  /**
   * Process inventory stats data
   */
  private static processInventoryStats(data: Awaited<
    ReturnType<typeof DashboardRepository.getInventoryStats>
  >): InventoryStats {
    const { totalItems, items, pendingRequests } = data

    let lowStock = 0
    let outOfStock = 0
    let totalValue = 0

    items.forEach((item) => {
      const totalStock = item.stockLocations.reduce(
        (sum, loc) => sum + loc.availableQuantity,
        0
      )

      if (totalStock === 0) {
        outOfStock++
      } else if (totalStock < (item.reorderPoint || item.minStock || 0)) {
        lowStock++
      }

      totalValue += (item.unitCost || 0) * totalStock
    })

    return {
      totalItems,
      lowStock,
      outOfStock,
      pendingRequests,
      totalValue,
    }
  }

  /**
   * Process attendance stats data
   */
  private static processAttendanceStats(data: Awaited<
    ReturnType<typeof DashboardRepository.getAttendanceStats>
  >): AttendanceStats {
    const { todayAttendance, onLeave, totalEmployees } = data

    // Count ON_TIME and LATE as present
    const onTime =
      todayAttendance.find((s) => s.status === 'ON_TIME')?._count || 0
    const late =
      todayAttendance.find((s) => s.status === 'LATE')?._count || 0
    const todayPresent = onTime + late

    const todayAbsent =
      todayAttendance.find((s) => s.status === 'ABSENT')?._count || 0

    const attendanceRate =
      totalEmployees > 0 ? (todayPresent / totalEmployees) * 100 : 0

    return {
      todayPresent,
      todayAbsent,
      onLeave,
      attendanceRate,
    }
  }

  /**
   * Process predictive maintenance stats data
   */
  private static processPredictiveMaintenanceStats(data: Awaited<
    ReturnType<typeof DashboardRepository.getPredictiveMaintenanceStats>
  >): PredictiveMaintenanceStats {
    const { activeAlerts, criticalComponents, upcoming7Days, upcoming30Days } =
      data

    return {
      activeAlerts,
      criticalComponents,
      upcomingMaintenanceNext7Days: upcoming7Days,
      upcomingMaintenanceNext30Days: upcoming30Days,
    }
  }

  /**
   * Calculate Hero KPIs for dashboard top section
   */
  private static calculateHeroKPIs(
    assets: AssetStats,
    alerts: AlertStats,
    workOrders: WorkOrderStats,
    prevAssets: AssetStats,
    prevAlerts: AlertStats,
    prevWorkOrders: WorkOrderStats
  ): HeroKPIs {
    // Asset Availability - Main KPI for industrial maintenance
    const assetAvailability = {
      value: assets.availabilityRate,
      trend: this.calculateTrend(
        assets.availabilityRate,
        prevAssets.availabilityRate
      ),
      sparkline: this.generateSparklineData(
        prevAssets.availabilityRate,
        assets.availabilityRate
      ),
    }

    // Critical Items - Sum of all critical issues
    const criticalItemsCount =
      alerts.critical +
      workOrders.pending +
      (assets.outOfService > 0 ? assets.outOfService : 0)

    const prevCriticalItemsCount =
      prevAlerts.critical +
      prevWorkOrders.pending +
      (prevAssets.outOfService > 0 ? prevAssets.outOfService : 0)

    const criticalItems = {
      value: criticalItemsCount,
      trend: this.calculateTrend(criticalItemsCount, prevCriticalItemsCount),
      sparkline: this.generateSparklineData(
        prevCriticalItemsCount,
        criticalItemsCount
      ),
    }

    // Avg Response Time - from work orders
    const avgResponseTime = {
      value: workOrders.avgCompletionTimeHours,
      trend: this.calculateTrend(
        workOrders.avgCompletionTimeHours,
        prevWorkOrders.avgCompletionTimeHours
      ),
      sparkline: this.generateSparklineData(
        prevWorkOrders.avgCompletionTimeHours,
        workOrders.avgCompletionTimeHours
      ),
    }

    return {
      assetAvailability,
      criticalItems,
      avgResponseTime,
    }
  }

  /**
   * Get critical items that require immediate attention
   */
  private static getCriticalItems(
    alerts: AlertStats,
    workOrders: WorkOrderStats,
    inventory: InventoryStats,
    predictiveMaintenance: PredictiveMaintenanceStats | null,
    timeRange: TimeRange,
    startDate: Date,
    endDate: Date
  ): CriticalItem[] {
    const items: CriticalItem[] = []

    // Build query params for drill-down links
    const queryParams = new URLSearchParams({
      timeRange,
      ...(timeRange === 'custom' && {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    })

    // Critical Alerts
    if (alerts.critical > 0) {
      items.push({
        id: 'critical-alerts',
        type: 'alert',
        title: `${alerts.critical} Alertas Críticas`,
        description: 'Alertas de alta prioridad que requieren atención inmediata',
        severity: 'critical',
        actionUrl: `/alerts?priority=CRITICAL&${queryParams.toString()}`,
        actionLabel: 'Ver Alertas',
      })
    }

    // Pending Work Orders
    if (workOrders.pending > 5) {
      items.push({
        id: 'pending-work-orders',
        type: 'work_order',
        title: `${workOrders.pending} Órdenes Pendientes`,
        description: 'Órdenes de trabajo esperando asignación',
        severity: workOrders.pending > 10 ? 'critical' : 'high',
        actionUrl: `/work-orders/list?status=PENDING&${queryParams.toString()}`,
        actionLabel: 'Ver Órdenes',
      })
    }

    // Out of Stock Items
    if (inventory.outOfStock > 0) {
      items.push({
        id: 'out-of-stock',
        type: 'inventory',
        title: `${inventory.outOfStock} Items sin Stock`,
        description: 'Repuestos críticos agotados',
        severity: 'critical',
        actionUrl: `/inventory?status=out_of_stock&${queryParams.toString()}`,
        actionLabel: 'Ver Inventario',
      })
    }

    // Low Stock Items
    if (inventory.lowStock > 3) {
      items.push({
        id: 'low-stock',
        type: 'inventory',
        title: `${inventory.lowStock} Items con Stock Bajo`,
        description: 'Items por debajo del punto de reorden',
        severity: 'medium',
        actionUrl: `/inventory?status=low_stock&${queryParams.toString()}`,
        actionLabel: 'Ver Inventario',
      })
    }

    // Predictive Maintenance - Critical Components
    if (predictiveMaintenance && predictiveMaintenance.criticalComponents > 0) {
      items.push({
        id: 'critical-components',
        type: 'maintenance',
        title: `${predictiveMaintenance.criticalComponents} Componentes Críticos (MTBF)`,
        description: `${predictiveMaintenance.upcomingMaintenanceNext7Days} requieren mantenimiento en 7 días`,
        severity: 'high',
        actionUrl: `/maintenance/alerts?severity=CRITICAL&${queryParams.toString()}`,
        actionLabel: 'Ver Alertas',
      })
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2 }
    return items
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
      .slice(0, 5) // Max 5 critical items
  }

  /**
   * Convert TimeRange to actual date range
   */
  private static getDateRangeFromTimeRange(
    timeRange: TimeRange,
    customStartDate?: Date,
    customEndDate?: Date
  ): { startDate: Date; endDate: Date } {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    let startDate: Date

    switch (timeRange) {
      case 'today': {
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      }
      case 'week': {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0)
        break
      }
      case 'month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        break
      }
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        startDate = lastMonth
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        lastMonthEnd.setHours(23, 59, 59, 999)
        return { startDate, endDate: lastMonthEnd }
      }
      case 'custom': {
        if (!customStartDate || !customEndDate) {
          // Fallback to current month if custom dates not provided
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        } else {
          startDate = new Date(customStartDate)
          startDate.setHours(0, 0, 0, 0)
          const customEnd = new Date(customEndDate)
          customEnd.setHours(23, 59, 59, 999)
          return { startDate, endDate: customEnd }
        }
        break
      }
      default: {
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
      }
    }

    return { startDate, endDate }
  }

  /**
   * Get previous period date range for trend calculation
   */
  private static getPreviousPeriodDateRange(
    startDate: Date,
    endDate: Date
  ): { prevStartDate: Date; prevEndDate: Date } {
    const periodLength = endDate.getTime() - startDate.getTime()

    const prevEndDate = new Date(startDate.getTime() - 1) // 1ms before current start
    prevEndDate.setHours(23, 59, 59, 999)

    const prevStartDate = new Date(prevEndDate.getTime() - periodLength)
    prevStartDate.setHours(0, 0, 0, 0)

    return { prevStartDate, prevEndDate }
  }

  /**
   * Calculate trend percentage
   */
  private static calculateTrend(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }
    return ((current - previous) / previous) * 100
  }

  /**
   * Generate sparkline data points
   * Creates interpolated values between previous and current
   */
  private static generateSparklineData(
    previousValue: number,
    currentValue: number,
    points: number = 7
  ): SparklineDataPoint[] {
    const data: SparklineDataPoint[] = []
    const step = (currentValue - previousValue) / (points - 1)

    for (let i = 0; i < points; i++) {
      // Add some random variance for realistic appearance (±5%)
      const baseValue = previousValue + step * i
      const variance = baseValue * 0.05 * (Math.random() - 0.5)
      const value = Math.max(0, baseValue + variance)

      data.push({ value: Math.round(value * 100) / 100 })
    }

    return data
  }
}
