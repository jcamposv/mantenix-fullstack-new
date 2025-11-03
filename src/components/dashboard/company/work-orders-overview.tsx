"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Órdenes - Primary Card */}
      <Card className="overflow-hidden  shadow-none transition-all">
        <CardContent className="p-0">
          <div className="p-6 bg-muted/40">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 ring-4 ring-primary/5">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Órdenes en el período seleccionado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* En Progreso */}
      <Card className="overflow-hidden shadow-none transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold mt-0.5">{stats.inProgress}</p>
              </div>
            </div>
            {stats.inProgress > 0 && (
              <Badge variant="secondary" className="bg-info/10 text-info">
                <ArrowUp className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-info transition-all"
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
              />
            </div>
            <span className="font-medium">
              {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Completadas */}
      <Card className="overflow-hidden shadow-none transition-all border-success/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold mt-0.5">{stats.completed}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              />
            </div>
            <span className="font-medium">del total</span>
          </div>
        </CardContent>
      </Card>

      {/* Pendientes */}
      <Card className="overflow-hidden shadow-none transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold mt-0.5">{stats.pending}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Por iniciar</p>
        </CardContent>
      </Card>

      {/* Vencidas - Warning Card */}
      <Card className={cn(
        "overflow-hidden shadow-none transition-all",
        stats.overdue > 0 && "border-2 border-destructive/20 bg-destructive/5"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold mt-0.5 text-destructive">{stats.overdue}</p>
              </div>
            </div>
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                ¡Atención!
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.overdue > 0 ? "Requieren acción inmediata" : "Todas a tiempo"}
          </p>
        </CardContent>
      </Card>

      {/* Eficiencia - Highlighted Card */}
      <Card className="overflow-hidden shadow-none transition-all ">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa Completación</p>
                <p className="text-2xl font-bold mt-0.5 text-primary">{stats.completionRate}%</p>
              </div>
            </div>
            {completionTrend === "up" && <ArrowUp className="h-5 w-5 text-success" />}
            {completionTrend === "down" && <ArrowDown className="h-5 w-5 text-destructive" />}
            {completionTrend === "neutral" && <Minus className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  completionTrend === "up" ? "bg-success" :
                  completionTrend === "down" ? "bg-destructive" : "bg-muted-foreground"
                )}
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <span className="font-medium text-muted-foreground">Eficiencia</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}