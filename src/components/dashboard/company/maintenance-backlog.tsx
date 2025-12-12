/**
 * Maintenance Backlog Component
 *
 * Shows pending and overdue work orders by priority
 * Critical for maintenance planning and resource allocation
 *
 * Under 150 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ClipboardList, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MaintenanceBacklogProps {
  stats?: {
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
    completionRate: number
  }
  loading?: boolean
}

export function MaintenanceBacklog({ stats, loading }: MaintenanceBacklogProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Backlog de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const activeBacklog = stats.pending + stats.inProgress
  const completionPercentage = stats.completionRate || 0
  const overduePercentage = stats.total > 0
    ? ((stats.overdue / stats.total) * 100).toFixed(1)
    : '0'

  const getCompletionStatus = (rate: number): 'success' | 'warning' | 'danger' => {
    if (rate >= 80) return 'success'
    if (rate >= 60) return 'warning'
    return 'danger'
  }

  const completionStatus = getCompletionStatus(completionPercentage)

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Backlog de Mantenimiento
          </CardTitle>
          {stats.overdue > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats.overdue} vencidas
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Estado actual de órdenes de trabajo
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tasa de Completación</span>
            <span className={cn(
              "text-sm font-bold",
              completionStatus === 'success' && 'text-success',
              completionStatus === 'warning' && 'text-warning',
              completionStatus === 'danger' && 'text-destructive'
            )}>
              {completionPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={completionPercentage}
            className="h-2"
          />
        </div>

        {/* Backlog Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-info/5 rounded-lg border border-info/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-info" />
              <p className="text-xs font-medium text-muted-foreground">En Proceso</p>
            </div>
            <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
          </div>

          <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <p className="text-xs font-medium text-muted-foreground">Pendientes</p>
            </div>
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          </div>
        </div>

        {/* Active Backlog Indicator */}
        <div className={cn(
          "p-3 rounded-lg border",
          activeBacklog > 10 ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/20'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Backlog Activo</p>
              <p className="text-lg font-bold">{activeBacklog} órdenes</p>
            </div>
            {activeBacklog > 10 && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Alto
              </Badge>
            )}
          </div>
        </div>

        {/* Overdue Alert */}
        {stats.overdue > 0 && (
          <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {stats.overdue} órdenes vencidas
                </p>
                <p className="text-xs text-muted-foreground">
                  {overduePercentage}% del total requiere atención inmediata
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Stats */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completadas</span>
            <span className="font-medium text-success">{stats.completed}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">Total del período</span>
            <span className="font-medium">{stats.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
