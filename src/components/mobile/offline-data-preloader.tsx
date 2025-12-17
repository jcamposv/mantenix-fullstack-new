"use client"

/**
 * Offline Data Preloader Component
 *
 * Silently preloads critical data into IndexedDB when the user is online.
 * This ensures data is available for offline viewing.
 *
 * Preloads:
 * - User's work orders
 * - Company assets
 *
 * Following Next.js Expert standards:
 * - Runs in background without blocking UI
 * - Only preloads when online
 * - Respects existing cache (doesn't re-fetch if fresh)
 */

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import {
  offlineDB,
  isOfflineDBAvailable,
  updateSyncMeta,
  getSyncMeta,
} from "@/lib/offline-db"
import { useServiceWorker } from "@/hooks/use-service-worker"
import { useNetworkStatus } from "@/hooks/use-network-status"

interface OfflineDataPreloaderProps {
  /** Minimum time between preloads in ms (default: 5 minutes) */
  preloadInterval?: number
}

/**
 * OfflineDataPreloader - Silently preloads data for offline use
 *
 * Place this component in the mobile layout to enable background preloading.
 *
 * @example
 * ```tsx
 * // In mobile/layout.tsx
 * <OfflineDataPreloader preloadInterval={5 * 60 * 1000} />
 * ```
 */
export function OfflineDataPreloader({
  preloadInterval = 5 * 60 * 1000, // 5 minutes default
}: OfflineDataPreloaderProps) {
  const pathname = usePathname()
  const { registration } = useServiceWorker(pathname)
  const { isOnline } = useNetworkStatus(registration)
  const isPreloadingRef = useRef(false)
  const lastPreloadRef = useRef<number>(0)

  useEffect(() => {
    // Only preload if:
    // - Online
    // - Not already preloading
    // - Enough time has passed since last preload
    // - IndexedDB is available
    // - On a mobile route
    if (
      !isOnline ||
      isPreloadingRef.current ||
      !isOfflineDBAvailable() ||
      !offlineDB ||
      !pathname?.startsWith("/mobile")
    ) {
      return
    }

    const now = Date.now()
    if (now - lastPreloadRef.current < preloadInterval) {
      return
    }

    async function preloadData() {
      isPreloadingRef.current = true
      lastPreloadRef.current = Date.now()

      try {
        // Check if work orders need preloading
        const woMeta = await getSyncMeta("workOrders")
        const shouldPreloadWO = !woMeta || Date.now() - woMeta.lastSyncAt > preloadInterval

        if (shouldPreloadWO) {
          console.log("[Preloader] Preloading work orders...")
          await preloadWorkOrders()
        }

        // Check if assets need preloading
        const assetMeta = await getSyncMeta("assets")
        const shouldPreloadAssets = !assetMeta || Date.now() - assetMeta.lastSyncAt > preloadInterval

        if (shouldPreloadAssets) {
          console.log("[Preloader] Preloading assets...")
          await preloadAssets()
        }

        console.log("[Preloader] Preload complete")
      } catch (error) {
        console.error("[Preloader] Preload failed:", error)
      } finally {
        isPreloadingRef.current = false
      }
    }

    // Start preload after a short delay to not block initial render
    const timeoutId = setTimeout(preloadData, 2000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isOnline, pathname, preloadInterval])

  // This component renders nothing
  return null
}

/**
 * Preload work orders into IndexedDB
 */
async function preloadWorkOrders(): Promise<void> {
  if (!offlineDB) return

  try {
    const response = await fetch("/api/work-orders/my")
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const workOrders = data.items || []

    if (workOrders.length === 0) {
      console.log("[Preloader] No work orders to preload")
      return
    }

    const now = Date.now()

    // Clear and repopulate
    await offlineDB.workOrders.clear()
    await offlineDB.workOrders.bulkPut(
      workOrders.map((wo: { id: string }) => ({
        id: wo.id,
        data: wo,
        syncedAt: now,
        pendingSync: false,
      }))
    )

    await updateSyncMeta("workOrders", workOrders.length)
    console.log(`[Preloader] Preloaded ${workOrders.length} work orders`)
  } catch (error) {
    console.error("[Preloader] Failed to preload work orders:", error)
  }
}

/**
 * Preload assets into IndexedDB
 */
async function preloadAssets(): Promise<void> {
  if (!offlineDB) return

  try {
    const response = await fetch("/api/admin/assets")
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const assets = data.items || data || []

    if (assets.length === 0) {
      console.log("[Preloader] No assets to preload")
      return
    }

    const now = Date.now()

    // Clear and repopulate
    await offlineDB.assets.clear()
    await offlineDB.assets.bulkPut(
      assets.map((asset: { id: string }) => ({
        id: asset.id,
        data: asset,
        syncedAt: now,
        pendingSync: false,
      }))
    )

    await updateSyncMeta("assets", assets.length)
    console.log(`[Preloader] Preloaded ${assets.length} assets`)
  } catch (error) {
    console.error("[Preloader] Failed to preload assets:", error)
  }
}
