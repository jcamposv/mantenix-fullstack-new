"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SiteMetric {
  siteId: string
  siteName: string
  total: number
  completed: number
  inProgress: number
  overdue: number
  completionRate: number
  avgResolutionTime?: number
}

interface SiteMetricsProps {
  sites: SiteMetric[]
  loading?: boolean
}

export function SiteMetrics({ sites, loading = false }: SiteMetricsProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Métricas por Sede</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sites.length === 0) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Métricas por Sede
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No hay datos de sedes disponibles
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort by total orders descending
  const sortedSites = [...sites].sort((a, b) => b.total - a.total)

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return "text-success"
    if (rate >= 70) return "text-info"
    if (rate >= 50) return "text-warning"
    return "text-destructive"
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Rendimiento por Sede
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Comparativa de servicio por ubicación
            </p>
          </div>
          <Badge variant="secondary">
            {sites.length} {sites.length === 1 ? 'Sede' : 'Sedes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSites.map((site) => (
            <div
              key={site.siteId}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              {/* Site Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{site.siteName}</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {site.total} órdenes
                    </Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      {site.completed} completadas
                    </span>
                    <span className="flex items-center gap-1 text-info">
                      <Clock className="h-4 w-4" />
                      {site.inProgress} en progreso
                    </span>
                    {site.overdue > 0 && (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {site.overdue} vencidas
                      </span>
                    )}
                  </div>
                </div>

                {/* Completion Rate Badge */}
                <div className="text-right ml-4">
                  <div className={cn(
                    "text-2xl font-bold",
                    getCompletionRateColor(site.completionRate)
                  )}>
                    {site.completionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">efectividad</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progreso de órdenes</span>
                  <span>{site.completed} de {site.total}</span>
                </div>
                <Progress
                  value={site.completionRate}
                  className="h-2"
                  indicatorClassName={cn(
                    site.completionRate >= 90 ? "bg-success" :
                    site.completionRate >= 70 ? "bg-info" :
                    site.completionRate >= 50 ? "bg-warning" : "bg-destructive"
                  )}
                />
              </div>

              {/* Average Resolution Time */}
              {site.avgResolutionTime !== undefined && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tiempo promedio de resolución</span>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {site.avgResolutionTime.toFixed(1)} horas
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">
                {sortedSites.reduce((sum, site) => sum + site.completed, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Completadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-info">
                {sortedSites.reduce((sum, site) => sum + site.inProgress, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total En Progreso</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {sortedSites.reduce((sum, site) => sum + site.overdue, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Vencidas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
