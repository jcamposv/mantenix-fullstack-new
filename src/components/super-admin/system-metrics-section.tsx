import {
  ClipboardList,
  AlertTriangle,
  Package as PackageIcon,
  Wrench,
  Building2
} from "lucide-react"
import { StatsCard } from "./stats-card"
import type { SystemMetrics } from "@/schemas/super-admin"

interface SystemMetricsSectionProps {
  metrics: SystemMetrics
}

export function SystemMetricsSection({ metrics }: SystemMetricsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        title="Órdenes de Trabajo"
        value={metrics.workOrders.total}
        description={`${metrics.workOrders.active} activas`}
        icon={ClipboardList}
        iconColor="text-blue-600"
      />
      <StatsCard
        title="Alertas"
        value={metrics.alerts.total}
        description={`${metrics.alerts.critical} críticas`}
        icon={AlertTriangle}
        iconColor={metrics.alerts.critical > 0 ? "text-red-600" : "text-yellow-600"}
      />
      <StatsCard
        title="Activos"
        value={metrics.assets.total}
        description="Activos registrados"
        icon={Wrench}
        iconColor="text-purple-600"
      />
      <StatsCard
        title="Ítems de Inventario"
        value={metrics.inventory.total}
        description="Productos en inventario"
        icon={PackageIcon}
        iconColor="text-green-600"
      />
      <StatsCard
        title="Grupos Corporativos"
        value={metrics.companyGroups.total}
        description={`${metrics.companyGroups.active} activos`}
        icon={Building2}
        iconColor="text-indigo-600"
      />
    </div>
  )
}
