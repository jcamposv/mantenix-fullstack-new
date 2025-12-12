/**
 * Analytics Repository
 *
 * Specialized repository for KPI calculations and analytics queries
 * Implements CMMS best practices for maintenance metrics
 */

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import type {
  AnalyticsFilters,
  AssetReliabilityMetrics,
  AssetReliabilitySummary,
  MaintenancePerformanceMetrics,
  CostMetrics,
  CostBySite,
  CostByAsset,
  TeamUtilizationMetrics,
  TimeseriesDataPoint,
  SitePerformanceMetrics,
} from "@/types/analytics.types"

export class AnalyticsRepository {
  // ============================================================================
  // ASSET RELIABILITY METRICS (MTBF, MTTR, Availability, OEE)
  // ============================================================================

  /**
   * Calculate comprehensive asset reliability metrics
   * MTBF = Mean Time Between Failures
   * MTTR = Mean Time To Repair
   * Availability = (Uptime / (Uptime + Downtime)) * 100
   * OEE = Overall Equipment Effectiveness
   */
  static async getAssetReliabilityMetrics(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<AssetReliabilitySummary> {
    // Build base where clause
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      assetId: { not: null }, // Only work orders with assets
      ...(filters?.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.assetId && { assetId: filters.assetId }),
      ...(filters?.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    // Get all work orders with asset information
    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        assetId: true,
        type: true,
        status: true,
        priority: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        actualDuration: true,
        actualCost: true,
        estimatedCost: true,
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Group work orders by asset
    const assetWorkOrdersMap = new Map<
      string,
      typeof workOrders
    >()

    workOrders.forEach((wo) => {
      if (!wo.assetId) return
      if (!assetWorkOrdersMap.has(wo.assetId)) {
        assetWorkOrdersMap.set(wo.assetId, [])
      }
      assetWorkOrdersMap.get(wo.assetId)!.push(wo)
    })

    // Calculate metrics for each asset
    const assetMetrics: AssetReliabilityMetrics[] = []

    for (const [assetId, assetWOs] of assetWorkOrdersMap.entries()) {
      const asset = assetWOs[0].asset
      if (!asset) continue

      // Count failures (corrective maintenance)
      const failures = assetWOs.filter((wo) => wo.type === "CORRECTIVO")
      const totalFailures = failures.length
      const criticalFailures = failures.filter(
        (wo) => wo.priority === "URGENT" || wo.priority === "HIGH"
      ).length

      // Count maintenances by type
      const preventiveMaintenances = assetWOs.filter(
        (wo) => wo.type === "PREVENTIVO"
      ).length
      const correctiveMaintenances = assetWOs.filter(
        (wo) => wo.type === "CORRECTIVO"
      ).length

      // Calculate total downtime (sum of actual durations for corrective maintenance)
      const totalDowntimeMinutes = assetWOs
        .filter((wo) => wo.type === "CORRECTIVO" && wo.actualDuration)
        .reduce((sum, wo) => sum + (wo.actualDuration || 0), 0)
      const totalDowntime = totalDowntimeMinutes / 60 // Convert to hours

      // Calculate MTBF (Mean Time Between Failures)
      // MTBF = Total Operating Time / Number of Failures
      // For simplicity, we use the date range as operating time
      let mtbf = 0
      if (totalFailures > 0 && filters?.dateRange) {
        const totalHours =
          (filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) /
          (1000 * 60 * 60)
        mtbf = totalHours / totalFailures
      }

      // Calculate MTTR (Mean Time To Repair)
      // MTTR = Average time to complete corrective maintenance
      const completedCorrectiveWOs = assetWOs.filter(
        (wo) =>
          wo.type === "CORRECTIVO" &&
          wo.status === "COMPLETED" &&
          wo.startedAt &&
          wo.completedAt
      )
      let mttr = 0
      if (completedCorrectiveWOs.length > 0) {
        const totalRepairTime = completedCorrectiveWOs.reduce((sum, wo) => {
          const start = new Date(wo.startedAt!).getTime()
          const end = new Date(wo.completedAt!).getTime()
          return sum + (end - start) / (1000 * 60 * 60) // Convert to hours
        }, 0)
        mttr = totalRepairTime / completedCorrectiveWOs.length
      }

      // Calculate Availability
      // Availability = (Uptime / (Uptime + Downtime)) * 100
      const availability =
        filters?.dateRange
          ? (() => {
              const totalHours =
                (filters.dateRange.to.getTime() -
                  filters.dateRange.from.getTime()) /
                (1000 * 60 * 60)
              const uptime = totalHours - totalDowntime
              return (uptime / totalHours) * 100
            })()
          : 0

      // Calculate OEE (simplified version)
      // OEE = Availability × Performance × Quality
      // For now, we use a simplified formula based on availability and completion rate
      const completedWOs = assetWOs.filter((wo) => wo.status === "COMPLETED").length
      const qualityFactor = assetWOs.length > 0 ? completedWOs / assetWOs.length : 0
      const oee = availability * qualityFactor

      // Calculate failure rate (failures per month)
      const failureRate =
        filters?.dateRange
          ? (() => {
              const daysInPeriod =
                (filters.dateRange.to.getTime() -
                  filters.dateRange.from.getTime()) /
                (1000 * 60 * 60 * 24)
              const monthsInPeriod = daysInPeriod / 30
              return monthsInPeriod > 0 ? totalFailures / monthsInPeriod : 0
            })()
          : 0

      // Calculate uptime
      const totalUptime =
        filters?.dateRange
          ? (filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) /
              (1000 * 60 * 60) -
            totalDowntime
          : 0

      // Calculate costs
      const totalMaintenanceCost = assetWOs.reduce((sum, wo) => {
        const cost = wo.actualCost || wo.estimatedCost || 0
        return sum + cost
      }, 0)

      const averageCostPerMaintenance =
        assetWOs.length > 0 ? totalMaintenanceCost / assetWOs.length : 0

      assetMetrics.push({
        assetId,
        assetName: asset.name,
        assetCode: asset.code,
        mtbf: Math.round(mtbf * 10) / 10,
        mttr: Math.round(mttr * 10) / 10,
        availability: Math.round(availability * 10) / 10,
        oee: Math.round(oee * 10) / 10,
        totalFailures,
        criticalFailures,
        failureRate: Math.round(failureRate * 10) / 10,
        totalMaintenances: assetWOs.length,
        preventiveMaintenances,
        correctiveMaintenances,
        totalDowntime: Math.round(totalDowntime * 10) / 10,
        totalUptime: Math.round(totalUptime * 10) / 10,
        totalMaintenanceCost,
        averageCostPerMaintenance,
      })
    }

    // Calculate overall averages
    const overall = {
      avgMtbf:
        assetMetrics.length > 0
          ? assetMetrics.reduce((sum, m) => sum + m.mtbf, 0) / assetMetrics.length
          : 0,
      avgMttr:
        assetMetrics.length > 0
          ? assetMetrics.reduce((sum, m) => sum + m.mttr, 0) / assetMetrics.length
          : 0,
      avgAvailability:
        assetMetrics.length > 0
          ? assetMetrics.reduce((sum, m) => sum + m.availability, 0) /
            assetMetrics.length
          : 0,
      avgOee:
        assetMetrics.length > 0
          ? assetMetrics.reduce((sum, m) => sum + m.oee, 0) / assetMetrics.length
          : 0,
      totalDowntime: assetMetrics.reduce((sum, m) => sum + m.totalDowntime, 0),
    }

    return {
      assets: assetMetrics.sort((a, b) => b.availability - a.availability),
      overall: {
        avgMtbf: Math.round(overall.avgMtbf * 10) / 10,
        avgMttr: Math.round(overall.avgMttr * 10) / 10,
        avgAvailability: Math.round(overall.avgAvailability * 10) / 10,
        avgOee: Math.round(overall.avgOee * 10) / 10,
        totalDowntime: Math.round(overall.totalDowntime * 10) / 10,
      },
    }
  }

  // ============================================================================
  // MAINTENANCE PERFORMANCE METRICS
  // ============================================================================

  /**
   * Calculate comprehensive maintenance performance metrics
   */
  static async getMaintenancePerformanceMetrics(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<MaintenancePerformanceMetrics> {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      ...(filters?.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.assetId && { assetId: filters.assetId }),
      ...(filters?.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    // Get all work orders
    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        priority: true,
        status: true,
        scheduledDate: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        actualDuration: true,
        assignments: {
          select: {
            assignedAt: true,
          },
          orderBy: {
            assignedAt: "asc",
          },
          take: 1,
        },
      },
    })

    const total = workOrders.length
    const completed = workOrders.filter((wo) => wo.status === "COMPLETED").length
    const inProgress = workOrders.filter((wo) => wo.status === "IN_PROGRESS").length
    const overdue = workOrders.filter((wo) => {
      if (wo.status === "COMPLETED" || wo.status === "CANCELLED") return false
      if (!wo.scheduledDate) return false
      return new Date(wo.scheduledDate) < new Date()
    }).length
    const cancelled = workOrders.filter((wo) => wo.status === "CANCELLED").length

    // Calculate completion rate
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    // Calculate on-time completion rate
    const completedOnTime = workOrders.filter((wo) => {
      if (wo.status !== "COMPLETED") return false
      if (!wo.scheduledDate || !wo.completedAt) return true // No schedule = on time
      return new Date(wo.completedAt) <= new Date(wo.scheduledDate)
    }).length
    const onTimeCompletionRate = completed > 0 ? (completedOnTime / completed) * 100 : 0

    // Count by type
    const preventiveCount = workOrders.filter(
      (wo) => wo.type === "PREVENTIVO"
    ).length
    const correctiveCount = workOrders.filter(
      (wo) => wo.type === "CORRECTIVO"
    ).length
    const repairCount = workOrders.filter((wo) => wo.type === "REPARACION").length
    const preventivePercentage = total > 0 ? (preventiveCount / total) * 100 : 0

    // PM Compliance (for preventive maintenance)
    const pmScheduled = await prisma.workOrderSchedule.count({
      where: {
        companyId,
        isActive: true,
        ...(filters?.dateRange && {
          lastGeneratedAt: {
            gte: filters.dateRange.from,
            lte: filters.dateRange.to,
          },
        }),
      },
    })

    const pmCompleted = workOrders.filter(
      (wo) => wo.type === "PREVENTIVO" && wo.status === "COMPLETED"
    ).length
    const pmComplianceRate = pmScheduled > 0 ? (pmCompleted / pmScheduled) * 100 : 100

    // Backlog metrics (pending + assigned)
    const backlog = workOrders.filter(
      (wo) => wo.status === "DRAFT" || wo.status === "ASSIGNED"
    )
    const backlogCount = backlog.length
    const backlogAge =
      backlog.length > 0
        ? backlog.reduce((sum, wo) => {
            const ageInDays =
              (new Date().getTime() - new Date(wo.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
            return sum + ageInDays
          }, 0) / backlog.length
        : 0
    const criticalBacklog = backlog.filter(
      (wo) => wo.priority === "URGENT" || wo.priority === "HIGH"
    ).length

    // Calculate average response time (creation to assignment)
    const assignedWOs = workOrders.filter(
      (wo) => wo.assignments && wo.assignments.length > 0
    )
    const avgResponseTime =
      assignedWOs.length > 0
        ? assignedWOs.reduce((sum, wo) => {
            const createdAt = new Date(wo.createdAt).getTime()
            const assignedAt = new Date(wo.assignments[0].assignedAt).getTime()
            const responseTime = (assignedAt - createdAt) / (1000 * 60 * 60) // Hours
            return sum + responseTime
          }, 0) / assignedWOs.length
        : 0

    // Calculate average completion time (actual work time, not wall clock)
    const completedWOs = workOrders.filter(
      (wo) => wo.status === "COMPLETED" && wo.actualDuration != null
    )
    const avgCompletionTime =
      completedWOs.length > 0
        ? completedWOs.reduce((sum, wo) => {
            // Use actualDuration (minutes) converted to hours for accurate work time
            const completionTime = (wo.actualDuration || 0) / 60 // Convert minutes to hours
            return sum + completionTime
          }, 0) / completedWOs.length
        : 0

    // Count by priority
    const urgentCount = workOrders.filter((wo) => wo.priority === "URGENT").length
    const highCount = workOrders.filter((wo) => wo.priority === "HIGH").length
    const mediumCount = workOrders.filter((wo) => wo.priority === "MEDIUM").length
    const lowCount = workOrders.filter((wo) => wo.priority === "LOW").length

    return {
      totalWorkOrders: total,
      completedWorkOrders: completed,
      inProgressWorkOrders: inProgress,
      overdueWorkOrders: overdue,
      cancelledWorkOrders: cancelled,
      completionRate: Math.round(completionRate * 10) / 10,
      onTimeCompletionRate: Math.round(onTimeCompletionRate * 10) / 10,
      preventiveCount,
      correctiveCount,
      repairCount,
      preventivePercentage: Math.round(preventivePercentage * 10) / 10,
      pmScheduled,
      pmCompleted,
      pmComplianceRate: Math.round(pmComplianceRate * 10) / 10,
      backlogCount,
      backlogAge: Math.round(backlogAge * 10) / 10,
      criticalBacklog,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
    }
  }

  // ============================================================================
  // COST ANALYTICS
  // ============================================================================

  /**
   * Calculate comprehensive cost metrics
   */
  static async getCostMetrics(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<CostMetrics> {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      ...(filters?.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.assetId && { assetId: filters.assetId }),
      ...(filters?.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    // Get all work orders with cost information
    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        priority: true,
        actualCost: true,
        estimatedCost: true,
        laborCost: true,
        partsCost: true,
        otherCosts: true,
        actualDuration: true,
      },
    })

    // Calculate total maintenance cost
    const totalMaintenanceCost = workOrders.reduce((sum, wo) => {
      const cost = wo.actualCost || wo.estimatedCost || 0
      return sum + cost
    }, 0)

    // Calculate total labor and parts cost from actual data
    const totalLaborCost = workOrders.reduce((sum, wo) => {
      return sum + (wo.laborCost || 0)
    }, 0)

    const totalPartsCost = workOrders.reduce((sum, wo) => {
      return sum + (wo.partsCost || 0)
    }, 0)

    // Estimate downtime cost (assuming $100/hour of downtime)
    const DOWNTIME_COST_PER_HOUR = 100
    const totalDowntimeHours = workOrders.reduce((sum, wo) => {
      if (wo.actualDuration) {
        return sum + wo.actualDuration / 60 // Convert minutes to hours
      }
      return sum
    }, 0)
    const totalDowntimeCost = totalDowntimeHours * DOWNTIME_COST_PER_HOUR

    // Calculate averages
    const avgCostPerWorkOrder =
      workOrders.length > 0 ? totalMaintenanceCost / workOrders.length : 0

    // Avg cost per asset (need to count unique assets)
    const uniqueAssetIds = new Set(
      (
        await prisma.workOrder.findMany({
          where: whereClause,
          select: { assetId: true },
        })
      )
        .filter((wo) => wo.assetId)
        .map((wo) => wo.assetId!)
    )
    const avgCostPerAsset =
      uniqueAssetIds.size > 0 ? totalMaintenanceCost / uniqueAssetIds.size : 0

    // Avg cost per hour of work
    const avgCostPerHour =
      totalDowntimeHours > 0 ? totalMaintenanceCost / totalDowntimeHours : 0

    // Cost by type
    const preventiveCost = workOrders
      .filter((wo) => wo.type === "PREVENTIVO")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    const correctiveCost = workOrders
      .filter((wo) => wo.type === "CORRECTIVO")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    const repairCost = workOrders
      .filter((wo) => wo.type === "REPARACION")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    // Cost by priority
    const urgentCost = workOrders
      .filter((wo) => wo.priority === "URGENT")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    const highCost = workOrders
      .filter((wo) => wo.priority === "HIGH")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    const mediumCost = workOrders
      .filter((wo) => wo.priority === "MEDIUM")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    const lowCost = workOrders
      .filter((wo) => wo.priority === "LOW")
      .reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0)

    // Calculate ROI (simplified)
    // ROI = (Savings from preventive maintenance) / (Cost of preventive maintenance)
    // Assumption: Each preventive maintenance prevents 2x its cost in corrective repairs
    const preventiveSavings = preventiveCost * 2
    const preventiveMaintenanceROI =
      preventiveCost > 0 ? (preventiveSavings / preventiveCost) * 100 : 0

    const estimatedSavings = preventiveSavings - preventiveCost

    return {
      totalMaintenanceCost,
      totalLaborCost,
      totalPartsCost,
      totalDowntimeCost,
      avgCostPerWorkOrder: Math.round(avgCostPerWorkOrder * 100) / 100,
      avgCostPerAsset: Math.round(avgCostPerAsset * 100) / 100,
      avgCostPerHour: Math.round(avgCostPerHour * 100) / 100,
      preventiveCost,
      correctiveCost,
      repairCost,
      urgentCost,
      highCost,
      mediumCost,
      lowCost,
      preventiveMaintenanceROI: Math.round(preventiveMaintenanceROI * 10) / 10,
      estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    }
  }

  /**
   * Get cost breakdown by site
   */
  static async getCostBySite(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<CostBySite[]> {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      siteId: { not: null },
      ...(filters?.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        siteId: true,
        actualCost: true,
        estimatedCost: true,
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Group by site
    const siteMap = new Map<
      string,
      { siteName: string; totalCost: number; count: number }
    >()

    workOrders.forEach((wo) => {
      if (!wo.siteId || !wo.site) return

      const cost = wo.actualCost || wo.estimatedCost || 0
      if (!siteMap.has(wo.siteId)) {
        siteMap.set(wo.siteId, { siteName: wo.site.name, totalCost: 0, count: 0 })
      }

      const siteData = siteMap.get(wo.siteId)!
      siteData.totalCost += cost
      siteData.count += 1
    })

    // Convert to array and calculate averages
    return Array.from(siteMap.entries())
      .map(([siteId, data]) => ({
        siteId,
        siteName: data.siteName,
        totalCost: Math.round(data.totalCost * 100) / 100,
        workOrderCount: data.count,
        avgCostPerWorkOrder: Math.round((data.totalCost / data.count) * 100) / 100,
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
  }

  /**
   * Get cost breakdown by asset
   */
  static async getCostByAsset(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<CostByAsset[]> {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      assetId: { not: null },
      ...(filters?.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.assetId && { assetId: filters.assetId }),
      ...(filters?.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      select: {
        assetId: true,
        actualCost: true,
        estimatedCost: true,
        completedAt: true,
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Group by asset
    const assetMap = new Map<
      string,
      {
        assetName: string
        assetCode: string
        totalCost: number
        count: number
        lastMaintenanceDate: string | null
      }
    >()

    workOrders.forEach((wo) => {
      if (!wo.assetId || !wo.asset) return

      const cost = wo.actualCost || wo.estimatedCost || 0
      if (!assetMap.has(wo.assetId)) {
        assetMap.set(wo.assetId, {
          assetName: wo.asset.name,
          assetCode: wo.asset.code,
          totalCost: 0,
          count: 0,
          lastMaintenanceDate: null,
        })
      }

      const assetData = assetMap.get(wo.assetId)!
      assetData.totalCost += cost
      assetData.count += 1

      // Update last maintenance date if this is more recent
      if (wo.completedAt) {
        const completedDateStr = wo.completedAt.toISOString()
        if (
          !assetData.lastMaintenanceDate ||
          wo.completedAt.getTime() > new Date(assetData.lastMaintenanceDate).getTime()
        ) {
          assetData.lastMaintenanceDate = completedDateStr
        }
      }
    })

    // Convert to array and calculate averages
    return Array.from(assetMap.entries())
      .map(([assetId, data]) => ({
        assetId,
        assetName: data.assetName,
        assetCode: data.assetCode,
        totalCost: Math.round(data.totalCost * 100) / 100,
        maintenanceCount: data.count,
        avgCostPerMaintenance:
          Math.round((data.totalCost / data.count) * 100) / 100,
        lastMaintenanceDate: data.lastMaintenanceDate,
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
  }

  // ============================================================================
  // TECHNICIAN/RESOURCE UTILIZATION METRICS
  // ============================================================================

  /**
   * Get technician performance metrics
   */
  static async getTechnicianMetrics(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<TeamUtilizationMetrics> {
    // Get all technicians in the company
    const technicians = await prisma.user.findMany({
      where: {
        companyId,
        role: {
          key: { in: ["TECNICO", "SUPERVISOR", "JEFE_MANTENIMIENTO"] }
        },
        isLocked: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Build work order where clause
    const woWhereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      ...(filters?.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    // Get metrics for each technician
    const technicianMetricsPromises = technicians.map(async (tech) => {
      // Get work orders assigned to this technician
      const assignedWOs = await prisma.workOrder.findMany({
        where: {
          ...woWhereClause,
          assignments: {
            some: {
              userId: tech.id,
            },
          },
        },
        select: {
          id: true,
          status: true,
          scheduledDate: true,
          startedAt: true,
          completedAt: true,
          actualDuration: true,
        },
      })

      const assignedCount = assignedWOs.length
      const completedWOs = assignedWOs.filter((wo) => wo.status === "COMPLETED")
      const completedCount = completedWOs.length
      const inProgressCount = assignedWOs.filter(
        (wo) => wo.status === "IN_PROGRESS"
      ).length
      const overdueCount = assignedWOs.filter((wo) => {
        if (wo.status === "COMPLETED" || wo.status === "CANCELLED") return false
        if (!wo.scheduledDate) return false
        return new Date(wo.scheduledDate) < new Date()
      }).length

      // Calculate completion rate
      const completionRate =
        assignedCount > 0 ? (completedCount / assignedCount) * 100 : 0

      // Calculate on-time completion rate
      const completedOnTime = completedWOs.filter((wo) => {
        if (!wo.scheduledDate || !wo.completedAt) return true
        return new Date(wo.completedAt) <= new Date(wo.scheduledDate)
      }).length
      const onTimeCompletionRate =
        completedCount > 0 ? (completedOnTime / completedCount) * 100 : 0

      // Calculate average completion time
      const completionTimes = completedWOs
        .filter((wo) => wo.startedAt && wo.completedAt)
        .map((wo) => {
          const start = new Date(wo.startedAt!).getTime()
          const end = new Date(wo.completedAt!).getTime()
          return (end - start) / (1000 * 60 * 60) // Convert to hours
        })

      const avgCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) /
            completionTimes.length
          : 0

      // Calculate total hours worked (sum of actual durations)
      const totalHoursWorked = assignedWOs.reduce((sum, wo) => {
        return sum + (wo.actualDuration || 0) / 60 // Convert minutes to hours
      }, 0)

      // Calculate productive hours (completed work orders)
      const productiveHours = completedWOs.reduce((sum, wo) => {
        return sum + (wo.actualDuration || 0) / 60
      }, 0)

      // Calculate utilization (productive hours / total hours)
      // Assuming 8 hours per day as available working time
      const daysInPeriod = filters?.dateRange
        ? (filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
        : 30
      const availableHours = daysInPeriod * 8
      const utilization =
        availableHours > 0 ? (totalHoursWorked / availableHours) * 100 : 0

      // TODO: Implement rework tracking
      const reworkCount = 0 // Placeholder
      const qualityScore = completionRate // Simplified quality score

      return {
        userId: tech.id,
        userName: tech.name,
        userEmail: tech.email,
        assignedWorkOrders: assignedCount,
        completedWorkOrders: completedCount,
        inProgressWorkOrders: inProgressCount,
        overdueWorkOrders: overdueCount,
        completionRate: Math.round(completionRate * 10) / 10,
        onTimeCompletionRate: Math.round(onTimeCompletionRate * 10) / 10,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
        productiveHours: Math.round(productiveHours * 10) / 10,
        utilization: Math.round(utilization * 10) / 10,
        reworkCount,
        qualityScore: Math.round(qualityScore * 10) / 10,
      }
    })

    const technicianMetrics = await Promise.all(technicianMetricsPromises)

    // Calculate overall metrics
    const totalTechnicians = technicianMetrics.length
    const avgUtilization =
      totalTechnicians > 0
        ? technicianMetrics.reduce((sum, m) => sum + m.utilization, 0) /
          totalTechnicians
        : 0
    const avgCompletionRate =
      totalTechnicians > 0
        ? technicianMetrics.reduce((sum, m) => sum + m.completionRate, 0) /
          totalTechnicians
        : 0
    const totalWorkOrders = technicianMetrics.reduce(
      (sum, m) => sum + m.assignedWorkOrders,
      0
    )
    const totalHoursWorked = technicianMetrics.reduce(
      (sum, m) => sum + m.totalHoursWorked,
      0
    )

    return {
      technicians: technicianMetrics.sort(
        (a, b) => b.completionRate - a.completionRate
      ),
      overall: {
        totalTechnicians,
        avgUtilization: Math.round(avgUtilization * 10) / 10,
        avgCompletionRate: Math.round(avgCompletionRate * 10) / 10,
        totalWorkOrders,
        totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
      },
    }
  }

  // ============================================================================
  // TIMESERIES DATA FOR CHARTS
  // ============================================================================

  /**
   * Get timeseries data for trend charts
   */
  static async getTimeseriesData(
    companyId: string,
    metric: "workOrders" | "completionRate" | "costs",
    filters?: AnalyticsFilters,
    interval: "day" | "week" | "month" = "day"
  ): Promise<TimeseriesDataPoint[]> {
    if (!filters?.dateRange) {
      throw new Error("Date range is required for timeseries data")
    }

    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.assetId && { assetId: filters.assetId }),
      ...(filters.clientCompanyId && {
        site: { clientCompanyId: filters.clientCompanyId },
      }),
    }

    // Get all work orders in the date range
    const workOrders = await prisma.workOrder.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      },
      select: {
        createdAt: true,
        completedAt: true,
        status: true,
        type: true,
        actualCost: true,
        estimatedCost: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Group work orders by interval
    const dataPointsMap = new Map<string, TimeseriesDataPoint>()

    // Helper function to get interval key
    const getIntervalKey = (date: Date): string => {
      if (interval === "day") {
        return date.toISOString().split("T")[0]
      } else if (interval === "week") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split("T")[0]
      } else {
        // month
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }
    }

    // Initialize data points
    const startDate = new Date(filters.dateRange.from)
    const endDate = new Date(filters.dateRange.to)
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const key = getIntervalKey(currentDate)
      if (!dataPointsMap.has(key)) {
        dataPointsMap.set(key, {
          date: key,
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          preventive: 0,
          corrective: 0,
          repair: 0,
          totalCost: 0,
        })
      }

      // Increment date based on interval (create new Date to avoid mutation)
      const nextDate = new Date(currentDate)
      if (interval === "day") {
        nextDate.setDate(nextDate.getDate() + 1)
      } else if (interval === "week") {
        nextDate.setDate(nextDate.getDate() + 7)
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      currentDate = nextDate
    }

    // Populate data points with work order data
    workOrders.forEach((wo) => {
      const key = getIntervalKey(new Date(wo.createdAt))
      const dataPoint = dataPointsMap.get(key)

      if (dataPoint) {
        dataPoint.total++

        if (wo.status === "COMPLETED") {
          dataPoint.completed++
        } else {
          dataPoint.pending++
        }

        // Type breakdown
        if (wo.type === "PREVENTIVO") {
          dataPoint.preventive++
        } else if (wo.type === "CORRECTIVO") {
          dataPoint.corrective++
        } else if (wo.type === "REPARACION") {
          dataPoint.repair++
        }

        // Cost
        const cost = wo.actualCost || wo.estimatedCost || 0
        dataPoint.totalCost += cost
      }
    })

    // Calculate completion rate for each data point
    const dataPoints = Array.from(dataPointsMap.values()).map((dp) => ({
      ...dp,
      completionRate: dp.total > 0 ? (dp.completed / dp.total) * 100 : 0,
    }))

    return dataPoints.sort((a, b) => a.date.localeCompare(b.date))
  }

  // ============================================================================
  // SITE PERFORMANCE METRICS
  // ============================================================================

  /**
   * Get performance metrics by site
   */
  static async getSitePerformanceMetrics(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<SitePerformanceMetrics[]> {
    // Get all sites for the company
    const sitesQuery: Prisma.SiteWhereInput = {
      isActive: true,
      ...(filters?.siteId && { id: filters.siteId }),
      ...(filters?.clientCompanyId
        ? { clientCompanyId: filters.clientCompanyId }
        : {
            clientCompany: {
              tenantCompanyId: companyId,
            },
          }),
    }

    const sites = await prisma.site.findMany({
      where: sitesQuery,
      select: {
        id: true,
        name: true,
      },
    })

    // Get metrics for each site
    const siteMetricsPromises = sites.map(async (site) => {
      // Work order metrics
      const woWhereClause: Prisma.WorkOrderWhereInput = {
        companyId,
        siteId: site.id,
        isActive: true,
        ...(filters?.dateRange && {
          createdAt: {
            gte: filters.dateRange.from,
            lte: filters.dateRange.to,
          },
        }),
      }

      const [
        totalWorkOrders,
        completedWorkOrders,
        overdueWorkOrders,
        assets,
        assetsInMaintenance,
        workOrdersWithTimes,
      ] = await Promise.all([
        prisma.workOrder.count({ where: woWhereClause }),
        prisma.workOrder.count({
          where: { ...woWhereClause, status: "COMPLETED" },
        }),
        prisma.workOrder.count({
          where: {
            ...woWhereClause,
            scheduledDate: { lt: new Date() },
            status: { notIn: ["COMPLETED", "CANCELLED"] },
          },
        }),
        prisma.asset.count({
          where: {
            siteId: site.id,
            isActive: true,
          },
        }),
        prisma.asset.count({
          where: {
            siteId: site.id,
            isActive: true,
            status: "EN_MANTENIMIENTO",
          },
        }),
        prisma.workOrder.findMany({
          where: {
            ...woWhereClause,
            status: "COMPLETED",
            startedAt: { not: null },
            completedAt: { not: null },
          },
          select: {
            createdAt: true,
            startedAt: true,
            completedAt: true,
            scheduledDate: true,
            assignments: {
              select: { assignedAt: true },
              orderBy: { assignedAt: "asc" },
              take: 1,
            },
          },
        }),
      ])

      // Calculate completion rate
      const completionRate =
        totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0

      // Calculate avg response time (creation to assignment)
      const responseTimesMs = workOrdersWithTimes
        .filter((wo) => wo.assignments && wo.assignments.length > 0)
        .map((wo) => {
          const created = new Date(wo.createdAt).getTime()
          const assigned = new Date(wo.assignments[0].assignedAt).getTime()
          return assigned - created
        })

      const avgResponseTime =
        responseTimesMs.length > 0
          ? responseTimesMs.reduce((sum, time) => sum + time, 0) /
            responseTimesMs.length /
            (1000 * 60 * 60) // Convert to hours
          : 0

      // Calculate avg completion time (start to completion)
      const completionTimesMs = workOrdersWithTimes.map((wo) => {
        const start = new Date(wo.startedAt!).getTime()
        const end = new Date(wo.completedAt!).getTime()
        return end - start
      })

      const avgCompletionTime =
        completionTimesMs.length > 0
          ? completionTimesMs.reduce((sum, time) => sum + time, 0) /
            completionTimesMs.length /
            (1000 * 60 * 60) // Convert to hours
          : 0

      // Calculate on-time delivery rate
      const onTimeDeliveries = workOrdersWithTimes.filter((wo) => {
        if (!wo.scheduledDate || !wo.completedAt) return true
        return new Date(wo.completedAt) <= new Date(wo.scheduledDate)
      }).length

      const onTimeDeliveryRate =
        workOrdersWithTimes.length > 0
          ? (onTimeDeliveries / workOrdersWithTimes.length) * 100
          : 0

      // Calculate total maintenance cost
      const costData = await prisma.workOrder.findMany({
        where: woWhereClause,
        select: {
          actualCost: true,
          estimatedCost: true,
        },
      })

      const totalMaintenanceCost = costData.reduce((sum, wo) => {
        return sum + (wo.actualCost || wo.estimatedCost || 0)
      }, 0)

      const avgCostPerWorkOrder =
        totalWorkOrders > 0 ? totalMaintenanceCost / totalWorkOrders : 0

      return {
        siteId: site.id,
        siteName: site.name,
        totalWorkOrders,
        completedWorkOrders,
        overdueWorkOrders,
        completionRate: Math.round(completionRate * 10) / 10,
        totalAssets: assets,
        operationalAssets: assets - assetsInMaintenance,
        assetsInMaintenance,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 10) / 10,
        totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
        avgCostPerWorkOrder: Math.round(avgCostPerWorkOrder * 100) / 100,
      }
    })

    return Promise.all(siteMetricsPromises)
  }
}
