/**
 * Maintenance Type Chart Component
 *
 * Shows distribution of Preventive vs Corrective maintenance
 * Key metric for maintenance strategy effectiveness
 *
 * Under 150 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Wrench, AlertTriangle, Calendar } from 'lucide-react'

interface MaintenanceTypeChartProps {
  data?: {
    planned: number
    unplanned: number
  }
  loading?: boolean
}

export function MaintenanceTypeChart({ data, loading }: MaintenanceTypeChartProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tipo de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (!data || (data.planned === 0 && data.unplanned === 0)) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tipo de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.planned + data.unplanned
  const plannedPercentage = ((data.planned / total) * 100).toFixed(1)
  const unplannedPercentage = ((data.unplanned / total) * 100).toFixed(1)

  // Industry best practice: >70% preventive is good
  const isGoodRatio = (data.planned / total) >= 0.7

  const chartData = [
    {
      name: 'Preventivo',
      value: data.planned,
      percentage: plannedPercentage,
      color: 'hsl(var(--success))'
    },
    {
      name: 'Correctivo',
      value: data.unplanned,
      percentage: unplannedPercentage,
      color: 'hsl(var(--warning))'
    }
  ]

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tipo de Mantenimiento
          </CardTitle>
          <Badge variant={isGoodRatio ? 'default' : 'secondary'}>
            {isGoodRatio ? 'Óptimo' : 'Mejorable'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Distribución preventivo vs correctivo
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-sm">{data.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.value} órdenes ({data.percentage}%)
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-start gap-2 p-3 bg-success/5 rounded-lg border border-success/20">
            <Calendar className="h-4 w-4 text-success mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success">Preventivo</p>
              <p className="text-xs text-muted-foreground">{data.planned} órdenes</p>
              <p className="text-lg font-bold text-success">{plannedPercentage}%</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-warning/5 rounded-lg border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Correctivo</p>
              <p className="text-xs text-muted-foreground">{data.unplanned} órdenes</p>
              <p className="text-lg font-bold text-warning">{unplannedPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {!isGoodRatio && (
          <div className="mt-3 p-2 bg-info/5 rounded-md border border-info/20">
            <p className="text-xs text-info">
              💡 Meta: Mantener &gt;70% de mantenimiento preventivo para reducir costos y mejorar disponibilidad
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
