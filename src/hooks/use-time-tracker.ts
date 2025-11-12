/**
 * useTimeTracker Hook
 *
 * Custom hook for work order time tracking
 * Manages timer state, actions (start, pause, resume, complete), and real-time updates
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TimeLogAction, PauseReason } from "@prisma/client"
import type { TimeTrackerState, TimeLogSummary } from "@/types/time-tracking.types"

interface UseTimeTrackerOptions {
  workOrderId: string
  onActionComplete?: (action: TimeLogAction) => void
  onError?: (error: string) => void
}

interface UseTimeTrackerReturn {
  // State
  state: TimeTrackerState
  summary: TimeLogSummary | null
  isLoading: boolean
  error: string | null

  // Actions
  start: () => Promise<void>
  pause: (reason: PauseReason, notes?: string) => Promise<void>
  resume: () => Promise<void>
  complete: (notes?: string) => Promise<void>

  // Utils
  refresh: () => Promise<void>
  formatTime: (seconds: number) => string
}

export function useTimeTracker({
  workOrderId,
  onActionComplete,
  onError,
}: UseTimeTrackerOptions): UseTimeTrackerReturn {
  const [state, setState] = useState<TimeTrackerState>({
    isTracking: false,
    isPaused: false,
    startTime: null,
    lastPauseTime: null,
    elapsedSeconds: 0,
    activeSeconds: 0,
    pausedSeconds: 0,
  })

  const [summary, setSummary] = useState<TimeLogSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Fetch time summary from API
   */
  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/work-orders/${workOrderId}/time-summary`
      )

      if (!response.ok) {
        throw new Error("Error al obtener resumen de tiempo")
      }

      const data = await response.json()

      if (data.success) {
        setSummary(data.data)

        // Update state based on summary
        setState((prev) => ({
          ...prev,
          isTracking:
            data.data.currentStatus === "WORKING" ||
            data.data.currentStatus === "PAUSED",
          isPaused: data.data.currentStatus === "PAUSED",
          startTime: data.data.lastActionTimestamp
            ? new Date(data.data.lastActionTimestamp)
            : null,
          activeSeconds: data.data.activeWorkMinutes * 60,
          pausedSeconds: data.data.pausedMinutes * 60,
          elapsedSeconds: data.data.totalElapsedMinutes * 60,
        }))
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [workOrderId, onError])

  /**
   * Log a time action
   */
  const logAction = useCallback(
    async (
      action: TimeLogAction,
      options?: { pauseReason?: PauseReason; notes?: string }
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        // Get geolocation if available
        let location: GeolocationPosition | null = null
        if (navigator.geolocation) {
          try {
            location = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 5000,
                  maximumAge: 60000,
                })
              }
            )
          } catch {
            // Geolocation failed, continue without it
          }
        }

        const response = await fetch(
          `/api/work-orders/${workOrderId}/time-logs`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action,
              pauseReason: options?.pauseReason,
              notes: options?.notes,
              location: location
                ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                    timestamp: location.timestamp,
                  }
                : undefined,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al registrar acción")
        }

        // Refresh summary
        await fetchSummary()

        onActionComplete?.(action)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido"
        setError(errorMessage)
        onError?.(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [workOrderId, fetchSummary, onActionComplete, onError]
  )

  /**
   * Start working
   */
  const start = useCallback(async () => {
    await logAction("START")
  }, [logAction])

  /**
   * Pause work
   */
  const pause = useCallback(
    async (reason: PauseReason, notes?: string) => {
      await logAction("PAUSE", { pauseReason: reason, notes })
    },
    [logAction]
  )

  /**
   * Resume work
   */
  const resume = useCallback(async () => {
    await logAction("RESUME")
  }, [logAction])

  /**
   * Complete work
   */
  const complete = useCallback(
    async (notes?: string) => {
      await logAction("COMPLETE", { notes })
    },
    [logAction]
  )

  /**
   * Format seconds to HH:MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  /**
   * Update timer every second when tracking
   */
  useEffect(() => {
    if (state.isTracking && !state.isPaused && state.startTime) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev.startTime) return prev

          const now = Date.now()
          const elapsed = Math.floor((now - prev.startTime.getTime()) / 1000)

          return {
            ...prev,
            elapsedSeconds: elapsed,
            activeSeconds: prev.activeSeconds + 1,
          }
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [state.isTracking, state.isPaused, state.startTime])

  /**
   * Fetch initial summary on mount
   */
  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  /**
   * Refresh summary
   */
  const refresh = useCallback(async () => {
    await fetchSummary()
  }, [fetchSummary])

  return {
    state,
    summary,
    isLoading,
    error,
    start,
    pause,
    resume,
    complete,
    refresh,
    formatTime,
  }
}
