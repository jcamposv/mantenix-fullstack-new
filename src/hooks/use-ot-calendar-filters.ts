"use client"

import { useState, useCallback } from "react"
import type { CalendarFilters, CalendarEventType } from "@/types/calendar.types"
import type { WorkOrderStatus, WorkOrderPriority } from "@/types/work-order.types"

interface UseOTCalendarFiltersReturn {
  filters: CalendarFilters
  setEventTypes: (types: CalendarEventType[]) => void
  setStatuses: (statuses: WorkOrderStatus[]) => void
  setPriorities: (priorities: WorkOrderPriority[]) => void
  setAssignedUserIds: (userIds: string[]) => void
  setAssetIds: (assetIds: string[]) => void
  setSiteIds: (siteIds: string[]) => void
  setShowCompleted: (show: boolean) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

const defaultFilters: CalendarFilters = {
  eventTypes: [],
  statuses: [],
  priorities: [],
  assignedUserIds: [],
  assetIds: [],
  siteIds: [],
  showCompleted: true,
}

/**
 * Custom hook for managing calendar filters
 * Provides filter state and update functions
 * Follows clean code principles with clear method names
 */
export function useOTCalendarFilters(
  initialFilters?: Partial<CalendarFilters>
): UseOTCalendarFiltersReturn {
  const [filters, setFilters] = useState<CalendarFilters>({
    ...defaultFilters,
    ...initialFilters,
  })

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    filters.eventTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignedUserIds.length > 0 ||
    filters.assetIds.length > 0 ||
    filters.siteIds.length > 0 ||
    !filters.showCompleted

  /**
   * Update event types filter
   */
  const setEventTypes = useCallback((types: CalendarEventType[]): void => {
    setFilters((prev) => ({ ...prev, eventTypes: types }))
  }, [])

  /**
   * Update statuses filter
   */
  const setStatuses = useCallback((statuses: WorkOrderStatus[]): void => {
    setFilters((prev) => ({ ...prev, statuses }))
  }, [])

  /**
   * Update priorities filter
   */
  const setPriorities = useCallback((priorities: WorkOrderPriority[]): void => {
    setFilters((prev) => ({ ...prev, priorities }))
  }, [])

  /**
   * Update assigned user IDs filter
   */
  const setAssignedUserIds = useCallback((userIds: string[]): void => {
    setFilters((prev) => ({ ...prev, assignedUserIds: userIds }))
  }, [])

  /**
   * Update asset IDs filter
   */
  const setAssetIds = useCallback((assetIds: string[]): void => {
    setFilters((prev) => ({ ...prev, assetIds }))
  }, [])

  /**
   * Update site IDs filter
   */
  const setSiteIds = useCallback((siteIds: string[]): void => {
    setFilters((prev) => ({ ...prev, siteIds }))
  }, [])

  /**
   * Update show completed filter
   */
  const setShowCompleted = useCallback((show: boolean): void => {
    setFilters((prev) => ({ ...prev, showCompleted: show }))
  }, [])

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback((): void => {
    setFilters(defaultFilters)
  }, [])

  return {
    filters,
    setEventTypes,
    setStatuses,
    setPriorities,
    setAssignedUserIds,
    setAssetIds,
    setSiteIds,
    setShowCompleted,
    resetFilters,
    hasActiveFilters,
  }
}
