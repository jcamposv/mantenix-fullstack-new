"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, TrendingUp, Zap } from "lucide-react"
import type { DashboardKPIs } from "@/types/analytics.types"

interface ReliabilityKPICardsProps {
  data: DashboardKPIs["assetReliability"]
  loading?: boolean
}

/**
 * Asset Reliability KPI Cards Component
 *
 * Displays key reliability metrics (MTBF, MTTR, Availability, OEE)
 * Following CMMS industry standards
 */
export function ReliabilityKPICards({
  data,
  loading = false,
}: ReliabilityKPICardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-3 bg-muted rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Helper function to get badge variant based on metric value
  const getAvailabilityBadge = (availability: number) => {
    if (availability >= 95) return { variant: "success" as const, label: "Excelente" }
    if (availability >= 85) return { variant: "default" as const, label: "Bueno" }
    if (availability >= 75) return { variant: "warning" as const, label: "Regular" }
    return { variant: "destructive" as const, label: "Crítico" }
  }

  const getOEEBadge = (oee: number) => {
    if (oee >= 85) return { variant: "success" as const, label: "World Class" }
    if (oee >= 60) return { variant: "default" as const, label: "Aceptable" }
    if (oee >= 40) return { variant: "warning" as const, label: "Bajo" }
    return { variant: "destructive" as const, label: "Pobre" }
  }

  const availabilityBadge = getAvailabilityBadge(data.avgAvailability)
  const oeeBadge = getOEEBadge(data.avgOee)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* MTBF - Mean Time Between Failures */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MTBF</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.avgMtbf.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tiempo medio entre fallas
          </p>
          {data.avgMtbf > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Mayor es mejor
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MTTR - Mean Time To Repair */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MTTR</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.avgMttr.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tiempo medio de reparación
          </p>
          {data.avgMttr > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Menor es mejor
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponibilidad</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.avgAvailability.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Disponibilidad promedio
          </p>
          <div className="mt-2">
            <Badge variant={availabilityBadge.variant} className="text-xs">
              {availabilityBadge.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* OEE - Overall Equipment Effectiveness */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">OEE</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.avgOee.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Efectividad general del equipo
          </p>
          <div className="mt-2">
            <Badge variant={oeeBadge.variant} className="text-xs">
              {oeeBadge.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Critical Assets Alert */}
      {data.criticalAssets > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-destructive" />
              Activos Críticos
            </CardTitle>
            <Badge variant="destructive">{data.criticalAssets}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {data.criticalAssets} {data.criticalAssets === 1 ? "activo" : "activos"} con
              disponibilidad menor al 80%. Requiere atención inmediata.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
