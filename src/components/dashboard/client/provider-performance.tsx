"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProviderPerformanceProps {
  slaCompliance: number // Percentage
  avgResponseTime: number // Hours
  avgResolutionTime: number // Hours
  serviceRating?: number // 0-100
  loading?: boolean
}

export function ProviderPerformance({
  slaCompliance,
  avgResponseTime,
  avgResolutionTime,
  serviceRating,
  loading = false
}: ProviderPerformanceProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Rendimiento del Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSLAStatus = (compliance: number) => {
    if (compliance >= 95) return { status: "excellent", color: "success", label: "Excelente" }
    if (compliance >= 85) return { status: "good", color: "info", label: "Bueno" }
    if (compliance >= 70) return { status: "warning", color: "warning", label: "Regular" }
    return { status: "critical", color: "destructive", label: "Crítico" }
  }

  const getResponseTimeStatus = (hours: number) => {
    if (hours <= 2) return "success"
    if (hours <= 4) return "info"
    if (hours <= 8) return "warning"
    return "destructive"
  }

  const getResolutionTimeStatus = (hours: number) => {
    if (hours <= 24) return "success"
    if (hours <= 48) return "info"
    if (hours <= 72) return "warning"
    return "destructive"
  }

  const slaStatus = getSLAStatus(slaCompliance)
  const responseStatus = getResponseTimeStatus(avgResponseTime)
  const resolutionStatus = getResolutionTimeStatus(avgResolutionTime)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-success bg-success/5 border-success/20"
      case "info": return "text-info bg-info/5 border-info/20"
      case "warning": return "text-warning bg-warning/5 border-warning/20"
      case "destructive": return "text-destructive bg-destructive/5 border-destructive/20"
      default: return "text-muted-foreground bg-muted/50 border-border"
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Rendimiento del Proveedor
          </CardTitle>
          {serviceRating && (
            <Badge variant="outline" className="text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              {serviceRating}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SLA Compliance */}
          <div className={cn(
            "p-3 rounded-lg border transition-all",
            getStatusColor(slaStatus.color)
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">SLA</p>
              <Badge variant="outline" className="ml-auto bg-background/80 border-current/20 text-xs px-1.5 py-0">
                {slaStatus.label}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{slaCompliance}%</p>
          </div>

          {/* Average Response Time */}
          <div className={cn(
            "p-3 rounded-lg border transition-all",
            getStatusColor(responseStatus)
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">Respuesta</p>
              {avgResponseTime <= 2 && (
                <Badge variant="outline" className="ml-auto bg-background/80 border-current/20 text-xs px-1.5 py-0">
                  Rápido
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{avgResponseTime.toFixed(1)}</p>
              <span className="text-xs opacity-70">hrs</span>
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className={cn(
            "p-3 rounded-lg border transition-all",
            getStatusColor(resolutionStatus)
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">Resolución</p>
              {avgResolutionTime <= 24 && (
                <Badge variant="outline" className="ml-auto bg-background/80 border-current/20 text-xs px-1.5 py-0">
                  Eficiente
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}</p>
              <span className="text-xs opacity-70">hrs</span>
            </div>
          </div>

          {/* Service Quality Score */}
          <div className="p-3 rounded-lg border bg-primary/5 border-primary/20 text-primary transition-all">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">Calidad</p>
              {(serviceRating || slaCompliance) >= 90 && (
                <Badge variant="outline" className="ml-auto bg-background/80 border-current/20 text-xs px-1.5 py-0">
                  Óptimo
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">
              {serviceRating || Math.round((slaCompliance + (100 - Math.min(avgResponseTime * 5, 100))) / 2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
