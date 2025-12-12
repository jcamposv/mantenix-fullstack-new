/**
 * MTBF Alerts Component
 *
 * Displays predictive maintenance alerts based on MTBF and inventory stock.
 * Integrates with existing dashboard alert system.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Under 200 lines
 * - Type-safe
 * - Clean component composition
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { useMTBFAlerts } from '@/hooks/use-mtbf-alerts'
import { MTBFAlertCard } from './mtbf-alert-card'

interface MTBFAlertsProps {
  limit?: number
  criticalOnly?: boolean
  autoRefresh?: boolean
}

/**
 * MTBF Alerts Display Component
 */
export function MTBFAlerts({
  limit = 10,
  criticalOnly = false,
  autoRefresh = false,
}: MTBFAlertsProps) {
  const { alerts, loading, error } = useMTBFAlerts({
    limit,
    criticalOnly,
    autoRefresh,
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Alertas de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando alertas...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Alertas de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay alertas de mantenimiento pendientes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Alertas de Mantenimiento ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <MTBFAlertCard key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  )
}
