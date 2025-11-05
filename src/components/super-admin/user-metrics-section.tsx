import { Users, UserCheck, UserX, TrendingUp } from "lucide-react"
import { StatsCard } from "./stats-card"
import { DetailedStatsCard } from "./detailed-stats-card"
import type { UserMetrics } from "@/schemas/super-admin"

interface UserMetricsSectionProps {
  metrics: UserMetrics
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN_GRUPO: "Admin de Grupo",
  ADMIN_EMPRESA: "Admin de Empresa",
  JEFE_MANTENIMIENTO: "Jefe de Mantenimiento",
  SUPERVISOR: "Supervisor",
  TECNICO: "Técnico",
  CLIENTE_ADMIN_GENERAL: "Cliente Admin General",
  CLIENTE_ADMIN_SEDE: "Cliente Admin Sede",
  CLIENTE_OPERARIO: "Cliente Operario"
}

export function UserMetricsSection({ metrics }: UserMetricsSectionProps) {
  const roleItems = Object.entries(metrics.byRole).map(([role, count]) => ({
    label: ROLE_LABELS[role] || role,
    value: count
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Usuarios"
          value={metrics.total}
          description="Usuarios en el sistema"
          icon={Users}
          iconColor="text-blue-600"
          trend={{
            value: metrics.growth.percentage,
            label: "últimos 30 días"
          }}
        />
        <StatsCard
          title="Usuarios Activos"
          value={metrics.active}
          description={`${metrics.total > 0 ? ((metrics.active / metrics.total) * 100).toFixed(0) : 0}% no bloqueados`}
          icon={UserCheck}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Usuarios Bloqueados"
          value={metrics.inactive}
          description={`${metrics.total > 0 ? ((metrics.inactive / metrics.total) * 100).toFixed(0) : 0}% bloqueados`}
          icon={UserX}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Nuevos este Mes"
          value={metrics.growth.month}
          description="Usuarios registrados"
          icon={TrendingUp}
          iconColor="text-purple-600"
        />
      </div>

      <DetailedStatsCard
        title="Usuarios por Rol"
        description="Distribución de usuarios según su rol en el sistema"
        icon={Users}
        items={roleItems}
      />
    </div>
  )
}
