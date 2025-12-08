/**
 * Repository: MaintenanceAlertHistory
 *
 * Handles all database operations for maintenance alert history.
 * Following Next.js Expert standards:
 * - Repository pattern for data access
 * - Type-safe Prisma queries
 * - Separation of concerns
 */

import { Prisma, MaintenanceAlertStatus, MaintenanceAlertSeverity } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Extended type with relations
 */
export type MaintenanceAlertHistoryWithRelations = Prisma.MaintenanceAlertHistoryGetPayload<{
  include: {
    component: {
      select: {
        id: true
        name: true
        partNumber: true
        criticality: true
      }
    }
    asset: {
      select: {
        id: true
        name: true
        code: true
      }
    }
    resolvedBy: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    dismissedBy: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    workOrder: {
      select: {
        id: true
        number: true
        title: true
        status: true
      }
    }
  }
}>

/**
 * Query options for filtering
 */
export interface MaintenanceAlertHistoryQueryOptions {
  companyId: string
  startDate?: Date
  endDate?: Date
  status?: MaintenanceAlertStatus
  severity?: MaintenanceAlertSeverity
  componentId?: string
  assetId?: string
  page?: number
  limit?: number
}

/**
 * Analytics summary data
 */
export interface AlertAnalyticsSummary {
  totalAlerts: number
  critical: number
  warnings: number
  info: number
  byCriticality: {
    A: number
    B: number
    C: number
  }
  topComponents: Array<{
    componentId: string
    componentName: string
    partNumber: string | null
    criticality: string | null
    alertCount: number
  }>
}

/**
 * Trends data point
 */
export interface TrendDataPoint {
  date: string
  critical: number
  warnings: number
  info: number
  total: number
}

/**
 * MaintenanceAlertHistory Repository
 */
