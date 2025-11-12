/**
 * Analytics Service
 *
 * Business logic layer for analytics and KPI calculations
 * Orchestrates repository calls and adds permission checks
 */

import { AnalyticsRepository } from "@/server/repositories/analytics.repository"
import { getCurrentCompanyId } from "@/lib/company-context"
import { getPeriodDateRange } from "@/schemas/analytics"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  AnalyticsFilters,
  DateRange,
  DashboardKPIs,
  AnalyticsResponse,
  AssetReliabilitySummary,
  MaintenancePerformanceMetrics,
  CostMetrics,
  CostBySite,
  CostByAsset,
  TeamUtilizationMetrics,
  TimeseriesData,
  SitePerformanceMetrics,
} from "@/types/analytics.types"
import type { PeriodPreset } from "@/schemas/analytics"

export class AnalyticsService {
  /**
   * Get comprehensive dashboard KPIs
   */
  static async getDashboardKPIs(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<DashboardKPIs> {
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // Build date range from preset
    const dateRange = getPeriodDateRange(periodPreset)

    // Build enhanced filters with permissions
    const enhancedFilters = this.buildFiltersWithPermissions(
      session,
      {
        ...filters,
        dateRange,
      }
    )

    // Get all metrics in parallel
    const [
      maintenancePerformance,
      assetReliability,
      costs,
    ] = await Promise.all([
      AnalyticsRepository.getMaintenancePerformanceMetrics(
        companyId,
        enhancedFilters
      ),
      AnalyticsRepository.getAssetReliabilityMetrics(companyId, enhancedFilters),
      AnalyticsRepository.getCostMetrics(companyId, enhancedFilters),
    ])

    // Calculate trends (comparing with previous period)
    const previousPeriodFilters = {
      ...enhancedFilters,
      dateRange: this.getPreviousPeriod(dateRange),
    }

    const [previousPerformance, previousCosts] = await Promise.all([
      AnalyticsRepository.getMaintenancePerformanceMetrics(
        companyId,
        previousPeriodFilters
      ),
      AnalyticsRepository.getCostMetrics(companyId, previousPeriodFilters),
    ])

    // Determine trends
    const workOrderTrend = this.getTrend(
      maintenancePerformance.totalWorkOrders,
      previousPerformance.totalWorkOrders
    )
    const completionRateTrend = this.getTrend(
      maintenancePerformance.completionRate,
      previousPerformance.completionRate
    )
    const costTrend = this.getTrend(
      costs.totalMaintenanceCost,
      previousCosts.totalMaintenanceCost,
      true // Inverse trend (lower cost is better)
    )
    const availabilityTrend = this.getTrend(
      assetReliability.overall.avgAvailability,
      assetReliability.overall.avgAvailability // TODO: Get previous period
    )

    // Count critical assets (availability < 80%)
    const criticalAssets = assetReliability.assets.filter(
      (asset) => asset.availability < 80
    ).length

    return {
      overview: {
        totalWorkOrders: maintenancePerformance.totalWorkOrders,
        completedWorkOrders: maintenancePerformance.completedWorkOrders,
        inProgressWorkOrders: maintenancePerformance.inProgressWorkOrders,
        overdueWorkOrders: maintenancePerformance.overdueWorkOrders,
        completionRate: maintenancePerformance.completionRate,
        avgCompletionTime: maintenancePerformance.avgCompletionTime,
      },
      assetReliability: {
        avgMtbf: assetReliability.overall.avgMtbf,
        avgMttr: assetReliability.overall.avgMttr,
        avgAvailability: assetReliability.overall.avgAvailability,
        avgOee: assetReliability.overall.avgOee,
        criticalAssets,
      },
      maintenancePerformance,
      costs: {
        totalCost: costs.totalMaintenanceCost,
        avgCostPerWorkOrder: costs.avgCostPerWorkOrder,
        preventiveVsCorrectiveRatio:
          costs.correctiveCost > 0
            ? costs.preventiveCost / costs.correctiveCost
            : 0,
        preventiveMaintenanceROI: costs.preventiveMaintenanceROI,
      },
      resources: {
        totalTechnicians: 0, // Will be calculated from team utilization
        avgUtilization: 0,
        activeWorkOrders: maintenancePerformance.inProgressWorkOrders,
        backlogWorkOrders: maintenancePerformance.backlogCount,
      },
      trends: {
        workOrderTrend,
        completionRateTrend,
        costTrend,
        availabilityTrend,
      },
    }
  }

  /**
   * Get comprehensive analytics response (all metrics)
   */
  static async getComprehensiveAnalytics(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<AnalyticsResponse> {
    // Get company ID based on role and current subdomain
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // Build date range from preset
    const dateRange = getPeriodDateRange(periodPreset)

    // Build enhanced filters with permissions
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    // Get all metrics in parallel
    const [
      kpis,
      assetReliability,
      maintenancePerformance,
      costs,
      costBySite,
      costByAsset,
      teamUtilization,
      workOrdersTimeseries,
      costsTimeseries,
    ] = await Promise.all([
      this.getDashboardKPIs(session, periodPreset, filters),
      AnalyticsRepository.getAssetReliabilityMetrics(companyId, enhancedFilters),
      AnalyticsRepository.getMaintenancePerformanceMetrics(
        companyId,
        enhancedFilters
      ),
      AnalyticsRepository.getCostMetrics(companyId, enhancedFilters),
      AnalyticsRepository.getCostBySite(companyId, enhancedFilters),
      AnalyticsRepository.getCostByAsset(companyId, enhancedFilters),
      AnalyticsRepository.getTechnicianMetrics(companyId, enhancedFilters),
      AnalyticsRepository.getTimeseriesData(
        companyId,
        "workOrders",
        enhancedFilters,
        "day"
      ),
      AnalyticsRepository.getTimeseriesData(
        companyId,
        "costs",
        enhancedFilters,
        "day"
      ),
    ])

    // Calculate trend for timeseries
    const workOrdersTrend = this.calculateTimeseriesTrend(workOrdersTimeseries)
    const costsTrend = this.calculateTimeseriesTrend(costsTimeseries)

    return {
      kpis,
      assetReliability,
      maintenancePerformance,
      costs,
      costBySite,
      costByAsset,
      teamUtilization,
      timeseries: {
        workOrders: {
          dataPoints: workOrdersTimeseries,
          summary: workOrdersTrend,
        },
        costs: {
          dataPoints: costsTimeseries,
          summary: costsTrend,
        },
      },
      filters: enhancedFilters,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Get asset reliability metrics
   */
  static async getAssetReliabilityMetrics(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<AssetReliabilitySummary> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const dateRange = getPeriodDateRange(periodPreset)
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    return AnalyticsRepository.getAssetReliabilityMetrics(
      companyId,
      enhancedFilters
    )
  }

  /**
   * Get maintenance performance metrics
   */
  static async getMaintenancePerformanceMetrics(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<MaintenancePerformanceMetrics> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const dateRange = getPeriodDateRange(periodPreset)
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    return AnalyticsRepository.getMaintenancePerformanceMetrics(
      companyId,
      enhancedFilters
    )
  }

  /**
   * Get cost analytics
   */
  static async getCostMetrics(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<{
    metrics: CostMetrics
    bySite: CostBySite[]
    byAsset: CostByAsset[]
  }> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const dateRange = getPeriodDateRange(periodPreset)
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    const [metrics, bySite, byAsset] = await Promise.all([
      AnalyticsRepository.getCostMetrics(companyId, enhancedFilters),
      AnalyticsRepository.getCostBySite(companyId, enhancedFilters),
      AnalyticsRepository.getCostByAsset(companyId, enhancedFilters),
    ])

    return {
      metrics,
      bySite,
      byAsset,
    }
  }

  /**
   * Get technician metrics
   */
  static async getTechnicianMetrics(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<TeamUtilizationMetrics> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const dateRange = getPeriodDateRange(periodPreset)
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    return AnalyticsRepository.getTechnicianMetrics(companyId, enhancedFilters)
  }

  /**
   * Get site performance metrics
   */
  static async getSitePerformanceMetrics(
    session: AuthenticatedSession,
    periodPreset: PeriodPreset = "last_30_days",
    filters?: Partial<AnalyticsFilters>
  ): Promise<SitePerformanceMetrics[]> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const dateRange = getPeriodDateRange(periodPreset)
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    return AnalyticsRepository.getSitePerformanceMetrics(
      companyId,
      enhancedFilters
    )
  }

  /**
   * Get timeseries data for charts
   */
  static async getTimeseriesData(
    session: AuthenticatedSession,
    metric: "workOrders" | "completionRate" | "costs",
    periodPreset: PeriodPreset = "last_30_days",
    interval: "day" | "week" | "month" = "day",
    filters?: Partial<AnalyticsFilters>
  ): Promise<TimeseriesData> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const dateRange = getPeriodDateRange(periodPreset)
    const enhancedFilters = this.buildFiltersWithPermissions(session, {
      ...filters,
      dateRange,
    })

    const dataPoints = await AnalyticsRepository.getTimeseriesData(
      companyId,
      metric,
      enhancedFilters,
      interval
    )

    const summary = this.calculateTimeseriesTrend(dataPoints)

    return {
      dataPoints,
      summary,
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Build filters with permission checks
   * External users can only see data from their assigned sites/companies
   */
  private static buildFiltersWithPermissions(
    session: AuthenticatedSession,
    filters: Partial<AnalyticsFilters>
  ): AnalyticsFilters {
    const enhancedFilters: AnalyticsFilters = { ...filters }

    // CLIENTE_ADMIN_GENERAL sees all work orders from their client company
    if (
      session.user.role === "CLIENTE_ADMIN_GENERAL" &&
      session.user.clientCompanyId
    ) {
      enhancedFilters.clientCompanyId = session.user.clientCompanyId
    }
    // CLIENTE_ADMIN_SEDE and CLIENTE_OPERARIO see only work orders from their site
    else if (
      (session.user.role === "CLIENTE_ADMIN_SEDE" ||
        session.user.role === "CLIENTE_OPERARIO") &&
      session.user.siteId
    ) {
      enhancedFilters.siteId = session.user.siteId
    }

    return enhancedFilters
  }

  /**
   * Get previous period for trend comparison
   */
  private static getPreviousPeriod(currentPeriod: DateRange): DateRange {
    const duration =
      currentPeriod.to.getTime() - currentPeriod.from.getTime()

    return {
      from: new Date(currentPeriod.from.getTime() - duration),
      to: new Date(currentPeriod.to.getTime() - duration),
    }
  }

  /**
   * Determine trend direction
   */
  private static getTrend(
    current: number,
    previous: number,
    inverse: boolean = false
  ): "up" | "down" | "stable" {
    const percentageChange = previous > 0 ? ((current - previous) / previous) * 100 : 0

    if (Math.abs(percentageChange) < 5) return "stable"

    const isUp = percentageChange > 0

    // For inverse metrics (like costs), down is good and up is bad
    if (inverse) {
      return isUp ? "down" : "up"
    }

    return isUp ? "up" : "down"
  }

  /**
   * Calculate trend from timeseries data
   */
  private static calculateTimeseriesTrend(
    dataPoints: { total?: number; date: string; totalCost?: number }[]
  ): {
    trend: "up" | "down" | "stable"
    percentageChange: number
    periodStart: string
    periodEnd: string
  } {
    if (dataPoints.length === 0) {
      return {
        trend: "stable",
        percentageChange: 0,
        periodStart: "",
        periodEnd: "",
      }
    }

    const sortedPoints = [...dataPoints].sort((a, b) =>
      a.date.localeCompare(b.date)
    )
    const firstPoint = sortedPoints[0]
    const lastPoint = sortedPoints[sortedPoints.length - 1]

    // Use total or totalCost depending on what's available
    const firstValue = firstPoint.total || firstPoint.totalCost || 0
    const lastValue = lastPoint.total || lastPoint.totalCost || 0

    const percentageChange =
      firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0

    let trend: "up" | "down" | "stable" = "stable"
    if (Math.abs(percentageChange) >= 5) {
      trend = percentageChange > 0 ? "up" : "down"
    }

    return {
      trend,
      percentageChange: Math.round(percentageChange * 10) / 10,
      periodStart: firstPoint.date,
      periodEnd: lastPoint.date,
    }
  }
}
