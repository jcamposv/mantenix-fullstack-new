"use client"


import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Package } from "lucide-react"
import { TableActions, createViewAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { REQUEST_STATUS_OPTIONS, REQUEST_URGENCY_OPTIONS } from "@/schemas/inventory"

interface InventoryRequest {
  id: string
  workOrder: {
    id: string
    number: string
    title: string
  }
  inventoryItem: {
    id: string
    code: string
    name: string
    unit: string
  }
  quantityRequested: number
  quantityApproved: number | null
  quantityDelivered: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED"
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  requestedAt: string
  requester: {
    id: string
    name: string
  }
  notes: string | null
}

interface InventoryRequestsResponse {
  requests: InventoryRequest[]
  total: number
}

export default function InventoryRequestsPage() {
  const router = useRouter()
  const { data: requests, loading, refetch } = useTableData<InventoryRequest>({
    endpoint: '/api/admin/inventory/requests',
    transform: (data) => (data as InventoryRequestsResponse).requests || []
  })

  const handleView = (requestId: string) => {
    router.push(`/admin/inventory/requests/${requestId}`)
  }

  const getStatusBadge = (status: string) => {
    const statusOption = REQUEST_STATUS_OPTIONS.find(opt => opt.value === status)
    return (
      <Badge className={statusOption?.color || "bg-gray-500"}>
        {statusOption?.label || status}
      </Badge>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyOption = REQUEST_URGENCY_OPTIONS.find(opt => opt.value === urgency)
    return (
      <Badge variant="outline" className={urgencyOption?.color || "bg-gray-500"}>
        {urgencyOption?.label || urgency}
      </Badge>
    )
  }

  const columns: ColumnDef<InventoryRequest>[] = [
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
      cell: ({ row }) => getStatusBadge(row.original.status),
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
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Solicitudes de Inventario</h2>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de inventario de órdenes de trabajo
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        searchKey="inventoryItem.name"
        searchPlaceholder="Buscar por ítem..."
      />
    </div>
  )
}
