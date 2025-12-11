/**
 * Job Safety Analyses Page
 *
 * Safety page for managing Job Safety Analyses (JSA).
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
import { JobSafetyAnalysesFilters } from '@/components/workflow/job-safety-analyses-filters'
import { User, List } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/common/table-actions'
import { JSAStatusBadge } from '@/components/workflow/jsa-status-badge'
import type { JobSafetyAnalysisWithRelations } from '@/types/job-safety-analysis.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useJobSafetyAnalyses,
  type JobSafetyAnalysisFilters,
} from '@/hooks/use-job-safety-analyses'

export default function JobSafetyAnalysesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<JobSafetyAnalysisFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jsaToDelete, setJsaToDelete] =
    useState<JobSafetyAnalysisWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { jobSafetyAnalyses, loading, total, totalPages, refetch } =
    useJobSafetyAnalyses({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/safety/job-safety-analyses/new')
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/safety/job-safety-analyses/${id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/safety/job-safety-analyses/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (jsa: JobSafetyAnalysisWithRelations) => {
    setJsaToDelete(jsa)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!jsaToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/job-safety-analyses/${jsaToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('JSA eliminado exitosamente')
        setDeleteDialogOpen(false)
        setJsaToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el JSA')
      }
    } catch (error) {
      console.error('Error deleting JSA:', error)
      toast.error('Error al eliminar el JSA')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<JobSafetyAnalysisWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'workOrder',
        header: 'Trabajo',
        cell: ({ row }) => {
          const jsa = row.original
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">
                {jsa.workOrder?.title || jsa.workOrder?.code || 'N/A'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const jsa = row.original
          return <JSAStatusBadge status={jsa.status} />
        },
      },
      {
        accessorKey: 'preparer',
        header: 'Preparado Por',
        cell: ({ row }) => {
          const jsa = row.original
          if (!jsa.preparer) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{jsa.preparer.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'jobSteps',
        header: 'Pasos',
        cell: ({ row }) => {
          const jsa = row.original
          return (
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{jsa.jobSteps?.length || 0}</span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const jsa = row.original
          const actions = [
            createViewAction(() => handleView(jsa.id)),
            createEditAction(() => handleEdit(jsa.id)),
            createDeleteAction(() => handleDelete(jsa)),
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
        data={jobSafetyAnalyses}
        searchKey="id"
        searchPlaceholder="Buscar JSA..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Análisis de Seguridad del Trabajo (JSA)"
        description={`${total} análisis | Identificación de riesgos por tarea`}
        onAdd={handleAdd}
        addLabel="Crear JSA"
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
            <JobSafetyAnalysesFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar JSA"
        description={`¿Está seguro que desea eliminar este JSA?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
