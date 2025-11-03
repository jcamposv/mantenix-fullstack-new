"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Timer
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MaintenanceMetricsProps {
  mttr?: number // Mean Time To Repair (hours)
  slaCompliance?: number // Percentage
  plannedVsUnplanned?: {
    planned: number
    unplanned: number
  }
  loading?: boolean
}

export function MaintenanceMetrics({
  mttr = 0,
  slaCompliance = 0,
  plannedVsUnplanned,
  loading = false
}: MaintenanceMetricsProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Métricas de Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const slaStatus = slaCompliance >= 95 ? "excellent" : slaCompliance >= 85 ? "good" : slaCompliance >= 70 ? "warning" : "critical"
  const mttrStatus = mttr <= 2 ? "excellent" : mttr <= 4 ? "good" : mttr <= 8 ? "warning" : "critical"

  const plannedPercentage = plannedVsUnplanned
    ? Math.round((plannedVsUnplanned.planned / (plannedVsUnplanned.planned + plannedVsUnplanned.unplanned)) * 100)
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success bg-success/5 border-success/20"
      case "good": return "text-info bg-info/5 border-info/20"
      case "warning": return "text-warning bg-warning/5 border-warning/20"
      case "critical": return "text-destructive bg-destructive/5 border-destructive/20"
      default: return "text-muted-foreground bg-muted/50 border-border"
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Métricas de Mantenimiento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          KPIs clave para ingeniería industrial
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MTTR - Mean Time To Repair */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            getStatusColor(mttrStatus)
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-background/50">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium opacity-80">MTTR</p>
                  <p className="text-xs opacity-60">Tiempo Promedio de Reparación</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{mttr.toFixed(1)}</p>
                <p className="text-xs opacity-70">horas</p>
              </div>
              {mttrStatus === "excellent" && (
                <Badge variant="outline" className="bg-background/50">
                  Excelente
                </Badge>
              )}
              {mttrStatus === "critical" && (
                <Badge variant="outline" className="bg-background/50">
                  Crítico
                </Badge>
              )}
            </div>
          </div>

          {/* SLA Compliance */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            getStatusColor(slaStatus)
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-background/50">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium opacity-80">Cumplimiento SLA</p>
                  <p className="text-xs opacity-60">Órdenes a tiempo</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{slaCompliance}%</p>
                <p className="text-xs opacity-70">del total</p>
              </div>
              {slaStatus === "excellent" && (
                <Badge variant="outline" className="bg-background/50">
                  Excelente
                </Badge>
              )}
              {slaStatus === "critical" && (
                <Badge variant="outline" className="bg-background/50">
                  Crítico
                </Badge>
              )}
            </div>
          </div>

          {/* Planned vs Unplanned */}
          <div className="p-4 rounded-lg border-2 bg-primary/5 border-primary/20 text-primary">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-background/80">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium opacity-90">Planificado vs No Planificado</p>
                  <p className="text-xs opacity-70">Ratio de mantenimiento</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{plannedPercentage}%</p>
                <p className="text-xs opacity-70">planificado</p>
              </div>
              {plannedPercentage >= 80 && (
                <Badge variant="outline" className="bg-background/80 border-current/20">
                  Óptimo
                </Badge>
              )}
              {plannedPercentage < 50 && (
                <Badge variant="outline" className="bg-background/80 border-current/20">
                  Mejorar
                </Badge>
              )}
            </div>
            {plannedVsUnplanned && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">Planificadas:</span>
                  <span className="font-medium">{plannedVsUnplanned.planned}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">No planificadas:</span>
                  <span className="font-medium">{plannedVsUnplanned.unplanned}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>MTTR:</strong> Tiempo promedio desde inicio hasta completación.
              <strong className="ml-2">SLA:</strong> Órdenes completadas dentro del tiempo programado.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
