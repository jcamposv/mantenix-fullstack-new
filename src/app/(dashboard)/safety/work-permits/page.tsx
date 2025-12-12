/**
 * Work Permits Page
 *
 * Safety page for managing work permits (OSHA compliance).
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
import { WorkPermitsFilters } from '@/components/workflow/work-permits-filters'
import { Calendar } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/common/table-actions'
import { PermitStatusBadge } from '@/components/workflow/permit-status-badge'
import { PermitTypeBadge } from '@/components/workflow/permit-type-badge'
import type { WorkPermitWithRelations } from '@/types/work-permit.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useWorkPermits,
  type WorkPermitFilters,
} from '@/hooks/use-work-permits'

export default function WorkPermitsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<WorkPermitFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permitToDelete, setPermitToDelete] =
    useState<WorkPermitWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { workPermits, loading, total, totalPages, refetch } =
    useWorkPermits({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/safety/work-permits/new')
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/safety/work-permits/${id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/safety/work-permits/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (permit: WorkPermitWithRelations) => {
    setPermitToDelete(permit)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!permitToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/work-permits/${permitToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Permiso de trabajo eliminado exitosamente')
        setDeleteDialogOpen(false)
        setPermitToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el permiso de trabajo')
      }
    } catch (error) {
      console.error('Error deleting work permit:', error)
      toast.error('Error al eliminar el permiso de trabajo')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<WorkPermitWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'permitType',
        header: 'Tipo',
        cell: ({ row }) => {
          const permit = row.original
          return <PermitTypeBadge permitType={permit.permitType} />
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const permit = row.original
          return <PermitStatusBadge status={permit.status} />
        },
      },
      {
        accessorKey: 'location',
        header: 'Ubicación',
        cell: ({ row }) => {
          const permit = row.original
          return (
            <span className="text-sm truncate max-w-[150px]">
              {permit.location}
            </span>
          )
        },
      },
      {
        accessorKey: 'validFrom',
        header: 'Válido Desde',
        cell: ({ row }) => {
          const permit = row.original
          if (!permit.validFrom) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(permit.validFrom).toLocaleDateString()}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'validUntil',
        header: 'Válido Hasta',
        cell: ({ row }) => {
          const permit = row.original
          if (!permit.validUntil) return <span className="text-muted-foreground">N/A</span>
          return (
            <span className="text-sm">
              {new Date(permit.validUntil).toLocaleDateString()}
            </span>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const permit = row.original
          const actions = [
            createViewAction(() => handleView(permit.id)),
            createEditAction(() => handleEdit(permit.id)),
            createDeleteAction(() => handleDelete(permit)),
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
    if (filters.permitType) count++
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
        data={workPermits}
        searchKey="location"
        searchPlaceholder="Buscar permisos..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Permisos de Trabajo"
        description={`${total} permisos | Cumplimiento OSHA`}
        onAdd={handleAdd}
        addLabel="Crear Permiso"
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
            <WorkPermitsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Permiso de Trabajo"
        description={`¿Está seguro que desea eliminar este permiso?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
