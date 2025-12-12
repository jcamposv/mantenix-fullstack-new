/**
 * Alerts Section Component
 *
 * Displays alert statistics.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { StatCard } from '../stat-card'
import type { AlertStats } from '@/server/services/dashboard.service'
import { AlertTriangle, Activity, TrendingUp } from 'lucide-react'

interface AlertsSectionProps {
  stats: AlertStats
}

export function AlertsSection({ stats }: AlertsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Alertas
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alertas"
          value={stats.total}
          icon={AlertTriangle}
          description="Todas las alertas"
        />
        <StatCard
          title="Activas"
          value={stats.active}
          icon={Activity}
          description="Requieren atención"
        />
        <StatCard
          title="Críticas"
          value={stats.critical}
          icon={AlertTriangle}
          description="Alta prioridad"
          className="border-red-200"
        />
        <StatCard
          title="Tasa de Respuesta"
          value={`${stats.responseRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Alertas resueltas"
        />
      </div>
    </div>
  )
}
