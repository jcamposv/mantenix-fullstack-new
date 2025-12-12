/**
 * Dashboard Repository
 *
 * Data access layer for dashboard aggregate queries.
 * Only contains direct Prisma operations for statistics.
 *
 * Following Next.js Expert standards:
 * - Repository pattern
 * - Type-safe operations
 * - No business logic (only data access)
 */

import { prisma } from '@/lib/prisma'

export class DashboardRepository {
  /**
   * Get work order statistics
   */
  static async getWorkOrderStats(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    // Build date filter if provided
    const dateFilter = startDate && endDate
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {}

    const [total, statusCounts, completedOrders] = await Promise.all([
      // Total work orders
      prisma.workOrder.count({
        where: {
          companyId,
          ...dateFilter,
        },
      }),

      // Count by status
      prisma.workOrder.groupBy({
        by: ['status'],
        where: {
          companyId,
          ...dateFilter,
        },
        _count: true,
      }),

      // Completed orders for avg completion time
      prisma.workOrder.findMany({
        where: {
          companyId,
          status: 'COMPLETED',
          completedAt: { not: null },
          ...dateFilter,
        },
        select: {
          createdAt: true,
          completedAt: true,
        },
      }),
    ])

    return { total, statusCounts, completedOrders }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    // Build date filter if provided
    const dateFilter = startDate && endDate
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {}

    // Alerts are filtered through Site -> ClientCompany -> tenantCompanyId
    const whereClause = {
      site: {
        clientCompany: {
          tenantCompanyId: companyId,
        },
      },
      ...dateFilter,
    }

    const [total, statusCounts, criticalCount] = await Promise.all([
      prisma.alert.count({
        where: whereClause,
      }),

      prisma.alert.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),

      prisma.alert.count({
        where: {
          ...whereClause,
          priority: 'CRITICAL',
        },
      }),
    ])

    return { total, statusCounts, criticalCount }
  }

  /**
   * Get asset statistics
   */
  static async getAssetStats(companyId: string) {
    // Assets are filtered through Site -> ClientCompany -> tenantCompanyId
    const whereClause = {
      site: {
        clientCompany: {
          tenantCompanyId: companyId,
        },
      },
    }

    const [total, statusCounts] = await Promise.all([
      prisma.asset.count({
        where: whereClause,
      }),

      prisma.asset.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),
    ])

    return { total, statusCounts }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats(companyId: string) {
    const [totalItems, items, pendingRequests] = await Promise.all([
      prisma.inventoryItem.count({
        where: { companyId },
      }),

      prisma.inventoryItem.findMany({
        where: { companyId },
        select: {
          unitCost: true,
          minStock: true,
          reorderPoint: true,
          stockLocations: {
            select: {
              availableQuantity: true,
            },
          },
        },
      }),

      prisma.workOrderInventoryRequest.count({
        where: {
          workOrder: {
            companyId,
          },
          status: 'PENDING',
        },
      }),
    ])

    return { totalItems, items, pendingRequests }
  }

  /**
   * Get attendance statistics
   */
  static async getAttendanceStats(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    // Use provided date range or default to today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const effectiveStartDate = startDate || today
    const effectiveEndDate = endDate || tomorrow

    const [todayAttendance, totalEmployees] = await Promise.all([
      prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: {
          companyId,
          checkInAt: {
            gte: effectiveStartDate,
            lt: effectiveEndDate,
          },
        },
        _count: true,
      }),

      prisma.user.count({
        where: { companyId },
      }),
    ])

    // TimeOff module not implemented yet
    const onLeave = 0

    return { todayAttendance, onLeave, totalEmployees }
  }

  /**
   * Get predictive maintenance statistics
   */
  static async getPredictiveMaintenanceStats(companyId: string) {
    const [activeAlerts, criticalComponents, upcoming7Days, upcoming30Days] =
      await Promise.all([
        prisma.maintenanceAlertHistory.count({
          where: {
            companyId,
            status: 'ACTIVE',
          },
        }),

        prisma.maintenanceAlertHistory.count({
          where: {
            companyId,
            status: 'ACTIVE',
            severity: 'CRITICAL',
          },
        }),

        prisma.maintenanceAlertHistory.count({
          where: {
            companyId,
            status: 'ACTIVE',
            daysUntilMaintenance: {
              lte: 7,
            },
          },
        }),

        prisma.maintenanceAlertHistory.count({
          where: {
            companyId,
            status: 'ACTIVE',
            daysUntilMaintenance: {
              lte: 30,
            },
          },
        }),
      ])

    return { activeAlerts, criticalComponents, upcoming7Days, upcoming30Days }
  }
}
