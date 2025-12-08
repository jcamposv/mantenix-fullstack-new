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

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  // Use default 30d period - chart shows last 30 days of data
  const { data, error, isLoading } = useSWR<TrendsResponse>(
    `/api/maintenance/analytics/trends?period=30d`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias de Alertas</CardTitle>
        <CardDescription>
          Evolución de alertas en los últimos 30 días
        </CardDescription>
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
