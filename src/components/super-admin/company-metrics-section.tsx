import { Building2, TrendingUp, Users as UsersIcon } from "lucide-react"
import { StatsCard } from "./stats-card"
import type { CompanyMetrics } from "@/schemas/super-admin"

interface CompanyMetricsSectionProps {
  metrics: CompanyMetrics
}

export function CompanyMetricsSection({ metrics }: CompanyMetricsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Empresas"
        value={metrics.total}
        description="Empresas registradas en el sistema"
        icon={Building2}
        iconColor="text-blue-600"
        trend={{
          value: metrics.growth.percentage,
          label: "últimos 30 días"
        }}
      />
      <StatsCard
        title="Empresas Activas"
        value={metrics.active}
        description={`${((metrics.active / metrics.total) * 100).toFixed(0)}% del total`}
        icon={UsersIcon}
        iconColor="text-green-600"
      />
      <StatsCard
        title="Empresas Inactivas"
        value={metrics.inactive}
        description={`${((metrics.inactive / metrics.total) * 100).toFixed(0)}% del total`}
        icon={UsersIcon}
        iconColor="text-gray-600"
      />
      <StatsCard
        title="Nuevas este Mes"
        value={metrics.growth.month}
        description="Empresas registradas"
        icon={TrendingUp}
        iconColor="text-purple-600"
      />
    </div>
  )
}
