/**
 * useTimeTracker Hook
 *
 * Custom hook for work order time tracking
 * Uses react-timer-hook for reliable stopwatch functionality
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TimeLogAction, PauseReason } from "@prisma/client"
import type { TimeLogSummary } from "@/types/time-tracking.types"

interface UseTimeTrackerOptions {
  workOrderId: string
  onActionComplete?: (action: TimeLogAction) => void
  onError?: (error: string) => void
}

interface UseTimeTrackerReturn {
  // State
  isTracking: boolean
  isPaused: boolean
  summary: TimeLogSummary | null
  isLoading: boolean
  error: string | null

  // Base time values (in minutes)
  baseActiveMinutes: number
  basePausedMinutes: number
  baseTotalMinutes: number

  // Actions
  start: () => Promise<void>
  pause: (reason: PauseReason, notes?: string) => Promise<void>
  resume: () => Promise<void>
  complete: (notes?: string) => Promise<void>

  // Utils
  refresh: () => Promise<void>
}

export function useTimeTracker({
  workOrderId,
  onActionComplete,
  onError,
}: UseTimeTrackerOptions): UseTimeTrackerReturn {
  // API state
  const [summary, setSummary] = useState<TimeLogSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tracking state
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Base times from server (in minutes)
  const [baseActiveMinutes, setBaseActiveMinutes] = useState(0)
  const [basePausedMinutes, setBasePausedMinutes] = useState(0)
  const [baseTotalMinutes, setBaseTotalMinutes] = useState(0)

  // Stable refs for callbacks to prevent unnecessary re-fetches
  const onActionCompleteRef = useRef(onActionComplete)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onActionCompleteRef.current = onActionComplete
    onErrorRef.current = onError
  }, [onActionComplete, onError])

  // Prevent duplicate fetches
  const isFetching = useRef(false)

  /**
   * Fetch time summary from API
   */
  const fetchSummary = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetching.current) {
      return
    }

    isFetching.current = true

    try {
      const response = await fetch(
        `/api/work-orders/${workOrderId}/time-summary`
      )

      if (!response.ok) {
        throw new Error("Error al obtener resumen de tiempo")
      }

      const data = await response.json()

      if (data.success) {
        const summaryData = data.data as TimeLogSummary
        setSummary(summaryData)

        const isNowTracking =
          summaryData.currentStatus === "WORKING" ||
          summaryData.currentStatus === "PAUSED"
        const isNowPaused = summaryData.currentStatus === "PAUSED"

        // Update base times from server (keep in minutes)
        setBaseActiveMinutes(summaryData.activeWorkMinutes)
        setBasePausedMinutes(summaryData.pausedMinutes)
        setBaseTotalMinutes(summaryData.totalElapsedMinutes)

        // Update tracking state
        setIsTracking(isNowTracking)
        setIsPaused(isNowPaused)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      onErrorRef.current?.(errorMessage)
    } finally {
      isFetching.current = false
    }
  }, [workOrderId])

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
              // Send client timestamp for accuracy (avoids network delay)
              timestamp: new Date().toISOString(),
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

        // Refresh summary after action
        await fetchSummary()

        onActionCompleteRef.current?.(action)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido"
        setError(errorMessage)
        onErrorRef.current?.(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [workOrderId, fetchSummary]
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
   * Refresh summary
   */
  const refresh = useCallback(async () => {
    await fetchSummary()
  }, [fetchSummary])

  /**
   * Fetch initial summary on mount (only once)
   */
  useEffect(() => {
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    // State
    isTracking,
    isPaused,
    summary,
    isLoading,
    error,

    // Base time values (in minutes)
    baseActiveMinutes,
    basePausedMinutes,
    baseTotalMinutes,

    // Actions
    start,
    pause,
    resume,
    complete,

    // Utils
    refresh,
  }
}
