/**
 * Hero Card Component
 *
 * Large KPI card for main dashboard metrics.
 * Shows value, label, trend, and status with visual hierarchy.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline, type SparklineDataPoint } from './sparkline'

interface HeroCardProps {
  value: string | number
  label: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  status?: 'success' | 'warning' | 'danger' | 'neutral'
  description?: string
  sparklineData?: SparklineDataPoint[]
}

export function HeroCard({
  value,
  label,
  icon: Icon,
  trend,
  status = 'neutral',
  description,
  sparklineData,
}: HeroCardProps) {
  const statusColors = {
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50',
    danger: 'border-red-200 bg-red-50/50',
    neutral: 'border-border bg-background',
  }

  const statusTextColors = {
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    neutral: 'text-foreground',
  }

  const statusIconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    neutral: 'text-muted-foreground',
  }

  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-600'
      : trend.value < 0
      ? 'text-red-600'
      : 'text-muted-foreground'
    : ''

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : TrendingDown
    : null

  return (
    <Card className={cn('border-2', statusColors[status])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label}
            </p>
            <h3
              className={cn(
                'text-4xl font-bold tracking-tight',
                statusTextColors[status]
              )}
            >
              {value}
            </h3>
          </div>
          <div
            className={cn(
              'p-3 rounded-lg bg-background',
              statusIconColors[status]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}

        {trend && TrendIcon && (
          <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-medium">
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-muted-foreground text-xs">
              {trend.label}
            </span>
          </div>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length >= 2 && (
          <div className="mt-3 -mx-2">
            <Sparkline
              data={sparklineData}
              color={
                status === 'success'
                  ? '#10b981'
                  : status === 'warning'
                  ? '#f59e0b'
                  : status === 'danger'
                  ? '#ef4444'
                  : '#3b82f6'
              }
              height={32}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
