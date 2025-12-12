/**
 * Sparkline Component
 *
 * Tiny line chart for showing trends in dashboard cards.
 * Uses Recharts for rendering.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 100 lines)
 * - Type-safe
 * - Minimal dependencies
 */

'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

export interface SparklineDataPoint {
  value: number
}

interface SparklineProps {
  data: SparklineDataPoint[]
  color?: string
  height?: number
  strokeWidth?: number
}

export function Sparkline({
  data,
  color = '#3b82f6',
  height = 40,
  strokeWidth = 2,
}: SparklineProps) {
  // Need at least 2 data points
  if (data.length < 2) {
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={strokeWidth}
          dot={false}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
