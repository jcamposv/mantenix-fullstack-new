/**
 * Maintenance Alerts Summary Component
 *
 * Displays summary statistics for maintenance alerts.
 *
 * Following Next.js Expert standards:
 * - Under 200 lines
 * - Type-safe
 * - Clean composition
 */

import { Card, CardContent } from '@/components/ui/card'
import type { PaginatedAlertsResponse } from '@/types/maintenance-alert.types'
import { AlertTriangle, AlertCircle, Info, Activity } from 'lucide-react'

interface MaintenanceAlertsSummaryProps {
  summary: PaginatedAlertsResponse['summary'] | null
}

export function MaintenanceAlertsSummary({
  summary,
}: MaintenanceAlertsSummaryProps) {
  if (!summary) return null

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Total Alertas</p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-destructive">
                {summary.critical}
              </div>
              <p className="text-xs text-muted-foreground">Críticas</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-warning">
                {summary.warnings}
              </div>
              <p className="text-xs text-muted-foreground">Advertencias</p>
            </div>
            <AlertCircle className="h-8 w-8 text-warning opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-info">
                {summary.info}
              </div>
              <p className="text-xs text-muted-foreground">Informativas</p>
            </div>
            <Info className="h-8 w-8 text-info opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
