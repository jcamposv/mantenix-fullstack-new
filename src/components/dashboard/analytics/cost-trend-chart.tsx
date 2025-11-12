"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CostTrendChartProps {
  data: Array<{
    date: string
    totalCost?: number
    preventive?: number
    corrective?: number
    repair?: number
  }>
  trend?: {
    trend: "up" | "down" | "stable"
    percentageChange: number
  }
  loading?: boolean
}

/**
 * Cost Trend Chart Component
 *
 * Displays cost trends over time with breakdown by maintenance type
 */
export function CostTrendChart({ data, trend, loading = false }: CostTrendChartProps) {
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Tendencia de Costos
          </CardTitle>
          <CardDescription>
            Costos de mantenimiento en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No hay datos de costos en este período
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{formatDate(label)}</p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tendencia de Costos
            </CardTitle>
            <CardDescription>
              Desglose de costos por tipo de mantenimiento
            </CardDescription>
          </div>
          {trend && trend.trend !== "stable" && (
            <Badge variant={trend.trend === "down" ? "success" : "destructive"}>
              {trend.trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend.percentageChange).toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPreventive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCorrective" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRepair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={(value) => `₡${(value / 1000).toFixed(0)}k`}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="preventive"
              name="Preventivo"
              stroke="hsl(var(--chart-1))"
              fillOpacity={1}
              fill="url(#colorPreventive)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="corrective"
              name="Correctivo"
              stroke="hsl(var(--chart-2))"
              fillOpacity={1}
              fill="url(#colorCorrective)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="repair"
              name="Reparación"
              stroke="hsl(var(--chart-3))"
              fillOpacity={1}
              fill="url(#colorRepair)"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
