/**
 * Time Tracker Card Component
 *
 * Main time tracking component with timer and action buttons
 * Displays current tracking state and allows start/pause/resume/complete actions
 */

"use client"

import { useState } from "react"
import { Play, Pause, Square, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTimeTracker } from "@/hooks/use-time-tracker"
import { PauseReasonDialog } from "./pause-reason-dialog"
import { CompleteWorkDialog } from "./complete-work-dialog"
import type { PauseReason } from "@prisma/client"

interface TimeTrackerCardProps {
  workOrderId: string
  onActionComplete?: () => void
  disabled?: boolean
}

export function TimeTrackerCard({
  workOrderId,
  onActionComplete,
  disabled = false,
}: TimeTrackerCardProps) {
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const {
    state,
    summary,
    isLoading,
    error,
    start,
    pause,
    resume,
    complete,
    formatTime,
  } = useTimeTracker({
    workOrderId,
    onActionComplete: () => {
      onActionComplete?.()
    },
    onError: (err) => {
      console.error("Time tracker error:", err)
    },
  })

  const handleStart = async () => {
    try {
      await start()
    } catch (error) {
      // Error is handled by hook
    }
  }

  const handlePause = async (reason: PauseReason, notes?: string) => {
    try {
      await pause(reason, notes)
      setShowPauseDialog(false)
    } catch (error) {
      // Error is handled by hook
    }
  }

  const handleResume = async () => {
    try {
      await resume()
    } catch (error) {
      // Error is handled by hook
    }
  }

  const handleComplete = async (notes?: string) => {
    try {
      await complete(notes)
      setShowCompleteDialog(false)
    } catch (error) {
      // Error is handled by hook
    }
  }

  // Get status badge
  const getStatusBadge = () => {
    if (!summary) return null

    switch (summary.currentStatus) {
      case "WORKING":
        return (
          <Badge variant="success" className="gap-1">
            <Clock className="h-3 w-3 animate-pulse" />
            En Progreso
          </Badge>
        )
      case "PAUSED":
        return (
          <Badge variant="warning" className="gap-1">
            <Pause className="h-3 w-3" />
            Pausado
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="default" className="gap-1">
            <Square className="h-3 w-3" />
            Completado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            No Iniciado
          </Badge>
        )
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Control de Tiempo
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-mono font-bold tabular-nums">
              {formatTime(state.elapsedSeconds)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Tiempo Total
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xl font-mono font-semibold text-green-600 dark:text-green-400">
                  {formatTime(state.activeSeconds)}
                </div>
                <div className="text-xs text-muted-foreground">Activo</div>
              </div>
              <div>
                <div className="text-xl font-mono font-semibold text-orange-600 dark:text-orange-400">
                  {formatTime(state.pausedSeconds)}
                </div>
                <div className="text-xs text-muted-foreground">Pausado</div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {!state.isTracking && summary?.currentStatus !== "COMPLETED" && (
              <Button
                size="lg"
                onClick={handleStart}
                disabled={disabled || isLoading}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Trabajo
              </Button>
            )}

            {state.isTracking && !state.isPaused && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowPauseDialog(true)}
                  disabled={disabled || isLoading}
                  className="w-full"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar Trabajo
                </Button>

                <Button
                  size="lg"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={disabled || isLoading}
                  className="w-full"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Completar Trabajo
                </Button>
              </>
            )}

            {state.isPaused && (
              <Button
                size="lg"
                onClick={handleResume}
                disabled={disabled || isLoading}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Reanudar Trabajo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PauseReasonDialog
        open={showPauseDialog}
        onOpenChange={setShowPauseDialog}
        onConfirm={handlePause}
        isLoading={isLoading}
      />

      <CompleteWorkDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onConfirm={handleComplete}
        isLoading={isLoading}
      />
    </>
  )
}
