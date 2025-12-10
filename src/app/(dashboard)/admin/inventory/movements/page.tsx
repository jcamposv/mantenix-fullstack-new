"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { InventoryMovementsFilters } from "@/components/inventory/inventory-movements-filters"
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Settings, Plus } from "lucide-react"
import { MOVEMENT_TYPE_OPTIONS } from "@/schemas/inventory"
import { CreateInventoryEntryDialog } from "@/components/inventory/create-inventory-entry-dialog"
import {
  useInventoryMovements,
  type InventoryMovementFilters,
  type InventoryMovementItem,
} from '@/hooks/use-inventory-movements'

export default function InventoryMovementsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<InventoryMovementFilters>({})
  const limit = 20

  const { movements, loading, total, totalPages, refetch } = useInventoryMovements({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  const handleSuccess = () => {
    refetch()
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <ArrowDownCircle className="h-4 w-4 text-green-600" />
      case "OUT":
        return <ArrowUpCircle className="h-4 w-4 text-red-600" />
      case "TRANSFER":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      case "ADJUSTMENT":
        return <Settings className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getMovementTypeBadge = (type: string) => {
    const typeOption = MOVEMENT_TYPE_OPTIONS.find(opt => opt.value === type)
    const colors: Record<string, string> = {
      IN: "bg-green-500",
      OUT: "bg-red-500",
      TRANSFER: "bg-blue-500",
      ADJUSTMENT: "bg-orange-500"
    }

    return (
      <Badge className={colors[type] || "bg-gray-500"}>
        {typeOption?.label || type}
      </Badge>
    )
  }

  const columns: ColumnDef<InventoryMovementItem>[] = useMemo(() => [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const movement = row.original
        return (
          <div className="flex items-center gap-2">
            {getMovementTypeIcon(movement.type)}
            {getMovementTypeBadge(movement.type)}
          </div>
        )
      },
    },
    {
      accessorKey: "inventoryItem.name",
      header: "Ítem",
      cell: ({ row }) => {
        const movement = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{movement.inventoryItem.name}</div>
            <div className="text-xs text-muted-foreground">
              {movement.inventoryItem.code}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => {
        const movement = row.original
        return (
          <div className="font-semibold">
            {movement.quantity} {movement.inventoryItem.unit}
          </div>
        )
      },
    },
    {
      accessorKey: "locations",
      header: "Ubicaciones",
      cell: ({ row }) => {
        const movement = row.original

        if (movement.type === "TRANSFER") {
          return (
            <div className="text-sm">
              <div className="text-muted-foreground">
                De: {movement.fromLocationType || "N/A"}
              </div>
              <div className="text-muted-foreground">
                A: {movement.toLocationType || "N/A"}
              </div>
            </div>
          )
        }

        if (movement.type === "IN" && movement.toLocationType) {
          return (
            <div className="text-sm">
              Destino: {movement.toLocationType}
            </div>
          )
        }

        if (movement.type === "OUT" && movement.fromLocationType) {
          return (
            <div className="text-sm">
              Origen: {movement.fromLocationType}
            </div>
          )
        }

        return <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: "totalCost",
      header: "Costo Total",
      cell: ({ row }) => {
        const movement = row.original
        return movement.totalCost ? (
          <span className="font-medium">
            ${movement.totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "reason",
      header: "Motivo",
      cell: ({ row }) => {
        const movement = row.original
        return (
          <div className="max-w-xs truncate">
            {movement.reason || movement.notes || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "creator.name",
      header: "Realizado por",
      cell: ({ row }) => {
        const movement = row.original
        return (
          <div className="space-y-1">
            <div>{movement.creator.name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(movement.createdAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        )
      },
    },
  ], [])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Movimientos de Inventario</h2>
          <p className="text-muted-foreground">
            {total} movimientos | Historial de todos los movimientos de inventario
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Entrada
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={movements}
        loading={loading}
        searchKey="inventoryItem.name"
        searchPlaceholder="Buscar por ítem..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Movimientos"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[300px]"
          >
            <InventoryMovementsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <CreateInventoryEntryDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
