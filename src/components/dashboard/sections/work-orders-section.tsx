/**
 * Work Orders Section Component
 *
 * Displays work order statistics.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { StatCard } from '../stat-card'
import type { WorkOrderStats } from '@/server/services/dashboard.service'
import { ClipboardList, Clock, Activity, CheckCircle } from 'lucide-react'

interface WorkOrdersSectionProps {
  stats: WorkOrderStats
}

export function WorkOrdersSection({ stats }: WorkOrdersSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" />
        Órdenes de Trabajo
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total OT"
          value={stats.total}
          icon={ClipboardList}
          description="Órdenes de trabajo totales"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={Clock}
          description="Esperando asignación"
        />
        <StatCard
          title="En Progreso"
          value={stats.inProgress}
          icon={Activity}
          description="Actualmente trabajando"
        />
        <StatCard
          title="Tasa de Completitud"
          value={`${stats.completionRate.toFixed(1)}%`}
          icon={CheckCircle}
          description={`Promedio: ${stats.avgCompletionTimeHours.toFixed(1)}h`}
        />
      </div>
    </div>
  )
}
