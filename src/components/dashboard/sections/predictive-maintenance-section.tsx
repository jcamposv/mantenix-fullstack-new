/**
 * Predictive Maintenance Section Component
 *
 * Displays MTBF-based predictive maintenance statistics.
 * Only shown if PREDICTIVE_MAINTENANCE feature is enabled.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { StatCard } from '../stat-card'
import type { PredictiveMaintenanceStats } from '@/server/services/dashboard.service'
import { Wrench, AlertTriangle, Clock } from 'lucide-react'

interface PredictiveMaintenanceSectionProps {
  stats: PredictiveMaintenanceStats
}

export function PredictiveMaintenanceSection({
  stats,
}: PredictiveMaintenanceSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Wrench className="h-5 w-5" />
        Mantenimiento Predictivo
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Alertas Activas"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          description="Basadas en MTBF"
        />
        <StatCard
          title="Componentes Críticos"
          value={stats.criticalComponents}
          icon={AlertTriangle}
          description="Requieren atención"
          className="border-red-200"
        />
        <StatCard
          title="Próximos 7 Días"
          value={stats.upcomingMaintenanceNext7Days}
          icon={Clock}
          description="Mantenimiento planificado"
        />
        <StatCard
          title="Próximos 30 Días"
          value={stats.upcomingMaintenanceNext30Days}
          icon={Clock}
          description="Mantenimiento planificado"
        />
      </div>
    </div>
  )
}
