"use client"

/**
 * Offline Data Hook
 *
 * Provides offline-first data fetching with automatic caching to IndexedDB.
 * Falls back to cached data when offline or on network errors.
 *
 * Features:
 * - Automatic IndexedDB caching via Dexie
 * - Network status detection
 * - Stale data indicators
 * - SWR integration for in-memory caching
 *
 * Following Next.js Expert standards:
 * - Client component only (uses browser APIs)
 * - Type-safe with no `any`
 * - Composable with existing hooks
 */

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import {
  offlineDB,
  isOfflineDBAvailable,
  updateSyncMeta,
  getSyncMeta,
  type OfflineWorkOrder,
  type OfflineAsset,
} from "@/lib/offline-db"
import { useNetworkStatus } from "./use-network-status"
import { useServiceWorker } from "./use-service-worker"
import { usePathname } from "next/navigation"

// ============================================================================
// TYPES
// ============================================================================

type StoreKey = "workOrders" | "assets"

interface UseOfflineDataOptions<T> {
  /** SWR cache key - usually the API endpoint */
  key: string
  /** Function to fetch data from the API */
  fetcher: () => Promise<T[]>
  /** Which IndexedDB store to use */
  storeKey: StoreKey
  /** Time in ms before data is considered stale (default: 5 minutes) */
  staleTime?: number
  /** Whether to fetch immediately on mount */
  fetchOnMount?: boolean
}

interface UseOfflineDataResult<T> {
  /** The data array */
  data: T[] | undefined
  /** Error if any occurred */
  error: Error | undefined
  /** Whether data is currently loading */
  isLoading: boolean
  /** Whether the device is offline */
  isOffline: boolean
  /** Whether the cached data is stale */
  isStale: boolean
  /** Timestamp of last sync */
  lastSyncAt: number | null
  /** Function to manually refresh data */
  refresh: () => Promise<void>
}

// ============================================================================
// STORE TYPE MAPPING
// ============================================================================

type StoreDataMap = {
  workOrders: OfflineWorkOrder
  assets: OfflineAsset
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * useOfflineData - Offline-first data fetching hook
 *
 * @example
 * ```tsx
 * const { data, isLoading, isOffline, isStale, refresh } = useOfflineData({
 *   key: '/api/work-orders/my',
 *   fetcher: async () => {
 *     const res = await fetch('/api/work-orders/my')
 *     const data = await res.json()
 *     return data.items || []
 *   },
 *   storeKey: 'workOrders',
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 * })
 * ```
 */
export function useOfflineData<T extends { id: string }>({
  key,
  fetcher,
  storeKey,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  fetchOnMount = true,
}: UseOfflineDataOptions<T>): UseOfflineDataResult<T> {
  const pathname = usePathname()
  const { registration } = useServiceWorker(pathname)
  const { isOnline } = useNetworkStatus(registration)

  const [isStale, setIsStale] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null)

  // ========================================================================
  // OFFLINE FETCHER
  // ========================================================================

  /**
   * Combined fetcher that:
   * 1. If online: fetch from API → save to IndexedDB → return data
   * 2. If offline or error: read from IndexedDB
   */
  const offlineFetcher = useCallback(async (): Promise<T[]> => {
    const dbAvailable = isOfflineDBAvailable()

    // Try network fetch if online
    if (isOnline) {
      try {
        const freshData = await fetcher()

        // Save to IndexedDB if available
        if (dbAvailable && offlineDB && freshData.length > 0) {
          const now = Date.now()

          // Get the appropriate table based on storeKey
          const table = offlineDB[storeKey]

          // Clear old data and insert new
          await table.clear()

          // Bulk insert with proper typing
          const items = freshData.map((item) => ({
            id: item.id,
            data: item,
            syncedAt: now,
            pendingSync: false,
          })) as StoreDataMap[typeof storeKey][]

          await table.bulkPut(items)

          // Update sync metadata
          await updateSyncMeta(storeKey, freshData.length)
          setLastSyncAt(now)
          setIsStale(false)
        }

        return freshData
      } catch (error) {
        console.log(
          `[useOfflineData] Network error for ${key}, falling back to cache:`,
          error
        )
        // Fall through to read from cache
      }
    }

    // Offline or network error: read from IndexedDB
    if (dbAvailable && offlineDB) {
      try {
        const table = offlineDB[storeKey]
        const cached = await table.toArray()

        if (cached.length > 0) {
          // Check if data is stale
          const meta = await getSyncMeta(storeKey)
          if (meta) {
            setLastSyncAt(meta.lastSyncAt)
            setIsStale(Date.now() - meta.lastSyncAt > staleTime)
          }

          // Return the data from cache
          return cached.map((item) => item.data as T)
        }
      } catch (error) {
        console.error(`[useOfflineData] IndexedDB error:`, error)
      }
    }

    // No cached data available
    return []
  }, [isOnline, fetcher, storeKey, key, staleTime])

  // ========================================================================
  // SWR INTEGRATION
  // ========================================================================

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<T[]>(
    fetchOnMount ? key : null,
    offlineFetcher,
    {
      revalidateOnFocus: isOnline,
      revalidateOnReconnect: true,
      revalidateIfStale: isOnline,
      // Don't dedupe when offline to ensure we always read from cache
      dedupingInterval: isOnline ? 5000 : 0,
      // Keep previous data while revalidating
      keepPreviousData: true,
      // Error retry only when online
      shouldRetryOnError: isOnline,
      errorRetryCount: isOnline ? 3 : 0,
    }
  )

  // ========================================================================
  // CHECK STALE ON MOUNT
  // ========================================================================

  useEffect(() => {
    async function checkStaleStatus() {
      if (!isOfflineDBAvailable()) return

      const meta = await getSyncMeta(storeKey)
      if (meta) {
        setLastSyncAt(meta.lastSyncAt)
        setIsStale(Date.now() - meta.lastSyncAt > staleTime)
      } else {
        setIsStale(true)
      }
    }

    checkStaleStatus()
  }, [storeKey, staleTime])

  // ========================================================================
  // REFRESH FUNCTION
  // ========================================================================

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    data,
    error,
    isLoading,
    isOffline: !isOnline,
    isStale,
    lastSyncAt,
    refresh,
  }
}

// ============================================================================
// PRESET HOOKS FOR COMMON USE CASES
// ============================================================================

/**
 * Preset hook for fetching work orders with offline support
 */
export function useOfflineWorkOrders(options?: {
  staleTime?: number
  fetchOnMount?: boolean
}) {
  return useOfflineData({
    key: "/api/work-orders/my",
    fetcher: async () => {
      const res = await fetch("/api/work-orders/my")
      if (!res.ok) throw new Error("Failed to fetch work orders")
      const data = await res.json()
      return data.items || []
    },
    storeKey: "workOrders",
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes for work orders
    fetchOnMount: options?.fetchOnMount ?? true,
  })
}

/**
 * Preset hook for fetching assets with offline support
 */
export function useOfflineAssets(options?: {
  statusFilter?: string
  staleTime?: number
  fetchOnMount?: boolean
}) {
  const statusParam = options?.statusFilter
    ? `?status=${options.statusFilter}`
    : ""

  return useOfflineData({
    key: `/api/admin/assets${statusParam}`,
    fetcher: async () => {
      const res = await fetch(`/api/admin/assets${statusParam}`)
      if (!res.ok) throw new Error("Failed to fetch assets")
      const data = await res.json()
      return data.items || data || []
    },
    storeKey: "assets",
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes for assets
    fetchOnMount: options?.fetchOnMount ?? true,
  })
}
