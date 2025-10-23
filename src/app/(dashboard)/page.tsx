"use client"

import { useWorkOrdersDashboard } from "@/hooks/use-work-orders-dashboard"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  List
} from "lucide-react"

export default function Home() {
  const { data: stats, error, isLoading: loading, mutate } = useWorkOrdersDashboard()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <DashboardLoading />
      </div>
    )
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <DashboardError 
          error={error} 
          onRetry={() => mutate()} 
        />
      </div>
    )
  }

  // Show empty state if no data
  if (stats && stats.total === 0) {
    return (
      <div className="container mx-auto py-6">
        <DashboardEmpty 
          onCreateWorkOrder={() => router.push("/work-orders/new/select-template")}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Vista general de las órdenes de trabajo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/work-orders/list")}>
              <List className="h-4 w-4 mr-2" />
              Ver Órdenes
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Técnicos trabajando hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Totales
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Órdenes en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Vencidas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eficiencia
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Tasa de completación
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-800">Completadas</p>
                <p className="text-xs text-green-600">{stats?.completed || 0} órdenes finalizadas</p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {stats?.completed || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm font-medium text-blue-800">En Progreso</p>
                <p className="text-xs text-blue-600">{stats?.inProgress || 0} órdenes ejecutándose</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {stats?.inProgress || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pendientes</p>
                <p className="text-xs text-yellow-600">{stats?.pending || 0} órdenes por iniciar</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                {stats?.pending || 0}
              </Badge>
            </div>

            {(stats?.overdue ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-medium text-red-800">Vencidas</p>
                  <p className="text-xs text-red-600">{stats?.overdue || 0} órdenes atrasadas</p>
                </div>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  {stats?.overdue || 0}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}