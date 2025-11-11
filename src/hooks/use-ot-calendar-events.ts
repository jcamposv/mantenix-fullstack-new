"use client"

import { useState, useCallback, useEffect } from "react"
import type { CalendarEvent, CalendarFilters } from "@/types/calendar.types"
import { toast } from "sonner"

interface UseOTCalendarEventsOptions {
  refetchKey?: number
  initialFilters?: CalendarFilters
}

interface UseOTCalendarEventsReturn {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  fetchEvents: (start: Date, end: Date, filters?: CalendarFilters) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Custom hook for loading calendar events
 * Handles fetching, loading states, and error handling
 * Follows React Hook best practices
 */
export function useOTCalendarEvents(
  options: UseOTCalendarEventsOptions = {}
): UseOTCalendarEventsReturn {
  const { refetchKey, initialFilters } = options

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRange, setLastRange] = useState<{ start: Date; end: Date } | null>(null)
  const [currentFilters, setCurrentFilters] = useState<CalendarFilters | undefined>(
    initialFilters
  )

  /**
   * Fetch calendar events from API
   */
  const fetchEvents = useCallback(
    async (start: Date, end: Date, filters?: CalendarFilters): Promise<void> => {
      try {
        setLoading(true)
        setError(null)

        // Store range and filters for refetch
        setLastRange({ start, end })
        setCurrentFilters(filters)

        const startISO = start.toISOString()
        const endISO = end.toISOString()

        // Build query params
        const params = new URLSearchParams({
          startDate: startISO,
          endDate: endISO,
        })

        // Add filters if provided
        if (filters) {
          params.append("filters", JSON.stringify(filters))
        }

        const response = await fetch(`/api/calendar/events?${params.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al cargar eventos del calendario")
        }

        const data = await response.json()
        setEvents(data.events || [])
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido al cargar eventos"
        setError(errorMessage)
        console.error("Error fetching calendar events:", err)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Refetch with last used range and filters
   */
  const refetch = useCallback(async (): Promise<void> => {
    if (lastRange) {
      await fetchEvents(lastRange.start, lastRange.end, currentFilters)
    }
  }, [lastRange, currentFilters, fetchEvents])

  /**
   * Refetch when refetchKey changes
   */
  useEffect(() => {
    if (refetchKey !== undefined && lastRange) {
      refetch()
    }
  }, [refetchKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    events,
    loading,
    error,
    fetchEvents,
    refetch,
  }
}
