"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { List, Plus, BarChart3, LayoutDashboard } from "lucide-react"
import { WorkOrdersDashboard } from "@/components/dashboard/company/work-orders-dashboard"
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard"
import { DashboardFilters, DatePeriod } from "@/components/dashboard/shared/dashboard-filters"
import { DateRange } from "react-day-picker"
import { PermissionGate } from "@/components/permissions/permission-gate"

export default function WorkOrdersPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<DatePeriod>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [activeTab, setActiveTab] = useState("overview")

  const handleAddWorkOrder = () => {
    router.push("/work-orders/new/select-template")
  }

  const handleViewList = () => {
    router.push("/work-orders/list")
  }

  return (
    <div className="container mx-auto py-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h1>
            <p className="text-muted-foreground">
              Dashboard operacional y analítico de mantenimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DashboardFilters
              period={period}
              customDateRange={customDateRange}
              onPeriodChange={setPeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />

            <PermissionGate permission="work_orders.view">
              <Button variant="outline" onClick={handleViewList}>
                <List className="h-4 w-4 mr-2" />
                Ver Lista
              </Button>
            </PermissionGate>

            <PermissionGate permission="work_orders.create">
              <Button onClick={handleAddWorkOrder}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Orden
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <PermissionGate permission="analytics.view">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics & KPIs
            </TabsTrigger>
          </PermissionGate>
        </TabsList>

        {/* Overview Tab - Operational Dashboard */}
        <TabsContent value="overview" className="space-y-4">
          <WorkOrdersDashboard
            period={period}
            customDateRange={customDateRange}
            onPeriodChange={setPeriod}
            onCustomDateRangeChange={setCustomDateRange}
            hideFilters={true}
          />
        </TabsContent>

        {/* Analytics Tab - KPIs Dashboard */}
        <PermissionGate permission="analytics.view">
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard
              period={period}
              onPeriodChange={setPeriod}
              hideFilters={true}
            />
          </TabsContent>
        </PermissionGate>
      </Tabs>
    </div>
  )
}