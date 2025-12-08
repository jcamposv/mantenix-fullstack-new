/**
 * Analytics Distribution Component
 *
 * Pie chart showing alert distribution by criticality.
 * Following Next.js Expert standards:
 * - Separate file (< 150 lines)
 * - Type-safe props
 * - Uses Recharts
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { CriticalityDistribution } from '@/types/maintenance-analytics.types'

interface AnalyticsDistributionProps {
  distribution: CriticalityDistribution
}

/**
 * Colors for each criticality level
 */
const COLORS = {
  A: '#ef4444', // red
  B: '#f97316', // orange
  C: '#10b981', // green
}

const LABELS = {
  A: 'A - Crítico',
  B: 'B - Importante',
  C: 'C - Normal',
}

/**
 * Analytics Distribution Component
 */
export function AnalyticsDistribution({ distribution }: AnalyticsDistributionProps) {
  // Transform data for chart
  const data = [
    { name: LABELS.A, value: distribution.A, criticality: 'A' },
    { name: LABELS.B, value: distribution.B, criticality: 'B' },
    { name: LABELS.C, value: distribution.C, criticality: 'C' },
  ].filter(item => item.value > 0) // Only show non-zero values

  const total = distribution.A + distribution.B + distribution.C

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Criticidad</CardTitle>
          <CardDescription>Alertas por nivel de criticidad</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay alertas activas para mostrar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Criticidad</CardTitle>
        <CardDescription>
          Alertas clasificadas según ISO 14224
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: unknown) => {
                const { name, percent } = props as { name: string; percent: number }
                return `${name}: ${(percent * 100).toFixed(0)}%`
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.criticality}`}
                  fill={COLORS[entry.criticality as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value} alerta${value !== 1 ? 's' : ''}`,
                '',
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Críticas (A)', value: distribution.A, color: 'text-red-600' },
            { label: 'Importantes (B)', value: distribution.B, color: 'text-orange-600' },
            { label: 'Normales (C)', value: distribution.C, color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
