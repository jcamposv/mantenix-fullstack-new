/**
 * Inventory Section Component
 *
 * Displays inventory statistics.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { StatCard } from '../stat-card'
import type { InventoryStats } from '@/server/services/dashboard.service'
import { Package, AlertTriangle, TrendingUp } from 'lucide-react'

interface InventorySectionProps {
  stats: InventoryStats
}

export function InventorySection({ stats }: InventorySectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Inventario
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          description="Items en inventario"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStock}
          icon={AlertTriangle}
          description="Bajo punto de reorden"
        />
        <StatCard
          title="Sin Stock"
          value={stats.outOfStock}
          icon={AlertTriangle}
          description="Requiere reabastecimiento"
          className="border-red-200"
        />
        <StatCard
          title="Valor Total"
          value={`$${(stats.totalValue / 1000).toFixed(1)}K`}
          icon={TrendingUp}
          description="Valor en inventario"
        />
      </div>
    </div>
  )
}
