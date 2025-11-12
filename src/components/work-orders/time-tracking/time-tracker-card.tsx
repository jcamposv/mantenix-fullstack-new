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
import { TimeDisplay } from "./time-display"
import { PauseReasonDialog } from "./pause-reason-dialog"
import { CompleteWorkDialog } from "./complete-work-dialog"
import type { PauseReason } from "@prisma/client"
import { cn } from "@/lib/utils"

interface TimeTrackerCardProps {
  workOrderId: string
  workOrderStatus: string
  onActionComplete?: () => void
  onStartWork?: () => Promise<void>
  disabled?: boolean
}

export function TimeTrackerCard({
  workOrderId,
  workOrderStatus,
  onActionComplete,
  onStartWork,
  disabled = false,
}: TimeTrackerCardProps) {
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const {
    isTracking,
    isPaused,
    summary,
    isLoading,
    error,
    baseActiveMinutes,
    basePausedMinutes,
    baseTotalMinutes,
    start,
    pause,
    resume,
    complete,
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
      setIsStarting(true)
      // If work order is ASSIGNED, change status to IN_PROGRESS first
      if (workOrderStatus === 'ASSIGNED' && onStartWork) {
        await onStartWork()
      }
      // Then start time tracking
      await start()
    } catch (error) {
      // Error is handled by hook
    } finally {
      setIsStarting(false)
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

  // Get current status color scheme
  const getStatusColors = () => {
    if (!summary) return { bg: "bg-muted/30", text: "text-muted-foreground" }

    switch (summary.currentStatus) {
      case "WORKING":
        return {
          bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
          text: "text-green-700 dark:text-green-300",
          accent: "bg-green-500"
        }
      case "PAUSED":
        return {
          bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
          text: "text-orange-700 dark:text-orange-300",
          accent: "bg-orange-500"
        }
      default:
        return {
          bg: "bg-muted/30 border-muted",
          text: "text-muted-foreground",
          accent: "bg-muted"
        }
    }
  }

  const statusColors = getStatusColors()

  return (
    <>
      <Card className={cn("border-2 transition-colors", statusColors.bg)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Control de Tiempo
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Enhanced Timer Display */}
          <TimeDisplay
            baseActiveMinutes={baseActiveMinutes}
            basePausedMinutes={basePausedMinutes}
            baseTotalMinutes={baseTotalMinutes}
            isRunning={isTracking && !isPaused}
          />

          {/* Error Display with better visual treatment */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-3">
              <div className="bg-destructive/20 rounded-full p-1 flex-shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 text-sm font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons with better touch targets */}
          <div className="flex flex-col gap-3 pt-2">
            {!isTracking && summary?.currentStatus !== "COMPLETED" && (
              <Button
                size="lg"
                onClick={handleStart}
                disabled={disabled || isLoading || isStarting}
                className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Play className="h-5 w-5 mr-2" />
                {isStarting ? "Iniciando..." : "Iniciar Trabajo"}
              </Button>
            )}

            {isTracking && !isPaused && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowPauseDialog(true)}
                    disabled={disabled || isLoading}
                    className="h-14 font-semibold border-2"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => setShowCompleteDialog(true)}
                    disabled={disabled || isLoading}
                    className="h-14 font-semibold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-primary/90"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Completar
                  </Button>
                </div>
              </>
            )}

            {isPaused && (
              <Button
                size="lg"
                onClick={handleResume}
                disabled={disabled || isLoading}
                className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all bg-green-600 hover:bg-green-700"
              >
                <Play className="h-5 w-5 mr-2" />
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
