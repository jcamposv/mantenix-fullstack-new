/**
 * Components Table Component
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
import { EVComponentsFilters } from './ev-components-filters'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ArrowUpDown, Eye, Settings, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  useEVComponents,
  type EVComponentFilters,
} from '@/hooks/use-ev-components'
import type { ExplodedViewComponentWithRelations } from '@/types/exploded-view.types'

/**
 * Components Table with server-side pagination
 */
export function ComponentsTable() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<EVComponentFilters>({})
  const limit = 20

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [componentToDelete, setComponentToDelete] = useState<ExplodedViewComponentWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { components, loading, totalPages, refetch } =
    useEVComponents({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleDeleteClick = useCallback((component: ExplodedViewComponentWithRelations): void => {
    setComponentToDelete(component)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!componentToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/exploded-view-components/${componentToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar componente')
      }

      toast.success('Componente eliminado exitosamente')
      setDeleteDialogOpen(false)
      setComponentToDelete(null)
      refetch() // Refetch table data
      router.refresh()
    } catch (error) {
      console.error('Error deleting component:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al eliminar componente'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<ExplodedViewComponentWithRelations>[]>(
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
            {row.original.partNumber && (
              <div className="text-sm text-muted-foreground font-mono">
                P/N: {row.original.partNumber}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'manufacturer',
        accessorFn: (row) => row.manufacturer,
        header: 'Fabricante',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.manufacturer || '-'}</span>
        ),
      },
      {
        id: 'inventory',
        accessorFn: (row) => row.inventoryItem?.name,
        header: 'Inventario',
        cell: ({ row }) => {
          const item = row.original.inventoryItem
          return item ? (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <div className="text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {item.code}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Sin vincular</span>
          )
        },
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
              En Uso
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const count = row.original._count?.hotspots || 0
          return (
            <Badge variant={count > 0 ? 'default' : 'outline'}>
              {count} {count === 1 ? 'vista' : 'vistas'}
            </Badge>
          )
        },
      },
      {
        id: 'docs',
        header: 'Documentos',
        cell: ({ row }) => {
          const hasManual = !!row.original.manualUrl
          const hasInstallation = !!row.original.installationUrl
          const hasImage = !!row.original.imageUrl
          const docCount = [hasManual, hasInstallation, hasImage].filter(Boolean).length

          return docCount > 0 ? (
            <Badge variant="outline">{docCount} {docCount === 1 ? 'doc' : 'docs'}</Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
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
              <Link href={`/admin/exploded-view-components/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/exploded-view-components/${row.original.id}/edit`}>
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
    if (filters.hasInventoryItem) count++
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
    <>
      <DataTable
        columns={columns}
        data={components}
        searchKey="name"
        searchPlaceholder="Buscar componentes por nombre o número de parte..."
        searchValue={search}
        onSearchChange={handleSearchChange}
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
            contentClassName="w-[350px]"
          >
            <EVComponentsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar componente?"
        description={
          componentToDelete
            ? `¿Estás seguro de eliminar "${componentToDelete.name}"${
                componentToDelete.partNumber ? ` (${componentToDelete.partNumber})` : ''
              }? ${
                componentToDelete._count?.hotspots
                  ? 'Este componente está en uso en ' +
                    componentToDelete._count.hotspots +
                    ' hotspot(s) y no se puede eliminar.'
                  : 'Esta acción no se puede deshacer.'
              }`
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
