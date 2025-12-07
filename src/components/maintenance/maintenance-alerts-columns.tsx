/**
 * Maintenance Alerts Table Columns
 *
 * Column definitions for maintenance alerts DataTable.
 *
 * Following Next.js Expert standards:
 * - Extracted from main component to keep under 200 lines
 * - Type-safe
 */

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { TableActions } from '@/components/common/table-actions'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'
import {
  getAlertStockStatus,
  getStockStatusVariant,
  getStockStatusLabel,
} from '@/hooks/use-maintenance-alerts-management'
import { Eye, Wrench, Clock, Package } from 'lucide-react'

export function getMaintenanceAlertsColumns(
  onViewComponent: (componentId: string) => void,
  onCreateWorkOrder: (alert: MaintenanceAlert) => void
): ColumnDef<MaintenanceAlert>[] {
  return [
    {
      accessorKey: 'componentName',
      header: 'Componente',
      cell: ({ row }) => {
        const alert = row.original
        return (
          <div className="flex items-start space-x-3 min-w-0">
            <div className="text-lg flex-shrink-0">
              {alert.severity === 'CRITICAL' ? '🔴' : '⚠️'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{alert.componentName}</div>
              {alert.partNumber && (
                <div className="text-sm text-muted-foreground">
                  P/N: {alert.partNumber}
                </div>
              )}
              {alert.criticality && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Criticidad {alert.criticality}
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'daysUntilMaintenance',
      header: 'Días hasta Falla',
      cell: ({ row }) => {
        const days = row.original.daysUntilMaintenance
        const variant =
          days <= 7 ? 'destructive' : days <= 30 ? 'warning' : 'secondary'
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Badge variant={variant}>{days} días</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock',
      cell: ({ row }) => {
        const alert = row.original
        const status = getAlertStockStatus(alert)
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <Badge variant={getStockStatusVariant(status)}>
                {getStockStatusLabel(status)}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">
                {alert.currentStock} / {alert.minimumStock} mín
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'leadTimeDays',
      header: 'Lead Time',
      cell: ({ row }) => {
        const days = row.original.leadTimeDays
        return (
          <span className="text-sm">
            {days} {days === 1 ? 'día' : 'días'}
          </span>
        )
      },
    },
    {
      accessorKey: 'message',
      header: 'Alerta',
      cell: ({ row }) => {
        const alert = row.original
        return (
          <div className="max-w-md">
            <p className="text-sm line-clamp-2">{alert.message}</p>
            {alert.recommendation && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                💡 {alert.recommendation}
              </p>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const alert = row.original
        const actions = [
          {
            label: 'Ver Componente',
            icon: Eye,
            onClick: () => onViewComponent(alert.componentId),
          },
          {
            label: 'Crear OT',
            icon: Wrench,
            onClick: () => onCreateWorkOrder(alert),
          },
        ]

        return <TableActions actions={actions} />
      },
    },
  ]
}
