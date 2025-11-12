"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MaintenancePerformanceMetrics } from "@/types/analytics.types"

interface MaintenanceMetricsChartProps {
  data: MaintenancePerformanceMetrics
  loading?: boolean
}

/**
 * Maintenance Metrics Chart Component
 *
 * Displays key maintenance performance metrics
 */
export function MaintenanceMetricsChart({
  data,
  loading = false,
}: MaintenanceMetricsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 bg-muted rounded w-32 animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 mt-2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = [
    {
      name: "Preventivo",
      value: data.preventiveCount,
      percentage: data.preventivePercentage,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Correctivo",
      value: data.correctiveCount,
      percentage: ((data.correctiveCount / data.totalWorkOrders) * 100).toFixed(1),
      color: "hsl(var(--chart-2))",
    },
    {
      name: "Reparación",
      value: data.repairCount,
      percentage: ((data.repairCount / data.totalWorkOrders) * 100).toFixed(1),
      color: "hsl(var(--chart-3))",
    },
  ]

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Cantidad:</span>
              <span className="font-medium">{data.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Porcentaje:</span>
              <span className="font-medium">{data.percentage}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Check if we're meeting the 80% preventive maintenance target
  const isTargetMet = data.preventivePercentage >= 80

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribución de Mantenimiento
            </CardTitle>
            <CardDescription>
              Preventivo vs Correctivo vs Reparación
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">
              PM Compliance
            </div>
            <Badge variant={isTargetMet ? "success" : "warning"}>
              {data.preventivePercentage.toFixed(1)}% Preventivo
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Tasa de Completación</div>
            <div className="text-2xl font-bold">{data.completionRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Completadas a Tiempo</div>
            <div className="text-2xl font-bold">{data.onTimeCompletionRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">PM Compliance</div>
            <div className="text-2xl font-bold">{data.pmComplianceRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Backlog</div>
            <div className="text-2xl font-bold">{data.backlogCount}</div>
          </div>
        </div>

        {/* Warning if preventive percentage is low */}
        {!isTargetMet && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning-foreground">
              <strong>Meta no alcanzada:</strong> El porcentaje de mantenimiento preventivo
              está por debajo del objetivo del 80%. Se recomienda incrementar las actividades
              preventivas para reducir fallas inesperadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
