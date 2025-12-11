/**
 * Authority Limits Page
 *
 * Admin page for managing authority limits (cost thresholds for approval).
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
import { AuthorityLimitsFilters } from '@/components/workflow/authority-limits-filters'
import { Shield, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
} from '@/components/common/table-actions'
import { Badge } from '@/components/ui/badge'
import type { AuthorityLimitWithRelations } from '@/types/authority-limit.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useAuthorityLimits,
  type AuthorityLimitFilters,
} from '@/hooks/use-authority-limits'

export default function AuthorityLimitsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AuthorityLimitFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [limitToDelete, setLimitToDelete] =
    useState<AuthorityLimitWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { authorityLimits, loading, total, totalPages, refetch } =
    useAuthorityLimits({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/admin/authority-limits/new')
  }

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/authority-limits/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (authorityLimit: AuthorityLimitWithRelations) => {
    setLimitToDelete(authorityLimit)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!limitToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/authority-limits/${limitToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Límite de autoridad eliminado exitosamente')
        setDeleteDialogOpen(false)
        setLimitToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el límite de autoridad')
      }
    } catch (error) {
      console.error('Error deleting authority limit:', error)
      toast.error('Error al eliminar el límite de autoridad')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<AuthorityLimitWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'roleKey',
        header: 'Rol',
        cell: ({ row }) => {
          const limit = row.original
          return (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{limit.roleKey}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'maxDirectAuthorization',
        header: 'Límite de Costo',
        cell: ({ row }) => {
          const limit = row.original
          return (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                ${limit.maxDirectAuthorization.toLocaleString()}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'canCreateWorkOrders',
        header: 'Crear OT',
        cell: ({ row }) => {
          const limit = row.original
          return limit.canCreateWorkOrders ? (
            <Badge variant="default" className="text-xs">Sí</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">No</Badge>
          )
        },
      },
      {
        accessorKey: 'canAssignDirectly',
        header: 'Asignar',
        cell: ({ row }) => {
          const limit = row.original
          return limit.canAssignDirectly ? (
            <Badge variant="default" className="text-xs">Sí</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">No</Badge>
          )
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Estado',
        cell: ({ row }) => {
          const limit = row.original
          return limit.isActive ? (
            <Badge variant="default" className="text-xs">Activo</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Inactivo</Badge>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const limit = row.original
          const actions = [
            createEditAction(() => handleEdit(limit.id)),
            createDeleteAction(() => handleDelete(limit)),
          ]

          return <TableActions actions={actions} />
        },
      },
    ],
    [handleEdit]
  )

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.isActive !== undefined) count++
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
        data={authorityLimits}
        searchKey="roleKey"
        searchPlaceholder="Buscar por rol..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Límites de Autoridad"
        description={`${total} límites | Gestiona autorizaciones de costo por rol`}
        onAdd={handleAdd}
        addLabel="Crear Límite"
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
            <AuthorityLimitsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Límite de Autoridad"
        description={`¿Está seguro que desea eliminar el límite para "${limitToDelete?.roleKey}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
