/**
 * Analytics KPI Cards Component
 *
 * Displays key performance indicators for MTBF analytics.
 * Following Next.js Expert standards:
 * - Small, focused component (< 150 lines)
 * - Type-safe props
 * - Reusable UI primitives
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, Info, Clock, TrendingUp } from 'lucide-react'

interface AnalyticsKPICardsProps {
  data: {
    totalAlerts: number
    critical: number
    warnings: number
    info: number
    averageResponseTime: number
    effectiveness: number
  }
}

/**
 * Format hours to readable string
 */
function formatResponseTime(hours: number): string {
  if (hours < 24) {
    return `${Math.round(hours)}h`
  }
  const days = Math.round(hours / 24)
  return `${days}d`
}

/**
 * Analytics KPI Cards Component
 */
export function AnalyticsKPICards({ data }: AnalyticsKPICardsProps) {
  type CardVariant = 'default' | 'critical' | 'warning' | 'info' | 'success'

  const cards: Array<{
    title: string
    value: string | number
    subtitle: string
    icon: React.ReactNode
    variant: CardVariant
  }> = [
    {
      title: 'Total Alertas',
      value: data.totalAlerts,
      subtitle: data.totalAlerts === 0 ? 'Sin alertas activas' : 'Alertas activas',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'default',
    },
    {
      title: 'Alertas Críticas',
      value: data.critical,
      subtitle: data.critical > 0 ? '🔴 Requieren atención inmediata' : 'Sin críticas',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: data.critical > 0 ? 'critical' : 'default',
    },
    {
      title: 'Advertencias',
      value: data.warnings,
      subtitle: data.warnings > 0 ? '⚠️ Planificar mantenimiento' : 'Sin advertencias',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: data.warnings > 0 ? 'warning' : 'default',
    },
    {
      title: 'Informativas',
      value: data.info,
      subtitle: data.info > 0 ? 'ℹ️ Monitoreo preventivo' : 'Sin info',
      icon: <Info className="h-4 w-4" />,
      variant: data.info > 0 ? 'info' : 'default',
    },
    {
      title: 'Tiempo Promedio',
      value: formatResponseTime(data.averageResponseTime),
      subtitle: 'Hasta mantenimiento requerido',
      icon: <Clock className="h-4 w-4" />,
      variant: 'default',
    },
    {
      title: 'Efectividad',
      value: `${data.effectiveness}%`,
      subtitle: 'Alertas atendidas',
      icon: <TrendingUp className="h-4 w-4" />,
      variant: data.effectiveness >= 70 ? 'success' : 'warning',
    },
  ]

  const variantClasses = {
    default: 'border-gray-200',
    critical: 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20',
    warning: 'border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20',
    info: 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20',
    success: 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20',
  }

  const iconColors = {
    default: 'text-gray-600',
    critical: 'text-red-600 dark:text-red-400',
    warning: 'text-orange-600 dark:text-orange-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className={variantClasses[card.variant]}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={iconColors[card.variant]}>{card.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
