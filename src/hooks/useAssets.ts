/**
 * useAssets Hook
 *
 * Custom hook for fetching and managing assets list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in dropdowns, selects, and forms.
 *
 * Usage:
 * const { assets, loading, error, mutate } = useAssets()
 */

"use client"

import useSWR from "swr"

export interface Asset {
  id: string
  name: string
  code: string
  status: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  location: string
  siteId: string
  // Add other asset fields as needed
}

interface AssetsResponse {
  assets?: Asset[]
  items?: Asset[]
}

const fetcher = async (url: string): Promise<Asset[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar activos')
  }
  const data: AssetsResponse = await response.json()

  // Handle both response formats: { assets: [...] } or { items: [...] }
  return (data.assets || data.items || []) as Asset[]
}

interface UseAssetsOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Filter by status
  status?: string
  // Limit results
  limit?: number
}

interface UseAssetsReturn {
  assets: Asset[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<Asset[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage assets list
 *
 * @param options - SWR configuration options and query params
 * @returns Assets array, loading state, error, and mutate function
 */
export function useAssets(
  options: UseAssetsOptions = {}
): UseAssetsReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    status,
    limit,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (limit) params.append('limit', limit.toString())
  const queryString = params.toString()
  const endpoint = `/api/admin/assets${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<Asset[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Assets list changes moderately, cache for 30 seconds
      focusThrottleInterval: 30000,
      onError: (err) => {
        console.error('Error fetching assets:', err)
      }
    }
  )

  return {
    assets: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}
