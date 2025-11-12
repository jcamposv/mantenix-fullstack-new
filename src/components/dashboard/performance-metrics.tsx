"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PerformanceData {
  date: string
  completed: number
  efficiency: number
}

interface PerformanceMetricsProps {
  data: PerformanceData[]
  loading?: boolean
}

interface TooltipPayload {
  color: string
  name: string
  value: number
  dataKey: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.dataKey === 'efficiency' ? '%' : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function PerformanceMetrics({ data, loading = false }: PerformanceMetricsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Check if we have meaningful data
  const hasData = data && data.length > 0 && data.some(item => item.completed > 0 || item.efficiency > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Rendimiento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimos 7 días de actividad
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No hay datos suficientes para mostrar métricas
              </p>
              <p className="text-xs text-muted-foreground">
                Complete algunas órdenes de trabajo para ver el rendimiento
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Completadas"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Eficiencia"
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}