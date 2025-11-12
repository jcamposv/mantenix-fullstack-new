"use client"

import { WorkOrdersOverview } from "./work-orders-overview"
import { StatusDistributionChart } from "./status-distribution-chart"
import { RecentActivity } from "./recent-activity"
import { PerformanceMetrics } from "./performance-metrics"
import { DashboardError } from "./dashboard-error"
import { DashboardLoading } from "./dashboard-loading"
import { DashboardEmpty } from "./dashboard-empty"
import { useWorkOrdersDashboard } from "@/hooks/use-work-orders-dashboard"
import { useRouter } from "next/navigation"

interface WorkOrdersDashboardProps {
  className?: string
}

export function WorkOrdersDashboard({ className }: WorkOrdersDashboardProps) {
  const { data: stats, error, isLoading: loading, mutate } = useWorkOrdersDashboard()
  const router = useRouter()

  // Generate status distribution from real stats
  const statusDistribution = stats ? [
    { name: "Completadas", value: stats.completed, color: "#22c55e" },
    { name: "En Progreso", value: stats.inProgress, color: "#3b82f6" },
    { name: "Pendientes", value: stats.pending, color: "#f59e0b" },
    { name: "Vencidas", value: stats.overdue, color: "#ef4444" }
  ] : []

  // Convert timestamps to Date objects for recent activity
  const recentActivity = stats?.recentActivity?.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp)
  })) || []

  // Get performance metrics from real data
  const performanceMetrics = stats?.performanceMetrics || []

  // Show loading state
  if (loading) {
    return <DashboardLoading className={className} />
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <DashboardError 
        error={error} 
        onRetry={() => mutate()} 
        className={className} 
      />
    )
  }

  // Show empty state if no data
  if (stats && stats.total === 0) {
    return (
      <DashboardEmpty 
        onCreateWorkOrder={() => router.push("/work-orders/new/select-template")}
        className={className} 
      />
    )
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* KPIs Overview */}
        <WorkOrdersOverview 
          stats={stats || {
            total: 0,
            inProgress: 0,
            completed: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0,
            avgCompletionTime: 0,
            activeUsers: 0
          }} 
          loading={false}
        />

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatusDistributionChart 
            data={statusDistribution}
            loading={false}
          />
          <PerformanceMetrics
            data={performanceMetrics}
            loading={false}
          />
        </div>

        {/* Recent Activity */}
        <RecentActivity
          activities={recentActivity}
          loading={false}
        />
      </div>
    </div>
  )
}