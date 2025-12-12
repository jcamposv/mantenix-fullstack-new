/**
 * useInventoryItem Hook
 *
 * Custom hook for fetching and managing individual inventory item data.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 *
 * Usage:
 * const { item, loading, error, mutate } = useInventoryItem(itemId)
 */

"use client"

import useSWR from "swr"

export interface InventoryItem {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  subcategory: string | null
  manufacturer: string | null
  model: string | null
  partNumber: string | null
  unit: string
  minStock: number
  maxStock: number | null
  reorderPoint: number
  unitCost: number | null
  lastPurchasePrice: number | null
  images: string[] | null
  companyId: string
  totalQuantity: number
  totalAvailable: number
  totalReserved: number
  isActive: boolean
  company: {
    id: string
    name: string
  }
  stock: Array<{
    id: string
    locationId: string
    locationType: string
    locationName: string
    quantity: number
    reservedQuantity: number
    availableQuantity: number
  }>
  createdAt?: string
  updatedAt?: string
}

interface InventoryItemResponse {
  item?: InventoryItem
  // API might return item directly or wrapped
  id?: string
  name?: string
}

const fetcher = async (url: string): Promise<InventoryItem> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar el item de inventario')
  }
  const data: InventoryItemResponse = await response.json()

  // Handle both response formats: { item: {...} } or direct item
  return (data.item || data) as InventoryItem
}

interface UseInventoryItemOptions {
  // Revalidate on focus (useful for detail pages)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
}

interface UseInventoryItemReturn {
  item: InventoryItem | undefined
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<InventoryItem | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage a single inventory item by ID
 *
 * @param itemId - The ID of the inventory item to fetch
 * @param options - SWR configuration options
 * @returns Inventory item data, loading state, error, and mutate function
 */
export function useInventoryItem(
  itemId: string | null | undefined,
  options: UseInventoryItemOptions = {}
): UseInventoryItemReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
  } = options

  const { data, error, isLoading, mutate, isValidating } = useSWR<InventoryItem>(
    itemId ? `/api/admin/inventory/items/${itemId}` : null,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Inventory items change frequently, cache for 30 seconds
      focusThrottleInterval: 30000,
      onError: (err) => {
        console.error('Error fetching inventory item:', err)
      }
    }
  )

  return {
    item: data,
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}
