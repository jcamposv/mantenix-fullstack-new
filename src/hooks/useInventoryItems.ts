/**
 * useInventoryItems Hook
 *
 * Custom hook for fetching and managing inventory items list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in dropdowns, selects, and inventory management forms.
 *
 * Usage:
 * const { items, loading, error, mutate } = useInventoryItems()
 */

"use client"

import useSWR from "swr"

export interface InventoryItem {
  id: string
  name: string
  sku: string
  description: string | null
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  category: string | null
  // Add other inventory item fields as needed
}

interface InventoryItemsResponse {
  items?: InventoryItem[]
}

const fetcher = async (url: string): Promise<InventoryItem[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar items de inventario')
  }
  const data: InventoryItemsResponse = await response.json()

  return (data.items || []) as InventoryItem[]
}

interface UseInventoryItemsOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Limit results
  limit?: number
}

interface UseInventoryItemsReturn {
  items: InventoryItem[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<InventoryItem[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage inventory items list
 *
 * @param options - SWR configuration options and query params
 * @returns Inventory items array, loading state, error, and mutate function
 */
export function useInventoryItems(
  options: UseInventoryItemsOptions = {}
): UseInventoryItemsReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    limit,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  const queryString = params.toString()
  const endpoint = `/api/admin/inventory/items${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<InventoryItem[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Inventory items change frequently, cache for 20 seconds
      focusThrottleInterval: 20000,
      onError: (err) => {
        console.error('Error fetching inventory items:', err)
      }
    }
  )

  return {
    items: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}
