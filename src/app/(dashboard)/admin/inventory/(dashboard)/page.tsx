"use client"

import { useEffect, useState } from "react"
import { Loader2, Package, AlertTriangle, Clock, ArrowUpDown, PackageSearch, FileText, ClipboardList, Plus } from "lucide-react"
import { StatsCard } from "@/components/inventory/dashboard/stats-card"
import { LowStockAlerts } from "@/components/inventory/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/inventory/dashboard/recent-activity"
import { TopRequestedItems } from "@/components/inventory/dashboard/top-requested-items"
import type { InventoryDashboardMetrics } from "@/types/inventory.types"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InventoryDashboardPage() {
  const [metrics, setMetrics] = useState<InventoryDashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/inventory/dashboard')
      if (!response.ok) throw new Error('Error al cargar métricas')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">Error al cargar el dashboard</p>
      </div>
    )
  }

  const { kpis, lowStockAlerts, topRequestedItems, recentActivity } = metrics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Inventario</h2>
          <p className="text-muted-foreground">
            Resumen y métricas clave de tu inventario
          </p>
        </div>
        <Link href="/admin/inventory/items/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Item
          </Button>
        </Link>
      </div>

      {/* Quick Access Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/inventory/items">
          <Button variant="outline" className="h-auto py-3 cursor-pointer">
            <PackageSearch className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Items</div>
              <div className="text-xs text-muted-foreground">Ver lista de productos</div>
            </div>
          </Button>
        </Link>
        <Link href="/admin/inventory/requests">
          <Button variant="outline" className="h-auto py-3 cursor-pointer">
            <ClipboardList className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Solicitudes</div>
              <div className="text-xs text-muted-foreground">Gestionar pedidos</div>
            </div>
          </Button>
        </Link>
        <Link href="/admin/inventory/movements">
          <Button variant="outline" className="h-auto py-3 cursor-pointer">
            <FileText className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Movimientos</div>
              <div className="text-xs text-muted-foreground">Ver historial</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Items Únicos"
          value={kpis.totalUniqueItems}
          subtitle="En tu bodega"
          icon={Package}
          variant="default"
        />
        <StatsCard
          title="Stock Bajo"
          value={kpis.lowStockCount}
          subtitle={`Crítico: ${kpis.criticalStockCount}`}
          icon={AlertTriangle}
          variant={kpis.criticalStockCount > 0 ? "danger" : kpis.lowStockCount > 0 ? "warning" : "success"}
        />
        <StatsCard
          title="Solicitudes Pendientes"
          value={kpis.pendingRequests}
          subtitle={`Aprobadas: ${kpis.approvedRequests}`}
          icon={Clock}
          variant={kpis.pendingRequests > 5 ? "warning" : "default"}
        />
        <StatsCard
          title="Movimientos Hoy"
          value={kpis.movementsToday.in + kpis.movementsToday.out}
          subtitle={`Entradas: ${kpis.movementsToday.in} | Salidas: ${kpis.movementsToday.out}`}
          icon={ArrowUpDown}
          variant="default"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopRequestedItems items={topRequestedItems} />
        <LowStockAlerts alerts={lowStockAlerts} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivity} />
    </div>
  )
}
