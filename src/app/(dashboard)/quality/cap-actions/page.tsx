/**
 * CAP Actions Page
 *
 * Quality page for managing Corrective and Preventive Actions (CAPA).
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Custom hook for data fetching
 * - Type-safe
 * - Clean component composition (under 200 lines)
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { CapActionsFilters } from '@/components/workflow/cap-actions-filters'
import { User, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/common/table-actions'
import { CAPStatusBadge } from '@/components/workflow/cap-status-badge'
import { ActionTypeBadge } from '@/components/workflow/action-type-badge'
import type { CAPActionWithRelations } from '@/types/cap-action.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useCAPActions,
  type CAPActionFilters,
} from '@/hooks/use-cap-actions'

export default function CapActionsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CAPActionFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actionToDelete, setActionToDelete] =
    useState<CAPActionWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { capActions, loading, total, totalPages, refetch } =
    useCAPActions({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/quality/cap-actions/new')
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/quality/cap-actions/${id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/quality/cap-actions/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (action: CAPActionWithRelations) => {
    setActionToDelete(action)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!actionToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/cap-actions/${actionToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Acción CAP eliminada exitosamente')
        setDeleteDialogOpen(false)
        setActionToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la acción CAP')
      }
    } catch (error) {
      console.error('Error deleting CAP action:', error)
      toast.error('Error al eliminar la acción CAP')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<CAPActionWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'description',
        header: 'Descripción',
        cell: ({ row }) => {
          const action = row.original
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{action.description}</div>
            </div>
          )
        },
      },
      {
        accessorKey: 'actionType',
        header: 'Tipo',
        cell: ({ row }) => {
          const action = row.original
          return <ActionTypeBadge actionType={action.actionType} />
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const action = row.original
          return <CAPStatusBadge status={action.status} />
        },
      },
      {
        accessorKey: 'assigned',
        header: 'Responsable',
        cell: ({ row }) => {
          const action = row.original
          if (!action.assigned) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{action.assigned.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'dueDate',
        header: 'Vencimiento',
        cell: ({ row }) => {
          const action = row.original
          if (!action.dueDate) return <span className="text-muted-foreground">Sin fecha</span>
          const dueDate = new Date(action.dueDate)
          const isOverdue = dueDate < new Date() && action.status !== 'CLOSED' && action.status !== 'VERIFIED'
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`text-sm ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                {dueDate.toLocaleDateString()}
              </span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const action = row.original
          const actions = [
            createViewAction(() => handleView(action.id)),
            createEditAction(() => handleEdit(action.id)),
            createDeleteAction(() => handleDelete(action)),
          ]

          return <TableActions actions={actions} />
        },
      },
    ],
    [handleView, handleEdit]
  )

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.status) count++
    if (filters.actionType) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="container mx-auto py-0">
      <DataTable
        columns={columns}
        data={capActions}
        searchKey="description"
        searchPlaceholder="Buscar acciones..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Acciones Correctivas y Preventivas (CAPA)"
        description={`${total} acciones | Seguimiento de mejoras`}
        onAdd={handleAdd}
        addLabel="Crear Acción"
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
          >
            <CapActionsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Acción CAP"
        description={`¿Está seguro que desea eliminar esta acción?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
