"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { InventoryRequestsFilters } from "@/components/inventory/inventory-requests-filters"
import { Package } from "lucide-react"
import { TableActions, createViewAction } from "@/components/common/table-actions"
import { REQUEST_URGENCY_OPTIONS } from "@/schemas/inventory"
import { InventoryRequestStatusBadge } from "@/components/inventory/inventory-request-status-badge"
import {
  useInventoryRequests,
  type InventoryRequestFilters,
  type InventoryRequestItem,
} from '@/hooks/use-inventory-requests'

export default function InventoryRequestsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<InventoryRequestFilters>({})
  const limit = 20

  const { requests, loading, total, totalPages } = useInventoryRequests({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  const handleView = (requestId: string) => {
    router.push(`/admin/inventory/requests/${requestId}`)
  }


  const getUrgencyBadge = (urgency: string) => {
    const urgencyOption = REQUEST_URGENCY_OPTIONS.find(opt => opt.value === urgency)
    return (
      <Badge variant="outline" className={urgencyOption?.color || "bg-gray-500"}>
        {urgencyOption?.label || urgency}
      </Badge>
    )
  }

  const columns: ColumnDef<InventoryRequestItem>[] = useMemo(() => [
    {
      accessorKey: "workOrder.number",
      header: "Orden de Trabajo",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">OT-{request.workOrder.number}</div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {request.workOrder.title}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "inventoryItem.name",
      header: "Ítem",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{request.inventoryItem.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {request.inventoryItem.code}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "quantityRequested",
      header: "Cantidad",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="space-y-1">
            <div className="font-semibold">
              {request.quantityRequested} {request.inventoryItem.unit}
            </div>
            {request.quantityApproved && (
              <div className="text-xs text-green-600">
                Aprobado: {request.quantityApproved}
              </div>
            )}
            {request.quantityDelivered > 0 && (
              <div className="text-xs text-blue-600">
                Entregado: {request.quantityDelivered}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <InventoryRequestStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "urgency",
      header: "Urgencia",
      cell: ({ row }) => getUrgencyBadge(row.original.urgency),
    },
    {
      accessorKey: "requester.name",
      header: "Solicitante",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="space-y-1">
            <div>{request.requester.name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(request.requestedAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original
        return (
          <TableActions
            actions={[
              createViewAction(() => handleView(request.id))
            ]}
          />
        )
      },
    },
  ], [])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.status) count++
    if (filters.urgency) count++
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
          <h2 className="text-2xl font-bold tracking-tight">Entregas de Inventario</h2>
          <p className="text-muted-foreground">
            {total} solicitudes | Solicitudes aprobadas pendientes de entrega desde bodega
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={requests}
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
            title="Filtros de Solicitudes"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[350px]"
          >
            <InventoryRequestsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />
    </div>
  )
}
