"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { Eye, Building, Calendar } from "lucide-react"
import { useTableData } from "@/components/hooks/use-table-data"
import { TableActions } from "@/components/common/table-actions"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrdersResponse {
  items: WorkOrderWithRelations[]
}

export default function ClientWorkOrdersListPage() {
  const router = useRouter()
  const { data: workOrders, loading } = useTableData<WorkOrderWithRelations>({
    endpoint: "/api/client/work-orders",
    transform: (data) => (data as WorkOrdersResponse).items || [],
  })

  const columns: ColumnDef<WorkOrderWithRelations>[] = [
    {
      accessorKey: "number",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <WorkOrderTypeBadge type={row.getValue("type")} />
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <WorkOrderStatusBadge status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => (
        <WorkOrderPriorityBadge priority={row.getValue("priority")} />
      ),
    },
    {
      accessorKey: "site",
      header: "Sede",
      cell: ({ row }) => {
        const site = row.original.site
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{site?.name || "N/A"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "scheduledDate",
      header: "Fecha Programada",
      cell: ({ row }) => {
        const date = row.getValue("scheduledDate")
        if (!date) return "Sin programar"
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(date as string).toLocaleDateString()}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workOrder = row.original
        const actions = [
          {
            label: "Ver detalles",
            icon: Eye,
            onClick: () => router.push(`/client/work-orders/${workOrder.id}`),
          },
        ]

        return <TableActions actions={actions} />
      },
    },
  ]

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Todas las Órdenes de Trabajo
        </h1>
        <p className="text-muted-foreground">
          Lista completa de órdenes de trabajo de su organización
        </p>
      </div>

      <DataTable
        columns={columns}
        data={workOrders}
        searchKey="number"
        searchPlaceholder="Buscar por número o título..."
        loading={loading}
      />
    </div>
  )
}
