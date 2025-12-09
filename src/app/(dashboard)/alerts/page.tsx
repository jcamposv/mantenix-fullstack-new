/**
 * Alerts Management Page
 *
 * Comprehensive view of all system alerts with server-side pagination and filtering.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - SWR for data fetching with auto-refresh
 * - Type-safe
 * - Clean component composition (under 200 lines)
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { AlertsFilters } from '@/components/alerts/alerts-filters'
import { Eye, Clock, MapPin, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { alertTypes, alertPriorities } from '@/schemas/alert'
import { useAlertUpdates } from '@/hooks/useAlertUpdates'
import { UserAvatar } from '@/components/common/user-avatar'
import { TableActions } from '@/components/common/table-actions'
import {
  useAlertsManagement,
  type AlertManagementFilters,
  type AlertItem,
} from '@/hooks/use-alerts-management'

export default function AlertsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AlertManagementFilters>({})
  const limit = 20

  const { alerts, loading, total, totalPages, refetch } = useAlertsManagement({
    page,
    limit,
    filters,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  })

  // Listen for real-time alert updates
  useAlertUpdates({
    onRefreshNeeded: refetch,
  })

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = alertPriorities.find((p) => p.value === priority)
    if (!priorityConfig) return priority

    const variants = {
      LOW: 'secondary',
      MEDIUM: 'default',
      HIGH: 'outline',
      CRITICAL: 'destructive',
    } as const

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'default'}>
        {priorityConfig.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      OPEN: 'destructive',
      IN_PROGRESS: 'default',
      RESOLVED: 'secondary',
      CLOSED: 'outline',
    } as const

    const labels = {
      OPEN: 'Abierta',
      IN_PROGRESS: 'En Progreso',
      RESOLVED: 'Resuelta',
      CLOSED: 'Cerrada',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const alertType = alertTypes.find((t) => t.value === type)
    return alertType?.icon || '❓'
  }

  const getTypeLabel = (type: string) => {
    const alertType = alertTypes.find((t) => t.value === type)
    return alertType?.label || type
  }

  const handleView = useCallback(
    (alertId: string) => {
      router.push(`/alerts/${alertId}`)
    },
    [router]
  )

  const columns: ColumnDef<AlertItem>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Alerta',
        cell: ({ row }) => {
          const alert = row.original
          return (
            <div className="flex items-start space-x-3 min-w-0">
              <div className="text-lg flex-shrink-0">
                {getTypeIcon(alert.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{alert.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {alert.description}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getTypeLabel(alert.type)}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'priority',
        header: 'Prioridad',
        cell: ({ row }) => getPriorityBadge(row.getValue('priority')),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'site.name',
        header: 'Sede',
        cell: ({ row }) => {
          const site = row.original.site
          return (
            <div className="flex items-center space-x-2">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{site.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'reportedBy.name',
        header: 'Reportado por',
        cell: ({ row }) => {
          const reportedBy = row.original.reportedBy
          return (
            <div className="flex items-center space-x-2">
              <UserAvatar name={reportedBy.name} size="sm" />
              <span className="truncate text-sm">{reportedBy.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'reportedAt',
        header: 'Reportada',
        cell: ({ row }) => {
          const date = new Date(row.getValue('reportedAt'))
          return (
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">
                {formatDistanceToNow(date, { addSuffix: true, locale: es })}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: '_count.comments',
        header: 'Comentarios',
        cell: ({ row }) => {
          const count = row.original._count.comments
          if (count === 0) return null
          return (
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{count}</span>
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
              label: 'Ver detalles',
              icon: Eye,
              onClick: () => handleView(alert.id),
            },
          ]

          return <TableActions actions={actions} />
        },
      },
    ],
    [handleView]
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.status) count++
    if (filters.priority) count++
    if (filters.type) count++
    if (filters.my) count++
    if (filters.startDate || filters.endDate) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  return (
    <div className="container mx-auto py-0">
      <DataTable
        columns={columns}
        data={alerts}
        searchKey="title"
        searchPlaceholder="Buscar alertas..."
        title="Todas las Alertas"
        description={`${total} alertas | Filtre por estado, prioridad y más`}
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Alertas"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[600px]"
          >
            <AlertsFilters filters={filters} onFiltersChange={setFilters} />
          </FilterButton>
        }
      />
    </div>
  )
}
