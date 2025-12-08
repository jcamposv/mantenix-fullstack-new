/**
 * Analytics Trends Chart Component
 *
 * Line chart showing alert trends over time.
 * Following Next.js Expert standards:
 * - Separate file (< 200 lines)
 * - Client component (uses SWR + Recharts)
 * - Type-safe
 */

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { TrendsResponse } from '@/types/maintenance-analytics.types'

/**
 * Fetcher for SWR
 */
async function fetcher(url: string): Promise<TrendsResponse> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch trends')
  return response.json()
}

/**
 * Analytics Trends Chart Component
 */
export function AnalyticsTrendsChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const { data, error, isLoading } = useSWR<TrendsResponse>(
    `/api/maintenance/analytics/trends?period=${period}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tendencias de Alertas</CardTitle>
            <CardDescription>
              Evolución de alertas en el tiempo
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7d')}
            >
              7 días
            </Button>
            <Button
              variant={period === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30d')}
            >
              30 días
            </Button>
            <Button
              variant={period === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('90d')}
            >
              90 días
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-80" />}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las tendencias
            </AlertDescription>
          </Alert>
        )}

        {data && !error && (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value as string)
                  return date.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="critical"
                name="Críticas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
              <Line
                type="monotone"
                dataKey="warnings"
                name="Advertencias"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316' }}
              />
              <Line
                type="monotone"
                dataKey="info"
                name="Informativas"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#6b7280' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
