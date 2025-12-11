/**
 * Assets Section Component
 *
 * Displays asset statistics.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { StatCard } from '../stat-card'
import type { AssetStats } from '@/server/services/dashboard.service'
import { Box, CheckCircle, Wrench, TrendingUp } from 'lucide-react'

interface AssetsSectionProps {
  stats: AssetStats
}

export function AssetsSection({ stats }: AssetsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Box className="h-5 w-5" />
        Activos
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Activos"
          value={stats.total}
          icon={Box}
          description="Todos los activos"
        />
        <StatCard
          title="Operativos"
          value={stats.operational}
          icon={CheckCircle}
          description="Funcionando normalmente"
        />
        <StatCard
          title="En Mantenimiento"
          value={stats.inMaintenance}
          icon={Wrench}
          description="Bajo mantenimiento"
        />
        <StatCard
          title="Disponibilidad"
          value={`${stats.availabilityRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Tasa de disponibilidad"
        />
      </div>
    </div>
  )
}
