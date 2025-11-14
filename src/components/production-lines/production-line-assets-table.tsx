'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Activity, AlertTriangle, XCircle, Clock, Gauge, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProductionLineAssetWithAsset } from '@/types/production-line.types'

interface ProductionLineAssetsTableProps {
  assets: ProductionLineAssetWithAsset[]
}

/**
 * Production Line Assets Table Component
 * Professional table display using TanStack Table
 */
export function ProductionLineAssetsTable({
  assets,
}: ProductionLineAssetsTableProps) {
  const columns = useMemo<ColumnDef<ProductionLineAssetWithAsset>[]>(
    () => [
      {
        accessorKey: 'sequence',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Seq
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="h-8 w-8 rounded-full flex items-center justify-center font-bold"
          >
            {row.original.sequence}
          </Badge>
        ),
      },
      {
        id: 'assetName',
        accessorFn: (row) => row.asset.name,
        header: 'Activo',
        cell: ({ row }) => (
          <div className="space-y-1 min-w-[200px]">
            <div className="font-semibold">{row.original.asset.name}</div>
            <div className="text-sm text-muted-foreground font-mono">
              {row.original.asset.code}
            </div>
            {row.original.asset.location && (
              <div className="text-xs text-muted-foreground">
                📍 {row.original.asset.location}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'nodeType',
        header: 'Tipo',
        cell: ({ row }) => {
          const typeLabels: Record<string, string> = {
            machine: 'Máquina',
            buffer: 'Buffer',
            'quality-check': 'Control Calidad',
            conveyor: 'Transportador',
          }
          return (
            <Badge variant="secondary" className="text-xs">
              {typeLabels[row.original.nodeType] || row.original.nodeType}
            </Badge>
          )
        },
      },
      {
        id: 'assetStatus',
        accessorFn: (row) => row.asset.status,
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.asset.status
          const statusConfig = getStatusConfig(status)

          return (
            <Badge variant={statusConfig.variant} className="text-xs flex items-center gap-1 w-fit">
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </Badge>
          )
        },
      },
      {
        accessorKey: 'cycleTime',
        header: 'Cycle Time',
        cell: ({ row }) => {
          if (!row.original.cycleTime) return <span className="text-muted-foreground text-sm">-</span>
          return (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{row.original.cycleTime}s</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'capacity',
        header: 'Capacidad',
        cell: ({ row }) => {
          if (!row.original.capacity) return <span className="text-muted-foreground text-sm">-</span>
          return (
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{row.original.capacity}/h</span>
            </div>
          )
        },
      },
      {
        id: 'manufacturer',
        accessorFn: (row) => row.asset.manufacturer,
        header: 'Fabricante/Modelo',
        cell: ({ row }) => {
          const { manufacturer, model } = row.original.asset
          if (!manufacturer && !model) {
            return <span className="text-muted-foreground text-sm">-</span>
          }
          return (
            <div className="text-sm min-w-[150px]">
              {manufacturer && <div className="font-medium">{manufacturer}</div>}
              {model && <div className="text-muted-foreground">{model}</div>}
            </div>
          )
        },
      },
    ],
    []
  )

  const sortedAssets = useMemo(
    () => [...assets].sort((a, b) => a.sequence - b.sequence),
    [assets]
  )

  return (
    <DataTable
      columns={columns}
      data={sortedAssets}
      searchKey="assetName"
      searchPlaceholder="Buscar activos por nombre..."
    />
  )
}

/**
 * Get status configuration helper
 */
function getStatusConfig(status: string) {
  switch (status) {
    case 'OPERATIVO':
      return {
        variant: 'default' as const,
        icon: <Activity className="h-3 w-3" />,
        label: 'Operativo',
      }
    case 'EN_MANTENIMIENTO':
      return {
        variant: 'outline' as const,
        icon: <AlertTriangle className="h-3 w-3" />,
        label: 'Mantenimiento',
      }
    case 'FUERA_DE_SERVICIO':
      return {
        variant: 'destructive' as const,
        icon: <XCircle className="h-3 w-3" />,
        label: 'Fuera Servicio',
      }
    default:
      return {
        variant: 'outline' as const,
        icon: null,
        label: status,
      }
  }
}
