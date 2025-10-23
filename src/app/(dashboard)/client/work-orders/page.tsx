"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { List } from "lucide-react"
import { WorkOrderStats } from "@/components/client/work-order-stats"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface ClientWorkOrderStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

export default function ClientWorkOrdersPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ClientWorkOrderStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })
  const [recentOrders, setRecentOrders] = useState<WorkOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/client/work-orders/stats"),
          fetch("/api/client/work-orders?limit=10"),
        ])

        if (!statsRes.ok || !ordersRes.ok) {
          throw new Error("Error al cargar datos")
        }

        const statsData = await statsRes.json()
        const ordersData = await ordersRes.json()

        // Calculate stats from the service response
        const calculatedStats = {
          total: statsData.stats.total || 0,
          pending: (statsData.stats.draft || 0) + (statsData.stats.assigned || 0),
          inProgress: statsData.stats.inProgress || 0,
          completed: statsData.stats.completed || 0,
        }

        setStats(calculatedStats)
        setRecentOrders(ordersData.workOrders)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar las órdenes de trabajo")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      cell: ({ row }) => row.original.site?.name || "N/A",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/client/work-orders/${row.original.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Órdenes de Trabajo
            </h1>
            <p className="text-muted-foreground">
              Vista general de las órdenes de trabajo de su organización
            </p>
          </div>

          <Button variant="outline" onClick={() => router.push("/client/work-orders/list")}>
            <List className="h-4 w-4 mr-2" />
            Ver Todas
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <WorkOrderStats stats={stats} loading={loading} />

        <Card>
          <CardHeader>
            <CardTitle>Órdenes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentOrders}
              searchKey="number"
              searchPlaceholder="Buscar por número..."
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
