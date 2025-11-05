"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Package, Plus } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction, createViewAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { StockBadge } from "@/components/inventory/stock-badge"

interface InventoryItem {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  subcategory: string | null
  unit: string
  minStock: number
  maxStock: number | null
  reorderPoint: number
  unitCost: number | null
  totalQuantity?: number
  totalAvailable?: number
  totalReserved?: number
  isActive: boolean
  company: {
    id: string
    name: string
  }
  _count?: {
    stock: number
    movements: number
    requests: number
  }
}

interface InventoryItemsResponse {
  items: InventoryItem[]
  total: number
}

export default function InventoryItemsPage() {
  const router = useRouter()
  const { data: items, loading, refetch } = useTableData<InventoryItem>({
    endpoint: '/api/admin/inventory/items',
    transform: (data) => (data as InventoryItemsResponse).items || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddItem = () => {
    router.push("/admin/inventory/items/new")
  }

  const handleEdit = (itemId: string) => {
    router.push(`/admin/inventory/items/${itemId}/edit`)
  }

  const handleView = (itemId: string) => {
    router.push(`/admin/inventory/items/${itemId}`)
  }

  const handleDelete = (item: InventoryItem) => {
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

  const columns: ColumnDef<InventoryItem>[] = [
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
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <TableActions
            actions={[
              createViewAction(() => handleView(item.id)),
              createEditAction(() => handleEdit(item.id)),
              createDeleteAction(() => handleDelete(item))
            ]}
          />
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ítems de Inventario</h2>
          <p className="text-muted-foreground">
            Gestiona el catálogo de ítems de inventario
          </p>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Ítem
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Buscar por nombre..."
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar ítem de inventario?"
        description={
          itemToDelete
            ? `¿Estás seguro de que deseas eliminar "${itemToDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar"
        loading={isDeleting}
      />
    </div>
  )
}
