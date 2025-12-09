/**
 * Exploded Views Table Component
 *
 * Professional table display with server-side pagination and filtering.
 * Follows Next.js Expert standards.
 */

'use client'

import { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { ExplodedViewsFilters } from './exploded-views-filters'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ArrowUpDown, Eye, Settings, Trash2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  useEVViews,
  type EVViewFilters,
} from '@/hooks/use-ev-views'
import type { AssetExplodedViewWithRelations } from '@/types/exploded-view.types'

interface ExplodedViewsTableProps {
  assetId?: string // Optional filter by asset
}

/**
 * Exploded Views Table Component with server-side pagination
 */
export function ExplodedViewsTable({ assetId }: ExplodedViewsTableProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<EVViewFilters>(() => {
    // Initialize with assetId from props if present
    return assetId ? { assetId } : {}
  })
  const limit = 20

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewToDelete, setViewToDelete] = useState<AssetExplodedViewWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { views: explodedViews, loading, totalPages, refetch } =
    useEVViews({
      page,
      limit,
      filters,
      autoRefresh: false,
    })

  const handleDeleteClick = useCallback((view: AssetExplodedViewWithRelations): void => {
    setViewToDelete(view)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!viewToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/exploded-views/${viewToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar vista explosionada')
      }

      toast.success('Vista explosionada eliminada exitosamente')
      setDeleteDialogOpen(false)
      setViewToDelete(null)
      refetch() // Refetch table data
      router.refresh()
    } catch (error) {
      console.error('Error deleting exploded view:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al eliminar vista explosionada'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<AssetExplodedViewWithRelations>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="space-y-1 min-w-[200px]">
            <div className="font-semibold">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'asset',
        accessorFn: (row) => row.asset?.name,
        header: 'Activo',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="text-sm">{row.original.asset?.name || '-'}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {row.original.asset?.code || '-'}
            </div>
          </div>
        ),
      },
      {
        id: 'hotspots',
        accessorFn: (row) => row._count?.hotspots || 0,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Hotspots
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const count = row.original._count?.hotspots || 0
          return (
            <Badge variant={count > 0 ? 'default' : 'outline'}>
              {count}
            </Badge>
          )
        },
      },
      {
        id: 'dimensions',
        header: 'Dimensiones',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.imageWidth} × {row.original.imageHeight} px
          </div>
        ),
      },
      {
        id: 'order',
        accessorFn: (row) => row.order,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Orden
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.order}</span>
        ),
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: 'Estado',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/exploded-views/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/exploded-views/${row.original.id}/hotspots`}>
                <MapPin className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/exploded-views/${row.original.id}/edit`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDeleteClick]
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.isActive) count++
    // Don't count assetId as it comes from URL
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    // Keep assetId filter if present
    setFilters(assetId ? { assetId } : {})
    setPage(1)
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={explodedViews}
        searchKey="name"
        searchPlaceholder="Buscar vistas por nombre..."
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
            contentClassName="w-[300px]"
          >
            <ExplodedViewsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar vista explosionada?"
        description={
          viewToDelete
            ? `¿Estás seguro de eliminar "${viewToDelete.name}"? Esta acción también eliminará todos los hotspots asociados y no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  )
}
