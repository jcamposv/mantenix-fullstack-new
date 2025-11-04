"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { List, Plus } from "lucide-react"
import { WorkOrdersDashboard } from "@/components/dashboard/company/work-orders-dashboard"
import { DashboardFilters, DatePeriod } from "@/components/dashboard/shared/dashboard-filters"
import { DateRange } from "react-day-picker"

export default function WorkOrdersPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<DatePeriod>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()

  const handleAddWorkOrder = () => {
    router.push("/work-orders/new/select-template")
  }

  const handleViewList = () => {
    router.push("/work-orders/list")
  }

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Órdenes</h1>
            <p className="text-muted-foreground">
              Vista general y métricas de órdenes de trabajo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DashboardFilters
              period={period}
              customDateRange={customDateRange}
              onPeriodChange={setPeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />

            <Button variant="outline" onClick={handleViewList}>
              <List className="h-4 w-4 mr-2" />
              Ver Lista
            </Button>
            <Button onClick={handleAddWorkOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Orden
            </Button>
          </div>
        </div>
      </div>

      <WorkOrdersDashboard
        period={period}
        customDateRange={customDateRange}
        onPeriodChange={setPeriod}
        onCustomDateRangeChange={setCustomDateRange}
        hideFilters={true}
      />
    </div>
  )
}