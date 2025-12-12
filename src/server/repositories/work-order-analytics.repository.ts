/**
 * Work Order Analytics Repository
 *
 * Specialized queries for aggregated data and analytics
 * Used by AI Analytics Service to generate insights
 */

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface DateRange {
  from: Date
  to: Date
}

export interface WorkOrderAnalytics {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  avgResolutionTime: number
  slaCompliance: number
  overdueCount: number
  criticalCount: number
}

export interface SitePerformance {
  siteId: string
  siteName: string
  total: number
  completed: number
  overdue: number
  avgResolutionTime: number
  completionRate: number
}

export interface TimeseriesData {
  date: string
  total: number
  completed: number
  pending: number
  overdue: number
}

export class WorkOrderAnalyticsRepository {
  /**
   * Get comprehensive work order analytics for a company
   */
  static async getCompanyAnalytics(
    companyId: string,
    dateRange?: DateRange
  ): Promise<WorkOrderAnalytics> {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      })
    }

    // Get all work orders
    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        priority: true,
        scheduledDate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    const total = workOrders.length

    // Group by status
    const byStatus = workOrders.reduce((acc, wo) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by priority
    const byPriority = workOrders.reduce((acc, wo) => {
      acc[wo.priority] = (acc[wo.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate avg resolution time (for completed orders)
    const completedOrders = workOrders.filter(wo => wo.status === 'COMPLETED')
    const avgResolutionTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, wo) => {
          const diff = wo.updatedAt.getTime() - wo.createdAt.getTime()
          return sum + (diff / (1000 * 60 * 60)) // Convert to hours
        }, 0) / completedOrders.length
      : 0

    // Calculate SLA compliance (completed on time)
    const onTimeOrders = completedOrders.filter(wo => {
      if (!wo.scheduledDate) return true
      return wo.updatedAt <= wo.scheduledDate
    })
    const slaCompliance = completedOrders.length > 0
      ? (onTimeOrders.length / completedOrders.length) * 100
      : 100

    // Count overdue orders
    const now = new Date()
    const overdueCount = workOrders.filter(wo => {
      if (wo.status === 'COMPLETED') return false
      if (!wo.scheduledDate) return false
      return wo.scheduledDate < now
    }).length

    // Count critical orders (URGENT or HIGH priority)
    const criticalCount = workOrders.filter(wo =>
      (wo.priority === 'URGENT' || wo.priority === 'HIGH') &&
      wo.status !== 'COMPLETED'
    ).length

    return {
      total,
      byStatus,
      byPriority,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      slaCompliance: Math.round(slaCompliance * 10) / 10,
      overdueCount,
      criticalCount
    }
  }

  /**
   * Get performance metrics by site
   */
  static async getSitePerformance(
    companyId: string,
    dateRange?: DateRange
  ): Promise<SitePerformance[]> {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      })
    }

    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        createdAt: true,
        updatedAt: true,
        site: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    type WorkOrderWithSite = typeof workOrders[number]

    // Group by site
    const bySite = workOrders.reduce((acc, wo) => {
      const siteId = wo.site?.id || 'unknown'
      const siteName = wo.site?.name || 'Sin sitio'

      if (!acc[siteId]) {
        acc[siteId] = {
          siteId,
          siteName,
          orders: []
        }
      }

      acc[siteId].orders.push(wo)
      return acc
    }, {} as Record<string, { siteId: string; siteName: string; orders: WorkOrderWithSite[] }>)

    // Calculate metrics for each site
    const now = new Date()
    return Object.values(bySite).map(site => {
      const total = site.orders.length
      const completed = site.orders.filter(wo => wo.status === 'COMPLETED').length
      const overdue = site.orders.filter(wo => {
        if (wo.status === 'COMPLETED') return false
        if (!wo.scheduledDate) return false
        return wo.scheduledDate < now
      }).length

      const completedOrders = site.orders.filter(wo => wo.status === 'COMPLETED')
      const avgResolutionTime = completedOrders.length > 0
        ? completedOrders.reduce((sum, wo) => {
            const diff = wo.updatedAt.getTime() - wo.createdAt.getTime()
            return sum + (diff / (1000 * 60 * 60))
          }, 0) / completedOrders.length
        : 0

      const completionRate = total > 0 ? (completed / total) * 100 : 0

      return {
        siteId: site.siteId,
        siteName: site.siteName,
        total,
        completed,
        overdue,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10
      }
    }).sort((a, b) => b.total - a.total) // Sort by total descending
  }

  /**
   * Get timeseries data for trend analysis
   */
  static async getTimeseriesData(
    companyId: string,
    dateRange: DateRange
  ): Promise<TimeseriesData[]> {
    // This is a simplified version - in production you'd use SQL aggregation
    const workOrders = await prisma.workOrder.findMany({
      where: {
        companyId,
        isActive: true,
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      },
      select: {
        createdAt: true,
        status: true,
        scheduledDate: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group by date
    const byDate = workOrders.reduce((acc, wo) => {
      const dateKey = wo.createdAt.toISOString().split('T')[0]

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0
        }
      }

      acc[dateKey].total++

      if (wo.status === 'COMPLETED') {
        acc[dateKey].completed++
      } else {
        acc[dateKey].pending++
        if (wo.scheduledDate && wo.scheduledDate < new Date()) {
          acc[dateKey].overdue++
        }
      }

      return acc
    }, {} as Record<string, TimeseriesData>)

    return Object.values(byDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  }

  /**
   * Get common issues/patterns (for anomaly detection)
   */
  static async getCommonIssues(
    companyId: string,
    dateRange?: DateRange,
    limit: number = 10
  ) {
    // Get work orders with descriptions
    const workOrders = await prisma.workOrder.findMany({
      where: {
        companyId,
        isActive: true,
        ...(dateRange && {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        })
      },
      select: {
        title: true,
        description: true,
        status: true,
        priority: true,
        site: {
          select: {
            name: true
          }
        }
      },
      take: limit * 10 // Get more to have data for analysis
    })

    return workOrders
  }

  /**
   * Get client-specific analytics (for CLIENT_ADMIN users)
   */
  static async getClientAnalytics(
    clientCompanyId: string,
    siteId: string | null,
    dateRange?: DateRange
  ): Promise<WorkOrderAnalytics> {
    // WorkOrder doesn't have clientCompanyId directly
    // We need to filter through site relationship
    const whereClause: Prisma.WorkOrderWhereInput = {
      site: {
        clientCompanyId: clientCompanyId
      },
      ...(siteId && { siteId }), // If specific site, filter by it
      isActive: true,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      })
    }

    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        priority: true,
        scheduledDate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Same calculations as getCompanyAnalytics
    const total = workOrders.length
    const byStatus = workOrders.reduce((acc, wo) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = workOrders.reduce((acc, wo) => {
      acc[wo.priority] = (acc[wo.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const completedOrders = workOrders.filter(wo => wo.status === 'COMPLETED')
    const avgResolutionTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, wo) => {
          const diff = wo.updatedAt.getTime() - wo.createdAt.getTime()
          return sum + (diff / (1000 * 60 * 60))
        }, 0) / completedOrders.length
      : 0

    const onTimeOrders = completedOrders.filter(wo => {
      if (!wo.scheduledDate) return true
      return wo.updatedAt <= wo.scheduledDate
    })
    const slaCompliance = completedOrders.length > 0
      ? (onTimeOrders.length / completedOrders.length) * 100
      : 100

    const now = new Date()
    const overdueCount = workOrders.filter(wo => {
      if (wo.status === 'COMPLETED') return false
      if (!wo.scheduledDate) return false
      return wo.scheduledDate < now
    }).length

    const criticalCount = workOrders.filter(wo =>
      (wo.priority === 'URGENT' || wo.priority === 'HIGH') &&
      wo.status !== 'COMPLETED'
    ).length

    return {
      total,
      byStatus,
      byPriority,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      slaCompliance: Math.round(slaCompliance * 10) / 10,
      overdueCount,
      criticalCount
    }
  }
}
