/**
 * useAsset Hook
 *
 * Custom hook for fetching and managing individual asset data.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 *
 * Usage:
 * const { asset, loading, error, mutate } = useAsset(assetId)
 */

"use client"

import useSWR from "swr"

export interface Asset {
  id: string
  name: string
  code: string
  description: string | null
  location: string
  siteId: string
  status: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  category: string | null
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: string | null
  registrationDate: string
  estimatedLifespan: number | null
  images: string[]
  site: {
    id: string
    name: string
    clientCompany: {
      id: string
      name: string
    }
  }
  _count?: {
    workOrders: number
  }
}

interface AssetResponse {
  asset?: Asset
  // API might return asset directly or wrapped
  id?: string
  name?: string
}

const fetcher = async (url: string): Promise<Asset> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar el activo')
  }
  const data: AssetResponse = await response.json()

  // Handle both response formats: { asset: {...} } or direct asset
  return (data.asset || data) as Asset
}

interface UseAssetOptions {
  // Revalidate on focus (useful for detail pages)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
}

interface UseAssetReturn {
  asset: Asset | undefined
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<Asset | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage a single asset by ID
 *
 * @param assetId - The ID of the asset to fetch
 * @param options - SWR configuration options
 * @returns Asset data, loading state, error, and mutate function
 */
export function useAsset(
  assetId: string | null | undefined,
  options: UseAssetOptions = {}
): UseAssetReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
  } = options

  const { data, error, isLoading, mutate, isValidating } = useSWR<Asset>(
    assetId ? `/api/admin/assets/${assetId}` : null,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Assets don't change super frequently, so we can cache for a bit
      focusThrottleInterval: 60000, // 1 minute cache
      onError: (err) => {
        console.error('Error fetching asset:', err)
      }
    }
  )

  return {
    asset: data,
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}
