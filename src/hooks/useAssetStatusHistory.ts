/**
 * useAssetStatusHistory Hook
 *
 * Custom hook for fetching asset status change history with pagination and filtering.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 *
 * Usage:
 * const { history, total, loading, error, mutate } = useAssetStatusHistory(assetId, {
 *   limit: 10,
 *   page: 1,
 *   startDate: new Date(),
 *   endDate: new Date()
 * })
 */

"use client"

import useSWR from "swr"

export interface AssetStatusHistoryItem {
  id: string
  assetId: string
  status: string
  startedAt: string
  endedAt: string | null
  reason: string | null
  notes: string | null
  changedBy: string | null
  workOrderId: string | null
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  workOrder: {
    id: string
    number: string
    title: string
    status: string
  } | null
  asset: {
    id: string
    name: string
    code: string
    status: string
  }
  createdAt: string
  updatedAt: string
}

interface AssetStatusHistoryResponse {
  history: AssetStatusHistoryItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const fetcher = async (url: string): Promise<AssetStatusHistoryResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar historial de cambios')
  }
  const data = await response.json()
  return data
}

interface UseAssetStatusHistoryOptions {
  // Number of items per page
  limit?: number
  // Current page (1-indexed)
  page?: number
  // Filter by start date
  startDate?: Date
  // Filter by end date
  endDate?: Date
  // Revalidate on focus
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds
  refreshInterval?: number
}

interface UseAssetStatusHistoryReturn {
  history: AssetStatusHistoryItem[]
  total: number
  totalPages: number
  page: number
  limit: number
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<AssetStatusHistoryResponse | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch asset status change history
 *
 * @param assetId - The ID of the asset
 * @param options - Pagination and filtering options
 * @returns Status history data, loading state, error, and mutate function
 */
export function useAssetStatusHistory(
  assetId: string | null | undefined,
  options: UseAssetStatusHistoryOptions = {}
): UseAssetStatusHistoryReturn {
  const {
    limit,
    page,
    startDate,
    endDate,
    revalidateOnFocus = false,
    refreshInterval = 0,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (page) params.append('page', page.toString())
  if (startDate) params.append('startDate', startDate.toISOString())
  if (endDate) params.append('endDate', endDate.toISOString())

  const endpoint = assetId
    ? `/api/assets/${assetId}/status-history?${params.toString()}`
    : null

  const { data, error, isLoading, mutate, isValidating } = useSWR<AssetStatusHistoryResponse>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      // Status history can change, cache for 20 seconds
      focusThrottleInterval: 20000,
      onError: (err) => {
        console.error('Error fetching asset status history:', err)
      }
    }
  )

  return {
    history: data?.history || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    page: data?.page || page || 1,
    limit: data?.limit || limit || 10,
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}
