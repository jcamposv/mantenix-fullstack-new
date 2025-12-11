/**
 * Industrial KPIs Component
 *
 * Displays key industrial maintenance metrics:
 * - MTBF (Mean Time Between Failures)
 * - MTTR (Mean Time To Repair)
 * - OEE (Overall Equipment Effectiveness)
 * - Availability
 *
 * Under 200 lines - Clean composition
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Wrench,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IndustrialKPIsProps {
  metrics?: {
    avgMtbf: number // hours
    avgMttr: number // hours
    avgOee: number // percentage
    avgAvailability: number // percentage
    totalDowntime: number // hours
  }
  loading?: boolean
}

export function IndustrialKPIs({ metrics, loading }: IndustrialKPIsProps) {
  if (loading) {
    return (
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const getAvailabilityStatus = (value: number): 'success' | 'warning' | 'danger' => {
    if (value >= 95) return 'success'
    if (value >= 85) return 'warning'
    return 'danger'
  }

  const getOeeStatus = (value: number): 'success' | 'warning' | 'danger' => {
    if (value >= 85) return 'success'
    if (value >= 65) return 'warning'
    return 'danger'
  }

  const getMtbfStatus = (hours: number): 'success' | 'warning' | 'danger' => {
    if (hours >= 720) return 'success' // >= 30 days
    if (hours >= 168) return 'warning' // >= 7 days
    return 'danger'
  }

  const getMttrStatus = (hours: number): 'success' | 'warning' | 'danger' => {
    if (hours <= 4) return 'success'
    if (hours <= 24) return 'warning'
    return 'danger'
  }

  const formatHours = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}min`
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) return `${days}d`
    return `${days}d ${remainingHours.toFixed(0)}h`
  }

  const availabilityStatus = getAvailabilityStatus(metrics.avgAvailability)
  const oeeStatus = getOeeStatus(metrics.avgOee)
  const mtbfStatus = getMtbfStatus(metrics.avgMtbf)
  const mttrStatus = getMttrStatus(metrics.avgMttr)

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {/* MTBF */}
      <Card className={cn(
        "shadow-none border-l-4 transition-colors",
        mtbfStatus === 'success' && 'border-l-success bg-success/5',
        mtbfStatus === 'warning' && 'border-l-warning bg-warning/5',
        mtbfStatus === 'danger' && 'border-l-destructive bg-destructive/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1.5 rounded-md",
              mtbfStatus === 'success' && 'bg-success/10',
              mtbfStatus === 'warning' && 'bg-warning/10',
              mtbfStatus === 'danger' && 'bg-destructive/10'
            )}>
              <Activity className={cn(
                "h-4 w-4",
                mtbfStatus === 'success' && 'text-success',
                mtbfStatus === 'warning' && 'text-warning',
                mtbfStatus === 'danger' && 'text-destructive'
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">MTBF</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{formatHours(metrics.avgMtbf)}</p>
            <p className="text-xs text-muted-foreground">Tiempo entre fallas</p>
          </div>
        </CardContent>
      </Card>

      {/* MTTR */}
      <Card className={cn(
        "shadow-none border-l-4 transition-colors",
        mttrStatus === 'success' && 'border-l-success bg-success/5',
        mttrStatus === 'warning' && 'border-l-warning bg-warning/5',
        mttrStatus === 'danger' && 'border-l-destructive bg-destructive/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1.5 rounded-md",
              mttrStatus === 'success' && 'bg-success/10',
              mttrStatus === 'warning' && 'bg-warning/10',
              mttrStatus === 'danger' && 'bg-destructive/10'
            )}>
              <Wrench className={cn(
                "h-4 w-4",
                mttrStatus === 'success' && 'text-success',
                mttrStatus === 'warning' && 'text-warning',
                mttrStatus === 'danger' && 'text-destructive'
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">MTTR</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{formatHours(metrics.avgMttr)}</p>
            <p className="text-xs text-muted-foreground">Tiempo de reparación</p>
          </div>
        </CardContent>
      </Card>

      {/* OEE */}
      <Card className={cn(
        "shadow-none border-l-4 transition-colors",
        oeeStatus === 'success' && 'border-l-success bg-success/5',
        oeeStatus === 'warning' && 'border-l-warning bg-warning/5',
        oeeStatus === 'danger' && 'border-l-destructive bg-destructive/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1.5 rounded-md",
              oeeStatus === 'success' && 'bg-success/10',
              oeeStatus === 'warning' && 'bg-warning/10',
              oeeStatus === 'danger' && 'bg-destructive/10'
            )}>
              <TrendingUp className={cn(
                "h-4 w-4",
                oeeStatus === 'success' && 'text-success',
                oeeStatus === 'warning' && 'text-warning',
                oeeStatus === 'danger' && 'text-destructive'
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">OEE</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics.avgOee.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Eficiencia del equipo</p>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className={cn(
        "shadow-none border-l-4 transition-colors",
        availabilityStatus === 'success' && 'border-l-success bg-success/5',
        availabilityStatus === 'warning' && 'border-l-warning bg-warning/5',
        availabilityStatus === 'danger' && 'border-l-destructive bg-destructive/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1.5 rounded-md",
              availabilityStatus === 'success' && 'bg-success/10',
              availabilityStatus === 'warning' && 'bg-warning/10',
              availabilityStatus === 'danger' && 'bg-destructive/10'
            )}>
              <Clock className={cn(
                "h-4 w-4",
                availabilityStatus === 'success' && 'text-success',
                availabilityStatus === 'warning' && 'text-warning',
                availabilityStatus === 'danger' && 'text-destructive'
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Disponibilidad</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics.avgAvailability.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Tiempo operativo</p>
            {metrics.totalDowntime > 0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {formatHours(metrics.totalDowntime)} downtime
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
