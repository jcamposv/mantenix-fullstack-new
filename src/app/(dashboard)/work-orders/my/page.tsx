"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import {  Building, Wrench, Clock, Check } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createViewAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import type { WorkOrderWithRelations, WorkOrdersResponse } from "@/types/work-order.types"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

export default function MyWorkOrdersPage() {
  const router = useRouter()
  const { data: workOrders, loading, refetch } = useTableData<WorkOrderWithRelations>({
    endpoint: '/api/work-orders/my',
    transform: (data) => (data as WorkOrdersResponse).workOrders || (data as WorkOrdersResponse).items || (data as WorkOrderWithRelations[]) || []
  })

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [workOrderToComplete, setWorkOrderToComplete] = useState<WorkOrderWithRelations | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  const handleView = (workOrderId: string) => {
    router.push(`/work-orders/${workOrderId}`)
  }

  const handleComplete = (workOrder: WorkOrderWithRelations) => {
    if (workOrder.status === 'COMPLETED') {
      toast.info('Esta orden ya está completada')
      return
    }

    setWorkOrderToComplete(workOrder)
    setCompleteDialogOpen(true)
  }

  const confirmComplete = async () => {
    if (!workOrderToComplete) return

    try {
      setIsCompleting(true)
      const response = await fetch(`/api/work-orders/${workOrderToComplete.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completionNotes: 'Completada desde lista de mis órdenes'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Orden completada exitosamente')
        setCompleteDialogOpen(false)
        setWorkOrderToComplete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al completar la orden')
      }
    } catch (error) {
      console.error('Error completing work order:', error)
      toast.error('Error al completar la orden')
    } finally {
      setIsCompleting(false)
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
      id: "actions",
      cell: ({ row }) => {
        const workOrder = row.original
        const actions = [
          createViewAction(() => handleView(workOrder.id))
        ]

        // Add complete action if not already completed
        if (workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED') {
          actions.push({
            label: "Completar",
            icon: Check,
            variant: "default" as const,
            onClick: () => handleComplete(workOrder)
          })
        }
        
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
        searchPlaceholder="Buscar mis órdenes..."
        title="Mis Órdenes de Trabajo"
        description="Órdenes de trabajo asignadas a mí"
        loading={loading}
      />

      <ConfirmDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        title="Completar Orden de Trabajo"
        description={`¿Desea marcar como completada la orden "${workOrderToComplete?.number}"?`}
        confirmText="Completar"
        cancelText="Cancelar"
        onConfirm={confirmComplete}
        variant="default"
        loading={isCompleting}
      />
    </div>
  )
}