/**
 * Analytics and KPI Types
 *
 * Comprehensive types for dashboard analytics, KPIs, and reporting
 * Following CMMS best practices for maintenance metrics
 */

// ============================================================================
// DATE RANGE & FILTERS
// ============================================================================

export interface DateRange {
  from: Date
  to: Date
}

export interface AnalyticsFilters {
  dateRange?: DateRange
  siteId?: string
  clientCompanyId?: string
  assetId?: string
  userId?: string // For technician-specific metrics
}

// ============================================================================
// ASSET RELIABILITY METRICS (MTBF, MTTR, Availability, OEE)
// ============================================================================

export interface AssetReliabilityMetrics {
  assetId: string
  assetName: string
  assetCode: string

  // Core reliability metrics
  mtbf: number // Mean Time Between Failures (hours)
  mttr: number // Mean Time To Repair (hours)
  availability: number // Percentage (0-100)

  // Equipment effectiveness
  oee: number // Overall Equipment Effectiveness (0-100)

  // Failure metrics
  totalFailures: number
  criticalFailures: number
  failureRate: number // Failures per month

  // Maintenance metrics
  totalMaintenances: number
  preventiveMaintenances: number
  correctiveMaintenances: number

  // Time metrics
  totalDowntime: number // Total downtime in hours
  totalUptime: number // Total uptime in hours

  // Cost metrics (optional)
  totalMaintenanceCost?: number
  averageCostPerMaintenance?: number
}

export interface AssetReliabilitySummary {
  assets: AssetReliabilityMetrics[]
  overall: {
    avgMtbf: number
    avgMttr: number
    avgAvailability: number
    avgOee: number
    totalDowntime: number
  }
}

// ============================================================================
// MAINTENANCE PERFORMANCE METRICS
// ============================================================================

export interface MaintenancePerformanceMetrics {
  // Work order completion metrics
  totalWorkOrders: number
  completedWorkOrders: number
  inProgressWorkOrders: number
  overdueWorkOrders: number
  cancelledWorkOrders: number

  // Completion rate
  completionRate: number // Percentage (0-100)
  onTimeCompletionRate: number // Percentage (0-100)

  // Preventive vs Corrective
  preventiveCount: number
  correctiveCount: number
  repairCount: number
  preventivePercentage: number // Target: 80%+

  // PM Compliance (Preventive Maintenance)
  pmScheduled: number
  pmCompleted: number
  pmComplianceRate: number // Percentage (0-100)

  // Backlog metrics
  backlogCount: number
  backlogAge: number // Average age in days
  criticalBacklog: number

  // Response time metrics
  avgResponseTime: number // Hours from creation to assignment
  avgCompletionTime: number // Hours from start to completion

  // Priority distribution
  urgentCount: number
  highCount: number
  mediumCount: number
  lowCount: number
}

// ============================================================================
// COST ANALYTICS
// ============================================================================

export interface CostMetrics {
  // Overall costs
  totalMaintenanceCost: number
  totalLaborCost: number
  totalPartsCost: number
  totalDowntimeCost: number

  // Average costs
  avgCostPerWorkOrder: number
  avgCostPerAsset: number
  avgCostPerHour: number

  // Cost breakdown by type
  preventiveCost: number
  correctiveCost: number
  repairCost: number

  // Cost breakdown by priority
  urgentCost: number
  highCost: number
  mediumCost: number
  lowCost: number

  // ROI metrics
  preventiveMaintenanceROI: number // Savings vs reactive costs
  estimatedSavings: number
}

export interface CostBySite {
  siteId: string
  siteName: string
  totalCost: number
  workOrderCount: number
  avgCostPerWorkOrder: number
}

export interface CostByAsset {
  assetId: string
  assetName: string
  assetCode: string
  totalCost: number
  maintenanceCount: number
  avgCostPerMaintenance: number
  lastMaintenanceDate: string | null
}

// ============================================================================
// TECHNICIAN/RESOURCE UTILIZATION METRICS
// ============================================================================

export interface TechnicianMetrics {
  userId: string
  userName: string
  userEmail: string

  // Workload metrics
  assignedWorkOrders: number
  completedWorkOrders: number
  inProgressWorkOrders: number
  overdueWorkOrders: number

  // Performance metrics
  completionRate: number // Percentage (0-100)
  onTimeCompletionRate: number // Percentage (0-100)
  avgCompletionTime: number // Hours

  // Productivity metrics
  totalHoursWorked: number
  productiveHours: number
  utilization: number // Percentage (0-100)

  // Quality metrics
  reworkCount: number // Work orders requiring rework
  qualityScore: number // Based on completion quality
}

export interface TeamUtilizationMetrics {
  technicians: TechnicianMetrics[]
  overall: {
    totalTechnicians: number
    avgUtilization: number
    avgCompletionRate: number
    totalWorkOrders: number
    totalHoursWorked: number
  }
}

// ============================================================================
// TIMESERIES DATA FOR CHARTS
// ============================================================================

