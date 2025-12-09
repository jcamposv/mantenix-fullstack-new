/**
 * Inventory Items Page
 *
 * Comprehensive view of all inventory items with server-side pagination and filtering.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - SWR for data fetching
 * - Type-safe
 * - Clean component composition
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { InventoryItemsFilters } from '@/components/inventory/inventory-items-filters'
import { Package } from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/common/table-actions'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { StockBadge } from '@/components/inventory/stock-badge'
import {
  useInventoryItemsManagement,
  type InventoryItemManagementFilters,
  type InventoryItemItem,
} from '@/hooks/use-inventory-items-management'

export default function InventoryItemsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<InventoryItemManagementFilters>({})
  const limit = 20

  const { items, loading, total, totalPages, refetch } =
    useInventoryItemsManagement({
      page,
      limit,
      filters,
      autoRefresh: false,
    })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItemItem | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddItem = () => {
    router.push('/admin/inventory/items/new')
  }

  const handleEdit = useCallback(
    (itemId: string) => {
      router.push(`/admin/inventory/items/${itemId}/edit`)
    },
    [router]
  )

  const handleView = useCallback(
    (itemId: string) => {
      router.push(`/admin/inventory/items/${itemId}`)
    },
    [router]
  )

  const handleDelete = (item: InventoryItemItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/inventory/items/${itemToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Ítem eliminado exitosamente')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el ítem')
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      toast.error('Error al eliminar el ítem')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<InventoryItemItem>[] = useMemo(
    () => [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-medium">{item.code}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground truncate max-w-md">
                {item.description}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.category && <span>Categoría: {item.category}</span>}
              <span>•</span>
              <span>Unidad: {item.unit}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const item = row.original
        const currentStock = item.totalQuantity || 0
        const available = item.totalAvailable || 0
        const reserved = item.totalReserved || 0

        return (
          <div className="space-y-2">
            <StockBadge
              currentStock={currentStock}
              minStock={item.minStock}
              reorderPoint={item.reorderPoint}
              showIcon={true}
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Disponible: {available}</div>
              {reserved > 0 && <div>Reservado: {reserved}</div>}
              <div>Mín: {item.minStock} | Reorden: {item.reorderPoint}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "unitCost",
      header: "Costo Unit.",
      cell: ({ row }) => {
        const item = row.original
        return item.unitCost ? (
          <span className="font-medium">
            ${item.unitCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "company.name",
      header: "Empresa",
      cell: ({ row }) => {
        return <span>{row.original.company.name}</span>
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Activo" : "Inactivo"}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <TableActions
            actions={[
              createViewAction(() => handleView(item.id)),
              createEditAction(() => handleEdit(item.id)),
              createDeleteAction(() => handleDelete(item)),
            ]}
          />
        )
      },
    },
  ],
    [handleView, handleEdit]
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.isActive) count++
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
        data={items}
        searchKey="name"
        searchPlaceholder="Buscar ítems..."
        title="Ítems de Inventario"
        description={`${total} ítems | Filtre por categoría y más`}
        onAdd={handleAddItem}
        addLabel="Agregar Ítem"
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Ítems"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[400px]"
          >
            <InventoryItemsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Eliminar Ítem de Inventario"
        description={
          itemToDelete
            ? `¿Estás seguro de que deseas eliminar "${itemToDelete.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
