/**
 * Work Order Stats Component
 *
 * Displays status distribution and completion metrics
 * Used in Operations Dashboard
 *
 * Under 150 lines
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  CheckCircle2,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react'

interface WorkOrderStatsProps {
  stats?: {
    completed?: number
    inProgress?: number
    pending?: number
    overdue?: number
    avgCompletionTime?: number
  } | null
}

export function WorkOrderStats({ stats }: WorkOrderStatsProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen de Estados
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Distribución actual de órdenes por estado
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-success">Completadas</p>
                <p className="text-xs text-muted-foreground">Finalizadas</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-success">
              {stats?.completed || 0}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-info/5 rounded-lg border border-info/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-info/10">
                <Activity className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-info">En Progreso</p>
                <p className="text-xs text-muted-foreground">Ejecutándose</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-info">
              {stats?.inProgress || 0}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-warning">Pendientes</p>
                <p className="text-xs text-muted-foreground">Por iniciar</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-warning">
              {stats?.pending || 0}
            </div>
          </div>

          {(stats?.overdue ?? 0) > 0 && (
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Vencidas</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {stats?.overdue || 0}
              </div>
            </div>
          )}
        </div>

        {/* Additional Metrics */}
        {stats?.avgCompletionTime && stats.avgCompletionTime > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tiempo Promedio de Completación</span>
              </div>
              <Badge variant="secondary">
                {stats.avgCompletionTime} {stats.avgCompletionTime === 1 ? 'hora' : 'horas'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