export interface TimeseriesDataPoint {
  date: string // ISO date string
  label?: string // Optional label for display (e.g., "Jan 2024")

  // Work order counts
  total: number
  completed: number
  pending: number
  overdue: number

  // Maintenance type breakdown
  preventive: number
  corrective: number
  repair: number

  // Performance metrics
  completionRate?: number
  avgCompletionTime?: number

  // Cost metrics
  totalCost: number
  laborCost?: number
  partsCost?: number
}

export interface TimeseriesData {
  dataPoints: TimeseriesDataPoint[]
  summary: {
    trend: 'up' | 'down' | 'stable'
    percentageChange: number
    periodStart: string
    periodEnd: string
  }
}

// ============================================================================
// DASHBOARD SUMMARY (ALL KPIS)
// ============================================================================

export interface DashboardKPIs {
  // Overview metrics
  overview: {
    totalWorkOrders: number
    completedWorkOrders: number
    inProgressWorkOrders: number
    overdueWorkOrders: number
    completionRate: number
    avgCompletionTime: number
  }

  // Asset reliability
  assetReliability: {
    avgMtbf: number
    avgMttr: number
    avgAvailability: number
    avgOee: number
    criticalAssets: number // Assets with low reliability
  }

  // Maintenance performance
  maintenancePerformance: MaintenancePerformanceMetrics

  // Cost metrics
  costs: {
    totalCost: number
    avgCostPerWorkOrder: number
    preventiveVsCorrectiveRatio: number
    preventiveMaintenanceROI: number
  }

  // Resource utilization
  resources: {
    totalTechnicians: number
    avgUtilization: number
    activeWorkOrders: number
    backlogWorkOrders: number
  }

  // Trends (compared to previous period)
  trends: {
    workOrderTrend: 'up' | 'down' | 'stable'
    completionRateTrend: 'up' | 'down' | 'stable'
    costTrend: 'up' | 'down' | 'stable'
    availabilityTrend: 'up' | 'down' | 'stable'
  }
}

// ============================================================================
// DETAILED ANALYTICS RESPONSE
// ============================================================================

export interface AnalyticsResponse {
  // Summary KPIs
  kpis: DashboardKPIs

  // Detailed metrics
  assetReliability?: AssetReliabilitySummary
  maintenancePerformance?: MaintenancePerformanceMetrics
  costs?: CostMetrics
  costBySite?: CostBySite[]
  costByAsset?: CostByAsset[]
  teamUtilization?: TeamUtilizationMetrics

  // Timeseries data for charts
  timeseries?: {
    workOrders?: TimeseriesData
    completionRate?: TimeseriesData
    costs?: TimeseriesData
    availability?: TimeseriesData
  }

  // Metadata
  filters: AnalyticsFilters
  generatedAt: string
}

// ============================================================================
// SITE PERFORMANCE METRICS
// ============================================================================

export interface SitePerformanceMetrics {
  siteId: string
  siteName: string

  // Work order metrics
  totalWorkOrders: number
  completedWorkOrders: number
  overdueWorkOrders: number
  completionRate: number

  // Asset metrics
  totalAssets: number
  operationalAssets: number
  assetsInMaintenance: number

  // Performance metrics
  avgResponseTime: number
  avgCompletionTime: number
  onTimeDeliveryRate: number

  // Cost metrics
  totalMaintenanceCost: number
  avgCostPerWorkOrder: number
}

// ============================================================================
// ALERT & NOTIFICATION ANALYTICS
// ============================================================================

export interface AlertAnalytics {
  totalAlerts: number
  openAlerts: number
  resolvedAlerts: number
  avgResolutionTime: number

  // By priority
  criticalAlerts: number
  highPriorityAlerts: number
  mediumPriorityAlerts: number
  lowPriorityAlerts: number

  // By type
  equipmentFailures: number
  safetyIssues: number
  maintenanceRequired: number
  operationalIssues: number
}

// ============================================================================
// PREDICTIVE ANALYTICS (FUTURE ENHANCEMENT)
// ============================================================================

export interface PredictiveInsights {
  assetId?: string
  assetName?: string

  // Failure prediction
  failureProbability: number // 0-100
  predictedFailureDate: string | null
  recommendedAction: string

  // Maintenance recommendation
  nextMaintenanceRecommended: string | null
  maintenanceUrgency: 'low' | 'medium' | 'high' | 'critical'

  // Cost prediction
  estimatedMaintenanceCost: number
  potentialDowntimeCost: number

  // Confidence
  confidenceScore: number // 0-100
}

// ============================================================================
// EXPORT OPTIONS FOR REPORTS
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeSummary: boolean
  includeDetails: boolean
  dateRange: DateRange
  filters: AnalyticsFilters
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  defaultFilters?: AnalyticsFilters
}

export interface ReportSection {
  id: string
  title: string
  type: 'kpi' | 'chart' | 'table' | 'text'
  config: Record<string, unknown>
}
