import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Activity, AlertTriangle, XCircle, Factory } from 'lucide-react'
import type { ProductionLineWithRelations } from '@/types/production-line.types'

interface ProductionLineStatsProps {
  productionLine: ProductionLineWithRelations
}

/**
 * Calculate production line statistics
 */
function calculateStats(productionLine: ProductionLineWithRelations) {
  const totalAssets = productionLine._count?.assets || 0
  const operational =
    productionLine.assets?.filter((a) => a.asset.status === 'OPERATIVO')
      .length || 0
  const maintenance =
    productionLine.assets?.filter((a) => a.asset.status === 'EN_MANTENIMIENTO')
      .length || 0
  const outOfService =
    productionLine.assets?.filter((a) => a.asset.status === 'FUERA_DE_SERVICIO')
      .length || 0

  const healthPercentage =
    totalAssets > 0 ? Math.round((operational / totalAssets) * 100) : 0

  return {
    totalAssets,
    operational,
    maintenance,
    outOfService,
    healthPercentage,
  }
}

/**
 * Production Line Stats Component
 * Displays KPI cards with visual indicators
 */
export function ProductionLineStats({
  productionLine,
}: ProductionLineStatsProps) {
  const stats = calculateStats(productionLine)

  const statCards = [
    {
      title: 'Total Activos',
      value: stats.totalAssets,
      icon: Factory,
      color: 'text-foreground',
      bgColor: 'bg-muted/10',
    },
    {
      title: 'Operativos',
      value: stats.operational,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      percentage: stats.totalAssets > 0
        ? Math.round((stats.operational / stats.totalAssets) * 100)
        : 0,
    },
    {
      title: 'En Mantenimiento',
      value: stats.maintenance,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
      percentage: stats.totalAssets > 0
        ? Math.round((stats.maintenance / stats.totalAssets) * 100)
        : 0,
    },
    {
      title: 'Fuera de Servicio',
      value: stats.outOfService,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      percentage: stats.totalAssets > 0
        ? Math.round((stats.outOfService / stats.totalAssets) * 100)
        : 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                {stat.percentage !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{stat.percentage}% del total</span>
                    </div>
                    <Progress
                      value={stat.percentage}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
