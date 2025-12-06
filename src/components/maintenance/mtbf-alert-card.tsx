/**
 * MTBF Alert Card Component
 *
 * Individual alert card for displaying maintenance alert details.
 * Follows Next.js Expert standards: small, focused component.
 */

import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'

interface MTBFAlertCardProps {
  alert: MaintenanceAlert
}

/**
 * Individual Alert Card Component
 */
export function MTBFAlertCard({ alert }: MTBFAlertCardProps) {
  const SeverityIcon = {
    CRITICAL: AlertCircle,
    WARNING: AlertTriangle,
    INFO: Info,
  }[alert.severity]

  const severityColor = {
    CRITICAL: 'text-destructive',
    WARNING: 'text-orange-600',
    INFO: 'text-blue-600',
  }[alert.severity]

  const badgeVariant = {
    CRITICAL: 'destructive',
    WARNING: 'outline',
    INFO: 'secondary',
  }[alert.severity] as 'destructive' | 'outline' | 'secondary'

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <SeverityIcon className={`h-5 w-5 mt-0.5 ${severityColor}`} />

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{alert.componentName}</p>
            {alert.partNumber && (
              <p className="text-xs text-muted-foreground">{alert.partNumber}</p>
            )}
          </div>
          <Badge variant={badgeVariant}>{alert.severity}</Badge>
        </div>

        <p className="text-sm">{alert.message}</p>
        <p className="text-xs text-muted-foreground">{alert.recommendation}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Stock: {alert.currentStock}/{alert.minimumStock}
          </span>
          <span>Mant. en {alert.daysUntilMaintenance}d</span>
          <span>Lead time: {alert.leadTimeDays}d</span>
          {alert.criticality && (
            <Badge variant="outline" className="text-xs">
              Criticidad {alert.criticality}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
