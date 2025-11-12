/**
 * useTimeLogs Hook
 *
 * Custom hook for fetching work order time logs
 * Uses SWR for caching and automatic revalidation
 */

"use client"

import useSWR from "swr"
import type { WorkOrderTimeLog, WorkOrderTimeLogWithUser } from "@/types/time-tracking.types"

interface UseTimeLogsOptions {
  workOrderId: string
  includeUser?: boolean
  limit?: number
  offset?: number
  refreshInterval?: number
}

interface UseTimeLogsReturn {
  logs: WorkOrderTimeLog[] | WorkOrderTimeLogWithUser[] | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Error al cargar logs de tiempo")
  }

  const data = await response.json()
  return data.data
}

export function useTimeLogs({
  workOrderId,
  includeUser = false,
  limit,
  offset,
  refreshInterval = 30000, // 30 seconds default
}: UseTimeLogsOptions): UseTimeLogsReturn {
  // Build query string
  const queryParams = new URLSearchParams()
  if (includeUser) queryParams.append("includeUser", "true")
  if (limit) queryParams.append("limit", limit.toString())
  if (offset) queryParams.append("offset", offset.toString())

  const queryString = queryParams.toString()
  const url = `/api/work-orders/${workOrderId}/time-logs${
    queryString ? `?${queryString}` : ""
  }`

  const { data, error, isLoading, mutate } = useSWR<
    WorkOrderTimeLog[] | WorkOrderTimeLogWithUser[]
  >(url, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    logs: data,
    isLoading,
    error,
    mutate,
  }
}
