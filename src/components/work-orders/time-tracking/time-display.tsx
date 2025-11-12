/**
 * Time Display Component
 *
 * Isolated component with its own stopwatch
 * Prevents parent component from re-rendering every second
 */

"use client"

import { useEffect } from "react"
import { useStopwatch } from "react-timer-hook"

interface TimeDisplayProps {
  baseActiveMinutes: number
  basePausedMinutes: number
  baseTotalMinutes: number
  isRunning: boolean
  onStopwatchRef?: (stopwatch: ReturnType<typeof useStopwatch>) => void
}

export function TimeDisplay({
  baseActiveMinutes,
  basePausedMinutes,
  baseTotalMinutes,
  isRunning,
  onStopwatchRef,
}: TimeDisplayProps) {
  const stopwatch = useStopwatch({ autoStart: false })

  // Expose stopwatch to parent on mount
  useEffect(() => {
    onStopwatchRef?.(stopwatch)
  }, [onStopwatchRef, stopwatch])

  // Control stopwatch based on isRunning prop
  useEffect(() => {
    if (isRunning && !stopwatch.isRunning) {
      stopwatch.start()
    } else if (!isRunning && stopwatch.isRunning) {
      stopwatch.pause()
    }
  }, [isRunning, stopwatch])

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate seconds from stopwatch
  const stopwatchSeconds = stopwatch.hours * 3600 + stopwatch.minutes * 60 + stopwatch.seconds

  // Calculate display times
  const activeSeconds = baseActiveMinutes * 60 + stopwatchSeconds
  const pausedSeconds = basePausedMinutes * 60
  const totalSeconds = baseTotalMinutes * 60 + stopwatchSeconds

  return (
    <div className="bg-gradient-to-br from-background to-muted/20 border-2 rounded-xl p-6 text-center shadow-sm">
      <div className="text-5xl font-mono font-bold tabular-nums tracking-tight mb-1">
        {formatTime(totalSeconds)}
      </div>
      <div className="text-sm font-medium text-muted-foreground">
        Tiempo Total
      </div>

      {/* Breakdown with visual indicators */}
      <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t">
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
          <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
            {formatTime(activeSeconds)}
          </div>
          <div className="text-xs font-medium text-muted-foreground mt-1">Tiempo Activo</div>
        </div>
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
          <div className="text-2xl font-mono font-bold text-orange-600 dark:text-orange-400">
            {formatTime(pausedSeconds)}
          </div>
          <div className="text-xs font-medium text-muted-foreground mt-1">Pausado</div>
        </div>
      </div>
    </div>
  )
}
