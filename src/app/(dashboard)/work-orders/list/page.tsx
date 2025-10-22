"use client"

import * as React from "react"
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

export default function WorkOrdersListPage() {
  const router = useRouter()
  const { data: workOrders, loading, refetch } = useTableData<WorkOrderWithRelations>({
    endpoint: '/api/work-orders',
    transform: (data) => (data as WorkOrdersResponse).workOrders || (data as WorkOrdersResponse).items || (data as WorkOrderWithRelations[]) || []
  })

  // Configuración inicial de visibilidad de columnas
  const initialColumnVisibility = {
    number: false,  // Ocultar columna "Orden"
    asset: false,   // Ocultar columna "Activo"
  }

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
          <div className="font-medium">
            {workOrder.number}
          </div>
        )
      },
      enableHiding: true,
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => {
        const workOrder = row.original
        return (
          <div className="max-w-[200px]">
            <div className="font-medium truncate">{workOrder.title}</div>
            <div className="text-sm text-muted-foreground truncate">
              {workOrder.description}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const workOrder = row.original
        return <WorkOrderTypeBadge type={workOrder.type} />
      },
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => {
        const workOrder = row.original
        return <WorkOrderPriorityBadge priority={workOrder.priority} />
      },
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
      accessorKey: "assignedTo",
      header: "Asignado",
      cell: ({ row }) => {
        const workOrder = row.original
        if (!workOrder.assignments || workOrder.assignments.length === 0) {
          return <span className="text-muted-foreground text-xs">Sin asignar</span>
        }
        const firstName = workOrder.assignments[0].user.name.split(' ')[0]
        const count = workOrder.assignments.length
        return (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs truncate max-w-[80px]">
              {firstName}{count > 1 ? ` +${count-1}` : ''}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "site",
      header: ({ column }) => (
        <div className="hidden lg:block">Sede</div>
      ),
      cell: ({ row }) => {
        const workOrder = row.original
        return (
          <div className="hidden lg:flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
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
        if (!workOrder.asset) {
          return <span className="text-muted-foreground">N/A</span>
        }
        return (
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{workOrder.asset.name}</div>
              <div className="text-xs text-muted-foreground">{workOrder.asset.code}</div>
            </div>
          </div>
        )
      },
      enableHiding: true,
    },
    {
      accessorKey: "scheduledDate",
      header: ({ column }) => (
        <div className="hidden md:block">Fecha</div>
      ),
      cell: ({ row }) => {
        const workOrder = row.original
        if (!workOrder.scheduledDate) {
          return <span className="text-muted-foreground hidden md:block">No programada</span>
        }
        return (
          <div className="hidden md:flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(workOrder.scheduledDate).toLocaleDateString()}
            </span>
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
        initialColumnVisibility={initialColumnVisibility}
      />
    </div>
  )
}