/**
 * Root Cause Analyses Page
 *
 * Quality page for managing Root Cause Analysis (ISO 9001/55001 compliance).
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
import { RootCauseAnalysesFilters } from '@/components/workflow/root-cause-analyses-filters'
import { User, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/common/table-actions'
import { RCAStatusBadge } from '@/components/workflow/rca-status-badge'
import { RCATypeBadge } from '@/components/workflow/rca-type-badge'
import type { RootCauseAnalysisWithRelations } from '@/types/root-cause-analysis.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useRootCauseAnalyses,
  type RootCauseAnalysisFilters,
} from '@/hooks/use-root-cause-analyses'

export default function RootCauseAnalysesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<RootCauseAnalysisFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rcaToDelete, setRcaToDelete] =
    useState<RootCauseAnalysisWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { rootCauseAnalyses, loading, total, totalPages, refetch } =
    useRootCauseAnalyses({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/quality/root-cause-analyses/new')
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/quality/root-cause-analyses/${id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/quality/root-cause-analyses/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (rca: RootCauseAnalysisWithRelations) => {
    setRcaToDelete(rca)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!rcaToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/root-cause-analyses/${rcaToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('RCA eliminado exitosamente')
        setDeleteDialogOpen(false)
        setRcaToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el RCA')
      }
    } catch (error) {
      console.error('Error deleting RCA:', error)
      toast.error('Error al eliminar el RCA')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<RootCauseAnalysisWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'failureMode',
        header: 'Modo de Falla',
        cell: ({ row }) => {
          const rca = row.original
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{rca.failureMode}</div>
            </div>
          )
        },
      },
      {
        accessorKey: 'analysisType',
        header: 'Tipo',
        cell: ({ row }) => {
          const rca = row.original
          return <RCATypeBadge analysisType={rca.analysisType} />
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const rca = row.original
          return <RCAStatusBadge status={rca.status} />
        },
      },
      {
        accessorKey: 'workOrder',
        header: 'OT',
        cell: ({ row }) => {
          const rca = row.original
          if (!rca.workOrder) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{rca.workOrder.code}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'analyzer',
        header: 'Analista',
        cell: ({ row }) => {
          const rca = row.original
          if (!rca.analyzer) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{rca.analyzer.name}</span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const rca = row.original
          const actions = [
            createViewAction(() => handleView(rca.id)),
            createEditAction(() => handleEdit(rca.id)),
            createDeleteAction(() => handleDelete(rca)),
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
    if (filters.analysisType) count++
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
        data={rootCauseAnalyses}
        searchKey="failureMode"
        searchPlaceholder="Buscar RCA..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Análisis de Causa Raíz (RCA)"
        description={`${total} análisis | ISO 9001/55001`}
        onAdd={handleAdd}
        addLabel="Crear RCA"
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
            <RootCauseAnalysesFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar RCA"
        description={`¿Está seguro que desea eliminar este RCA?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
