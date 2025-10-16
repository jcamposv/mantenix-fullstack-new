"use client"

import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { User, Building, Wrench, Clock } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction, createViewAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import type { WorkOrderWithRelations, WorkOrdersResponse } from "@/types/work-order.types"

export default function WorkOrdersPage() {
  const router = useRouter()
  const { data: workOrders, loading, refetch } = useTableData<WorkOrderWithRelations>({
    endpoint: '/api/work-orders',
    transform: (data) => (data as WorkOrdersResponse).workOrders || (data as WorkOrdersResponse).items || (data as WorkOrderWithRelations[]) || []
  })

  const handleAddWorkOrder = () => {
    router.push("/work-orders/new/select-template")
  }

  const handleView = (workOrderId: string) => {
    router.push(`/work-orders/${workOrderId}`)
  }

  const handleEdit = (workOrderId: string) => {
    router.push(`/work-orders/${workOrderId}/edit`)
  }

  const handleDelete = async (workOrder: WorkOrderWithRelations) => {
    if (confirm(`¿Está seguro que desea eliminar la orden "${workOrder.number}"?`)) {
      try {
        const response = await fetch(`/api/work-orders/${workOrder.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message || 'Orden de trabajo eliminada exitosamente')
          refetch()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al eliminar la orden de trabajo')
        }
      } catch (error) {
        console.error('Error deleting work order:', error)
        toast.error('Error al eliminar la orden de trabajo')
      }
    }
  }

  const columns: ColumnDef<WorkOrderWithRelations>[] = [
    {
      accessorKey: "number",
      header: "Orden",
      cell: ({ row }) => {
        const workOrder = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{workOrder.number}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {workOrder.title}
            </div>
            <WorkOrderTypeBadge type={workOrder.type} />
          </div>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const workOrder = row.original
        return <WorkOrderStatusBadge status={workOrder.status} />
      },
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => {
        const workOrder = row.original
        return <WorkOrderPriorityBadge priority={workOrder.priority} showIcon />
      },
    },
    {
      accessorKey: "site",
      header: "Sede",
      cell: ({ row }) => {
        const workOrder = row.original
        return (
          <div className="flex items-center">
            <Building className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{workOrder.site?.name || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "asset",
      header: "Activo",
      cell: ({ row }) => {
        const workOrder = row.original
        return workOrder.asset ? (
          <div className="flex items-center">
            <Wrench className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{workOrder.asset.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin activo</span>
        )
      },
    },
    {
      accessorKey: "scheduledDate",
      header: "Programada",
      cell: ({ row }) => {
        const workOrder = row.original
        return workOrder.scheduledDate ? (
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="text-sm">
              {new Date(workOrder.scheduledDate).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin programar</span>
        )
      },
    },
    {
      accessorKey: "assignments",
      header: "Asignados",
      cell: ({ row }) => {
        const workOrder = row.original
        const assignmentsCount = workOrder._count?.assignments || workOrder.assignments?.length || 0
        return (
          <div className="flex items-center">
            <User className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{assignmentsCount} usuario(s)</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workOrder = row.original
        const actions = [
          createViewAction(() => handleView(workOrder.id)),
          createEditAction(() => handleEdit(workOrder.id)),
          createDeleteAction(() => handleDelete(workOrder))
        ]
        
        return <TableActions actions={actions} />
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={workOrders}
        searchKey="number"
        searchPlaceholder="Buscar órdenes..."
        title="Órdenes de Trabajo"
        description="Gestionar órdenes de trabajo y mantenimientos"
        onAdd={handleAddWorkOrder}
        addLabel="Crear Orden"
        loading={loading}
      />
    </div>
  )
}