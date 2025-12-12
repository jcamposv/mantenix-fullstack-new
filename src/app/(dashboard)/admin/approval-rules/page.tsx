/**
 * Approval Rules Page
 *
 * Admin page for managing approval rules (criteria for multi-level approvals).
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
import { ApprovalRulesFilters } from '@/components/workflow/approval-rules-filters'
import { ShieldCheck, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
} from '@/components/common/table-actions'
import { Badge } from '@/components/ui/badge'
import type { ApprovalRuleWithRelations } from '@/types/approval-rule.types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useApprovalRules,
  type ApprovalRuleFilters,
} from '@/hooks/use-approval-rules'

export default function ApprovalRulesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ApprovalRuleFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] =
    useState<ApprovalRuleWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 20

  const { approvalRules, loading, total, totalPages, refetch } =
    useApprovalRules({
      page,
      limit,
      search,
      filters,
      autoRefresh: false,
    })

  const handleAdd = () => {
    router.push('/admin/approval-rules/new')
  }

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/approval-rules/${id}/edit`)
    },
    [router]
  )

  const handleDelete = (approvalRule: ApprovalRuleWithRelations) => {
    setRuleToDelete(approvalRule)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!ruleToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/approval-rules/${ruleToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Regla de aprobación eliminada exitosamente')
        setDeleteDialogOpen(false)
        setRuleToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la regla de aprobación')
      }
    } catch (error) {
      console.error('Error deleting approval rule:', error)
      toast.error('Error al eliminar la regla de aprobación')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<ApprovalRuleWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => {
          const rule = row.original
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{rule.name}</div>
              {rule.description && (
                <div className="text-sm text-muted-foreground truncate">
                  {rule.description}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'minCost',
        header: 'Rango de Costo',
        cell: ({ row }) => {
          const rule = row.original
          return (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                ${rule.minCost?.toLocaleString() || '0'} - $
                {rule.maxCost ? rule.maxCost.toLocaleString() : '∞'}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'approvalLevels',
        header: 'Niveles',
        cell: ({ row }) => {
          const rule = row.original
          return (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{rule.approvalLevels}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'priority',
        header: 'Prioridad',
        cell: ({ row }) => {
          const rule = row.original
          if (!rule.priority) return <span className="text-muted-foreground">Todas</span>
          return <Badge variant="outline" className="text-xs">{rule.priority}</Badge>
        },
      },
      {
        accessorKey: 'type',
        header: 'Tipo OT',
        cell: ({ row }) => {
          const rule = row.original
          if (!rule.type) return <span className="text-muted-foreground">Todos</span>
          return <Badge variant="outline" className="text-xs">{rule.type}</Badge>
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Estado',
        cell: ({ row }) => {
          const rule = row.original
          return rule.isActive ? (
            <Badge variant="default" className="text-xs">Activa</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Inactiva</Badge>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const rule = row.original
          const actions = [
            createEditAction(() => handleEdit(rule.id)),
            createDeleteAction(() => handleDelete(rule)),
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
    if (filters.priority) count++
    if (filters.type) count++
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
        data={approvalRules}
        searchKey="name"
        searchPlaceholder="Buscar reglas..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Reglas de Aprobación"
        description={`${total} reglas | Define criterios para aprobaciones multinivel`}
        onAdd={handleAdd}
        addLabel="Crear Regla"
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
            contentClassName="w-[600px]"
          >
            <ApprovalRulesFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Regla de Aprobación"
        description={`¿Está seguro que desea eliminar la regla "${ruleToDelete?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
