/**
 * Dashboard Stats Grid Component
 *
 * Feature-aware grid that displays stats sections based on enabled modules.
 * Orchestrates all section components.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 * - Clean composition
 */

'use client'

import type { DashboardStats } from '@/server/services/dashboard.service'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { WorkOrdersSection } from './sections/work-orders-section'
import { AlertsSection } from './sections/alerts-section'
import { AssetsSection } from './sections/assets-section'
import { InventorySection } from './sections/inventory-section'
import { AttendanceSection } from './sections/attendance-section'
import { PredictiveMaintenanceSection } from './sections/predictive-maintenance-section'

interface DashboardStatsGridProps {
  stats: DashboardStats | undefined
  loading: boolean
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardStatsGrid({
  stats,
  loading,
}: DashboardStatsGridProps) {
  if (loading || !stats) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Work Orders - Always shown */}
      {stats.workOrders && <WorkOrdersSection stats={stats.workOrders} />}

      {/* Alerts - Always shown */}
      {stats.alerts && <AlertsSection stats={stats.alerts} />}

      {/* Assets - Always shown */}
      {stats.assets && <AssetsSection stats={stats.assets} />}

      {/* Inventory - Always shown */}
      {stats.inventory && <InventorySection stats={stats.inventory} />}

      {/* Attendance - Only if HR_ATTENDANCE enabled */}
      {stats.attendance && <AttendanceSection stats={stats.attendance} />}

      {/* Predictive Maintenance - Only if PREDICTIVE_MAINTENANCE enabled */}
      {stats.predictiveMaintenance && (
        <PredictiveMaintenanceSection stats={stats.predictiveMaintenance} />
      )}
    </div>
  )
}