export class MaintenanceAlertHistoryRepository {
  /**
   * Find alert by ID
   */
  static async findById(id: string): Promise<MaintenanceAlertHistoryWithRelations | null> {
    return await prisma.maintenanceAlertHistory.findUnique({
      where: { id },
      include: {
        component: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            criticality: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dismissedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            number: true,
            title: true,
            status: true,
          },
        },
      },
    })
  }

  /**
   * Find many alerts with filtering and pagination
   */
  static async findMany(
    options: MaintenanceAlertHistoryQueryOptions
  ): Promise<{ items: MaintenanceAlertHistoryWithRelations[]; total: number }> {
    const {
      companyId,
      startDate,
      endDate,
      status,
      severity,
      componentId,
      assetId,
      page = 1,
      limit = 50,
    } = options

    const offset = (page - 1) * limit

    // Build where clause
    const where: Prisma.MaintenanceAlertHistoryWhereInput = {
      companyId,
      ...(status && { status }),
      ...(severity && { severity }),
      ...(componentId && { componentId }),
      ...(assetId && { assetId }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceAlertHistory.findMany({
        where,
        include: {
          component: {
            select: {
              id: true,
              name: true,
              partNumber: true,
              criticality: true,
            },
          },
          asset: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          dismissedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          workOrder: {
            select: {
              id: true,
              number: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.maintenanceAlertHistory.count({ where }),
    ])

    return { items, total }
  }

  /**
   * Create new alert
   */
  static async create(
    data: Prisma.MaintenanceAlertHistoryCreateInput
  ): Promise<MaintenanceAlertHistoryWithRelations> {
    return await prisma.maintenanceAlertHistory.create({
      data,
      include: {
        component: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            criticality: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dismissedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            number: true,
            title: true,
            status: true,
          },
        },
      },
    })
  }

  /**
   * Update alert status
   */
  static async update(
    id: string,
    data: Prisma.MaintenanceAlertHistoryUpdateInput
  ): Promise<MaintenanceAlertHistoryWithRelations> {
    return await prisma.maintenanceAlertHistory.update({
      where: { id },
      data,
      include: {
        component: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            criticality: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dismissedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            number: true,
            title: true,
            status: true,
          },
        },
      },
    })
  }

  /**
   * Get analytics summary
   */
  static async getAnalyticsSummary(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AlertAnalyticsSummary> {
    const where: Prisma.MaintenanceAlertHistoryWhereInput = {
      companyId,
      status: 'ACTIVE', // Only count active alerts
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    }

    // Get all active alerts
    const alerts = await prisma.maintenanceAlertHistory.findMany({
      where,
      select: {
        id: true,
        severity: true,
        criticality: true,
        componentId: true,
        componentName: true,
        partNumber: true,
      },
    })

    // Calculate metrics
    const totalAlerts = alerts.length
    const critical = alerts.filter((a) => a.severity === 'CRITICAL').length
    const warnings = alerts.filter((a) => a.severity === 'WARNING').length
    const info = alerts.filter((a) => a.severity === 'INFO').length

    // Count by criticality
    const byCriticality = {
      A: alerts.filter((a) => a.criticality === 'A').length,
      B: alerts.filter((a) => a.criticality === 'B').length,
      C: alerts.filter((a) => a.criticality === 'C').length,
    }

    // Get top components
    const componentMap = new Map<
      string,
      { componentName: string; partNumber: string | null; criticality: string | null; count: number }
    >()

    alerts.forEach((alert) => {
      const existing = componentMap.get(alert.componentId)
      if (existing) {
        existing.count += 1
      } else {
        componentMap.set(alert.componentId, {
          componentName: alert.componentName,
          partNumber: alert.partNumber,
          criticality: alert.criticality,
          count: 1,
        })
      }
    })

    const topComponents = Array.from(componentMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([componentId, data]) => ({
        componentId,
        componentName: data.componentName,
        partNumber: data.partNumber,
        criticality: data.criticality,
        alertCount: data.count,
      }))

    return {
      totalAlerts,
      critical,
      warnings,
      info,
      byCriticality,
      topComponents,
    }
  }

  /**
   * Get trends data for charts
   */
  static async getTrendsData(
    companyId: string,
    days: number
  ): Promise<TrendDataPoint[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Group by date
    const alerts = await prisma.maintenanceAlertHistory.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        severity: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Build data points for each day
    const dataMap = new Map<string, TrendDataPoint>()

    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]!

      dataMap.set(dateStr, {
        date: dateStr,
        critical: 0,
        warnings: 0,
        info: 0,
        total: 0,
      })
    }

    // Count alerts by date and severity
    alerts.forEach((alert) => {
      const dateStr = alert.createdAt.toISOString().split('T')[0]!
      const dataPoint = dataMap.get(dateStr)

      if (dataPoint) {
        if (alert.severity === 'CRITICAL') dataPoint.critical += 1
        if (alert.severity === 'WARNING') dataPoint.warnings += 1
        if (alert.severity === 'INFO') dataPoint.info += 1
        dataPoint.total += 1
      }
    })

    return Array.from(dataMap.values())
  }

  /**
   * Upsert alert (create if not exists, update if exists)
   * Used to sync current alerts with historical records
   */
  static async upsertByComponent(
    componentId: string,
    companyId: string,
    data: Omit<Prisma.MaintenanceAlertHistoryCreateInput, 'component' | 'company'>
  ): Promise<MaintenanceAlertHistoryWithRelations> {
    // Check if active alert exists for this component
    const existing = await prisma.maintenanceAlertHistory.findFirst({
      where: {
        componentId,
        companyId,
        status: 'ACTIVE',
      },
    })

    if (existing) {
      // Update existing alert
      return await this.update(existing.id, data as Prisma.MaintenanceAlertHistoryUpdateInput)
    } else {
      // Create new alert
      return await this.create({
        ...data,
        component: { connect: { id: componentId } },
        company: { connect: { id: companyId } },
      } as Prisma.MaintenanceAlertHistoryCreateInput)
    }
  }

  /**
   * Mark alert as resolved
   */
  static async resolve(
    id: string,
    userId: string,
    workOrderId: string | null,
    notes?: string
  ): Promise<MaintenanceAlertHistoryWithRelations> {
    return await this.update(id, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: { connect: { id: userId } },
      ...(workOrderId && { workOrder: { connect: { id: workOrderId } } }),
      resolutionNotes: notes,
    })
  }

  /**
   * Mark alert as dismissed
   */
  static async dismiss(
    id: string,
    userId: string,
    reason?: string
  ): Promise<MaintenanceAlertHistoryWithRelations> {
    return await this.update(id, {
      status: 'DISMISSED',
      dismissedAt: new Date(),
      dismissedBy: { connect: { id: userId } },
      dismissalReason: reason,
    })
  }

  /**
   * Auto-close alerts that no longer meet conditions
   */
  static async autoClose(id: string, reason: string): Promise<MaintenanceAlertHistoryWithRelations> {
    return await this.update(id, {
      status: 'AUTO_CLOSED',
      autoClosedAt: new Date(),
      autoClosureReason: reason,
    })
  }
}
