"use client"

import { KPICard } from "./shared/kpi-card"
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react"

interface WorkOrderStats {
  total: number
  inProgress: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
  avgCompletionTime: number
  activeUsers: number
}

interface WorkOrdersOverviewProps {
  stats: WorkOrderStats
  loading?: boolean
}

export function WorkOrdersOverview({ stats, loading = false }: WorkOrdersOverviewProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const completionTrend = stats.completionRate >= 80 ? "up" : 
                         stats.completionRate >= 60 ? "neutral" : "down"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Órdenes"
        value={stats.total}
        icon={ClipboardList}
        description="Órdenes activas en el sistema"
        className="col-span-1"
      />
      
      <KPICard
        title="En Progreso"
        value={stats.inProgress}
        icon={Clock}
        description="Órdenes siendo ejecutadas"
        trend={stats.inProgress > 0 ? "up" : "neutral"}
        className="col-span-1"
      />
      
      <KPICard
        title="Completadas"
        value={stats.completed}
        icon={CheckCircle}
        description="Órdenes finalizadas"
        change={{
          value: Math.round((stats.completed / stats.total) * 100),
          period: "del total"
        }}
        trend="up"
        className="col-span-1"
      />
      
      <KPICard
        title="Vencidas"
        value={stats.overdue}
        icon={AlertTriangle}
        description="Órdenes fuera de tiempo"
        trend={stats.overdue > 0 ? "down" : "up"}
        className="col-span-1"
      />
      
      <KPICard
        title="Tasa Completación"
        value={`${stats.completionRate}%`}
        icon={TrendingUp}
        description="Eficiencia del equipo"
        change={{
          value: 5, // This would come from API comparing to previous period
          period: "vs mes anterior"
        }}
        trend={completionTrend}
        className="col-span-1 md:col-span-2 lg:col-span-1"
      />
      
      <KPICard
        title="Usuarios Activos"
        value={stats.activeUsers}
        icon={Users}
        description="Técnicos trabajando hoy"
        className="col-span-1 md:col-span-2 lg:col-span-1"
      />
    </div>
  )
}