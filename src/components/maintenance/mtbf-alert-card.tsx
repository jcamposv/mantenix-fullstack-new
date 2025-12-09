/**
 * MTBF Alert Card Component
 *
 * Individual alert card for displaying maintenance alert details.
 * Follows Next.js Expert standards: small, focused component.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Info, X, Wrench } from 'lucide-react'
import { DismissAlertDialog } from './dismiss-alert-dialog'
import { toast } from 'sonner'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'

/**
 * Format days for display in card
 */
function formatMaintenanceDays(days: number): string {
  const absDays = Math.abs(days)

  if (days < 0) {
    return `Vencido ${absDays}d`
  } else if (days === 0) {
    return 'Hoy'
  } else {
    return `En ${absDays}d`
  }
}

interface MTBFAlertCardProps {
  alert: MaintenanceAlert
  alertHistoryId?: string // ID from database for resolve/dismiss actions
  onCreateWorkOrder?: (componentId: string) => void
  onRefresh?: () => void
}

/**
 * Individual Alert Card Component
 */
export function MTBFAlertCard({
  alert,
  alertHistoryId,
  onCreateWorkOrder,
  onRefresh
}: MTBFAlertCardProps) {
  const router = useRouter()
  const [showDismissDialog, setShowDismissDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleDismiss = async (data: { reason: string }) => {
    if (!alertHistoryId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/maintenance/alert-history/${alertHistoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'dismiss',
          reason: data.reason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al dismissar la alerta')
      }

      toast.success('Alerta dismissada', {
        description: 'La alerta ha sido dismissada exitosamente',
      })

      setShowDismissDialog(false)

      if (onRefresh) {
        onRefresh()
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al dismissar la alerta',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWorkOrder = () => {
    if (onCreateWorkOrder) {
      onCreateWorkOrder(alert.componentId)
    } else {
      router.push(`/work-orders/new/select-template?componentId=${alert.componentId}`)
    }
  }

  return (
    <>
      <div className="flex items-start gap-3 rounded-lg border p-3">
        <SeverityIcon className={`h-5 w-5 mt-0.5 ${severityColor}`} />

        <div className="flex-1 space-y-2">
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
            <span className={alert.daysUntilMaintenance < 0 ? 'text-destructive font-medium' : ''}>
              {formatMaintenanceDays(alert.daysUntilMaintenance)}
            </span>
            <span>Lead time: {alert.leadTimeDays}d</span>
            {alert.criticality && (
              <Badge variant="outline" className="text-xs">
                Criticidad {alert.criticality}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          {alertHistoryId && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleCreateWorkOrder}
              >
                <Wrench className="h-3.5 w-3.5 mr-1.5" />
                Crear OT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDismissDialog(true)}
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Dismissar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dismiss Dialog */}
      <DismissAlertDialog
        open={showDismissDialog}
        onOpenChange={setShowDismissDialog}
        onSubmit={handleDismiss}
        isLoading={isLoading}
        alertMessage={alert.message}
      />
    </>
  )
}
