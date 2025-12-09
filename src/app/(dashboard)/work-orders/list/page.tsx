/**
 * Work Orders List Page
 *
 * Comprehensive view of all work orders with server-side pagination and filtering.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - SWR for data fetching
 * - Type-safe
 * - Clean component composition (under 300 lines)
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { WorkOrdersFilters } from '@/components/work-orders/work-orders-filters'
import { User, Building, Wrench, Clock } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
  createPrintAction,
} from '@/components/common/table-actions'
import { WorkOrderStatusBadge } from '@/components/work-orders/work-order-status-badge'
import { WorkOrderPriorityBadge } from '@/components/work-orders/work-order-priority-badge'
import { WorkOrderTypeBadge } from '@/components/work-orders/work-order-type-badge'
import type { WorkOrderWithRelations } from '@/types/work-order.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useWorkOrdersManagement,
  type WorkOrderManagementFilters,
} from '@/hooks/use-work-orders-management'

export default function WorkOrdersListPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<WorkOrderManagementFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workOrderToDelete, setWorkOrderToDelete] =
    useState<WorkOrderWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { workOrders, loading, total, totalPages, refetch } =
    useWorkOrdersManagement({
      page,
      limit,
      filters,
      autoRefresh: false,
    })

  // Configuración inicial de visibilidad de columnas
  const initialColumnVisibility = {
    number: false, // Ocultar columna "Orden"
    asset: false, // Ocultar columna "Activo"
  }

  const handleAddWorkOrder = () => {
    router.push('/work-orders/new/select-template')
  }

  const handleView = useCallback(
    (workOrderId: string) => {
      router.push(`/work-orders/${workOrderId}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (workOrderId: string) => {
      router.push(`/work-orders/${workOrderId}/edit`)
    },
    [router]
  )

  const handleDelete = (workOrder: WorkOrderWithRelations) => {
    setWorkOrderToDelete(workOrder)
    setDeleteDialogOpen(true)
  }

  const handlePrint = (workOrderId: string) => {
    // Open work order in new window for printing
    const printUrl = `/work-orders/${workOrderId}?print=true`
    const printWindow = window.open(printUrl, '_blank')
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      })
    }
  }

  const confirmDelete = async () => {
    if (!workOrderToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/work-orders/${workOrderToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Orden de trabajo eliminada exitosamente')
        setDeleteDialogOpen(false)
        setWorkOrderToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la orden de trabajo')
      }
    } catch (error) {
      console.error('Error deleting work order:', error)
      toast.error('Error al eliminar la orden de trabajo')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<WorkOrderWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        header: 'Orden',
        cell: ({ row }) => {
          const workOrder = row.original
          return <div className="font-medium">{workOrder.number}</div>
        },
        enableHiding: true,
      },
      {
        accessorKey: 'title',
        header: 'Título',
        cell: ({ row }) => {
          const workOrder = row.original
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{workOrder.title}</div>
              <div className="text-sm text-muted-foreground truncate">
                {workOrder.description}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ row }) => {
          const workOrder = row.original
          return <WorkOrderTypeBadge type={workOrder.type} />
        },
      },
      {
        accessorKey: 'priority',
        header: 'Prioridad',
        cell: ({ row }) => {
          const workOrder = row.original
          return <WorkOrderPriorityBadge priority={workOrder.priority} />
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const workOrder = row.original
          return <WorkOrderStatusBadge status={workOrder.status} />
        },
      },
      {
        accessorKey: 'assignedTo',
        header: 'Asignado',
        cell: ({ row }) => {
          const workOrder = row.original
          if (!workOrder.assignments || workOrder.assignments.length === 0) {
            return (
              <span className="text-muted-foreground text-xs">Sin asignar</span>
            )
          }
          const firstName = workOrder.assignments[0].user.name.split(' ')[0]
          const count = workOrder.assignments.length
          return (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs truncate max-w-[80px]">
                {firstName}
                {count > 1 ? ` +${count - 1}` : ''}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'site',
        header: () => <div className="hidden lg:block">Sede</div>,
        cell: ({ row }) => {
          const workOrder = row.original
          return (
            <div className="hidden lg:flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{workOrder.site?.name || 'N/A'}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'asset',
        header: 'Activo',
        cell: ({ row }) => {
          const workOrder = row.original
          if (!workOrder.asset) {
            return <span className="text-muted-foreground">N/A</span>
          }
          return (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{workOrder.asset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {workOrder.asset.code}
                </div>
              </div>
            </div>
          )
        },
        enableHiding: true,
      },
      {
        accessorKey: 'scheduledDate',
        header: () => <div className="hidden md:block">Fecha</div>,
        cell: ({ row }) => {
          const workOrder = row.original
          if (!workOrder.scheduledDate) {
            return (
              <span className="text-muted-foreground hidden md:block">
                No programada
              </span>
            )
          }
          return (
            <div className="hidden md:flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(workOrder.scheduledDate).toLocaleDateString()}
              </span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const workOrder = row.original
          const actions = [
            createViewAction(() => handleView(workOrder.id)),
            createPrintAction(() => handlePrint(workOrder.id)),
            createEditAction(() => handleEdit(workOrder.id)),
            createDeleteAction(() => handleDelete(workOrder)),
          ]

          return <TableActions actions={actions} />
        },
      },
    ],
    [handleView, handleEdit]
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.status) count++
    if (filters.priority) count++
    if (filters.type) count++
    if (filters.assignedToMe) count++
    if (filters.createdByMe) count++
    if (filters.scheduledDateFrom || filters.scheduledDateTo) count++
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
        data={workOrders}
        searchKey="number"
        searchPlaceholder="Buscar órdenes..."
        title="Órdenes de Trabajo"
        description={`${total} órdenes | Filtre por estado, prioridad y más`}
        onAdd={handleAddWorkOrder}
        addLabel="Crear Orden"
        loading={loading}
        initialColumnVisibility={initialColumnVisibility}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Órdenes"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[700px]"
          >
            <WorkOrdersFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Orden de Trabajo"
        description={`¿Está seguro que desea eliminar la orden "${workOrderToDelete?.number}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
