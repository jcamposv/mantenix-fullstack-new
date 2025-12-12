"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertTriangle, Activity, Timer, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkOrderStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue?: number
  avgCompletionTime?: number
  completionRate?: number
}

interface WorkOrderStatsProps {
  stats: WorkOrderStats
  loading?: boolean
}

export function WorkOrderStats({ stats, loading }: WorkOrderStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const completionRate = stats.completionRate ||
    (stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0)

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {/* Total Órdenes */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Total</p>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>

      {/* En Progreso */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-info/10">
              <Clock className="h-4 w-4 text-info" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">En Progreso</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
            <span className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Completadas */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Completadas</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <Badge variant="secondary" className="bg-success/10 text-success text-xs px-1.5 py-0">
              {completionRate}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pendientes */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-warning/10">
              <Timer className="h-4 w-4 text-warning" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Pendientes</p>
          </div>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </CardContent>
      </Card>

      {/* Vencidas - Solo mostrar si existe el dato */}
      {stats.overdue !== undefined && (
        <Card className={cn(
          "shadow-none",
          stats.overdue > 0 && "border border-destructive/30 bg-destructive/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Vencidas</p>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
                  Alerta
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
          </CardContent>
        </Card>
      )}

      {/* Calidad del Servicio */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Calidad</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <span className="text-xs text-muted-foreground">efectividad</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
