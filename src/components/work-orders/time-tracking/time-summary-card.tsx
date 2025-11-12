/**
 * Time Summary Card Component
 *
 * Displays time tracking summary and breakdown
 */

"use client"

import { Clock, Activity, Pause, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTimeTracker } from "@/hooks/use-time-tracker"

interface TimeSummaryCardProps {
  workOrderId: string
}

const PAUSE_REASON_LABELS: Record<string, string> = {
  WAITING_PARTS: "Esperando Repuestos",
  WAITING_APPROVAL: "Esperando Aprobación",
  LUNCH_BREAK: "Hora de Almuerzo",
  OTHER_PRIORITY: "Otra Prioridad",
  TECHNICAL_ISSUE: "Problema Técnico",
  TRAVEL: "Viaje/Traslado",
  OTHER: "Otro",
}

export function TimeSummaryCard({ workOrderId }: TimeSummaryCardProps) {
  const { summary } = useTimeTracker({ workOrderId })

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const seconds = Math.floor(totalSeconds)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay datos de tiempo disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalMinutes = summary.totalElapsedMinutes
  const activeMinutes = summary.activeWorkMinutes
  const pausedMinutes = summary.pausedMinutes

  const activePercentage =
    totalMinutes > 0 ? (activeMinutes / totalMinutes) * 100 : 0
  const pausedPercentage =
    totalMinutes > 0 ? (pausedMinutes / totalMinutes) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Resumen de Tiempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatTime(totalMinutes * 60)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatTime(activeMinutes * 60)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Activo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatTime(pausedMinutes * 60)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Pausado</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Distribución de Tiempo</span>
            <span>{activePercentage.toFixed(0)}% Activo</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 dark:bg-green-400"
              style={{ width: `${activePercentage}%` }}
            />
            <div
              className="bg-orange-500 dark:bg-orange-400"
              style={{ width: `${pausedPercentage}%` }}
            />
          </div>
        </div>

        {/* Pause Breakdown */}
        {summary.pauseBreakdown.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Pause className="h-4 w-4" />
              Desglose de Pausas
            </div>
            <div className="space-y-1">
              {summary.pauseBreakdown.map((pause) => (
                <div
                  key={pause.reason}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {PAUSE_REASON_LABELS[pause.reason] || pause.reason}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs">
                    {formatTime(pause.minutes * 60)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning if too much paused time */}
        {pausedPercentage > 50 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-900 dark:text-orange-200">
              <p className="font-medium">Alto tiempo de pausa</p>
              <p className="text-orange-700 dark:text-orange-300 mt-1">
                Más del 50% del tiempo ha sido en pausas. Revisa si hay
                problemas recurrentes.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
