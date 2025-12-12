/**
 * LOTO Procedures Page
 *
 * Safety page for managing Lock-Out/Tag-Out procedures (OSHA 1910.147).
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
import { LotoProceduresFilters } from '@/components/workflow/loto-procedures-filters'
import { Lock, User, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/common/table-actions'
import { LOTOStatusBadge } from '@/components/workflow/loto-status-badge'
import type { LOTOProcedureWithRelations } from '@/types/loto-procedure.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useLOTOProcedures,
  type LOTOProcedureFilters,
} from '@/hooks/use-loto-procedures'

export default function LotoProceduresPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<LOTOProcedureFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [procedureToDelete, setProcedureToDelete] =
    useState<LOTOProcedureWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { lotoProcedures, loading, total, totalPages, refetch } =
    useLOTOProcedures({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/safety/loto-procedures/new')
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/safety/loto-procedures/${id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/safety/loto-procedures/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (procedure: LOTOProcedureWithRelations) => {
    setProcedureToDelete(procedure)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!procedureToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/loto-procedures/${procedureToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Procedimiento LOTO eliminado exitosamente')
        setDeleteDialogOpen(false)
        setProcedureToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el procedimiento LOTO')
      }
    } catch (error) {
      console.error('Error deleting LOTO procedure:', error)
      toast.error('Error al eliminar el procedimiento LOTO')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<LOTOProcedureWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const procedure = row.original
          return <LOTOStatusBadge status={procedure.status} />
        },
      },
      {
        accessorKey: 'asset',
        header: 'Equipo',
        cell: ({ row }) => {
          const procedure = row.original
          if (!procedure.asset) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{procedure.asset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {procedure.asset.assetTag}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'authorized',
        header: 'Autorizado Por',
        cell: ({ row }) => {
          const procedure = row.original
          if (!procedure.authorized) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{procedure.authorized.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'appliedAt',
        header: 'Aplicado',
        cell: ({ row }) => {
          const procedure = row.original
          if (!procedure.appliedAt) return <span className="text-muted-foreground">Pendiente</span>
          return (
            <span className="text-sm">
              {new Date(procedure.appliedAt).toLocaleDateString()}
            </span>
          )
        },
      },
      {
        accessorKey: 'lockSerialNumbers',
        header: 'Dispositivos',
        cell: ({ row }) => {
          const procedure = row.original
          return (
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{procedure.lockSerialNumbers?.length || 0}</span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const procedure = row.original
          const actions = [
            createViewAction(() => handleView(procedure.id)),
            createEditAction(() => handleEdit(procedure.id)),
            createDeleteAction(() => handleDelete(procedure)),
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
        data={lotoProcedures}
        searchKey="id"
        searchPlaceholder="Buscar procedimientos..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Procedimientos LOTO"
        description={`${total} procedimientos | OSHA 1910.147`}
        onAdd={handleAdd}
        addLabel="Crear Procedimiento"
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
            <LotoProceduresFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Procedimiento LOTO"
        description={`¿Está seguro que desea eliminar este procedimiento?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
