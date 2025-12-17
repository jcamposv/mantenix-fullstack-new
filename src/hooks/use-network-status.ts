"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import {
  offlineDB,
  isOfflineDBAvailable,
  getPendingMutations,
  updateMutationStatus,
  deleteCompletedMutations,
} from "@/lib/offline-db"

/**
 * Network Status Hook
 *
 * Monitors online/offline connection status
 * Triggers background sync when connection is restored
 * Processes pending mutations from IndexedDB
 *
 * @param registration - Service Worker registration for background sync
 * @returns online status and helper functions
 */
export function useNetworkStatus(
  registration: ServiceWorkerRegistration | null
) {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const syncInProgressRef = useRef(false)

  // ========================================================================
  // SYNC PENDING MUTATIONS
  // ========================================================================

  /**
   * Process all pending mutations from IndexedDB
   * Called when connection is restored
   */
  const syncPendingMutations = useCallback(async (): Promise<number> => {
    if (!isOfflineDBAvailable() || !offlineDB) {
      return 0
    }

    // Prevent concurrent syncs
    if (syncInProgressRef.current) {
      console.log("[Network] Sync already in progress, skipping")
      return 0
    }

    syncInProgressRef.current = true
    setIsSyncing(true)

    const MAX_RETRIES = 3
    let successCount = 0
    let failCount = 0

    try {
      const mutations = await getPendingMutations()

      if (mutations.length === 0) {
        console.log("[Network] No pending mutations to sync")
        return 0
      }

      console.log(`[Network] Syncing ${mutations.length} pending mutations`)

      // Show progress toast
      const toastId = toast.loading(`Sincronizando ${mutations.length} cambio${mutations.length !== 1 ? 's' : ''}...`)

      for (const mutation of mutations) {
        if (!mutation.id) continue

        // Skip if max retries exceeded
        if (mutation.retryCount >= MAX_RETRIES) {
          console.log(`[Network] Mutation ${mutation.id} exceeded max retries, marking as failed`)
          await updateMutationStatus(mutation.id, "failed", "Max retries exceeded")
          failCount++
          continue
        }

        try {
          // Mark as syncing
          await updateMutationStatus(mutation.id, "syncing")

          // Execute the mutation
          const { url, method, body } = mutation.payload
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })

          if (response.ok) {
            // Success - mark as completed
            await updateMutationStatus(mutation.id, "completed")
            successCount++
            console.log(`[Network] Mutation ${mutation.id} synced successfully`)
          } else {
            // Server error - mark as failed with error message
            const errorData = await response.json().catch(() => ({}))
            const errorMessage = errorData.error || `HTTP ${response.status}`
            await updateMutationStatus(mutation.id, "failed", errorMessage)
            failCount++
            console.error(`[Network] Mutation ${mutation.id} failed:`, errorMessage)
          }
        } catch (error) {
          // Network error - increment retry count and keep as pending
          console.error(`[Network] Mutation ${mutation.id} network error:`, error)
          await updateMutationStatus(
            mutation.id,
            "pending",
            error instanceof Error ? error.message : "Network error"
          )
          // Increment retry count manually
          if (offlineDB) {
            const current = await offlineDB.pendingMutations.get(mutation.id)
            if (current) {
              await offlineDB.pendingMutations.update(mutation.id, {
                retryCount: current.retryCount + 1,
              })
            }
          }
          failCount++
        }
      }

      // Clean up completed mutations
      await deleteCompletedMutations()

      // Update toast with result
      toast.dismiss(toastId)
      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} cambio${successCount !== 1 ? 's' : ''} sincronizado${successCount !== 1 ? 's' : ''}`)
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} sincronizado${successCount !== 1 ? 's' : ''}, ${failCount} fallido${failCount !== 1 ? 's' : ''}`)
      } else if (failCount > 0) {
        toast.error(`No se pudieron sincronizar ${failCount} cambio${failCount !== 1 ? 's' : ''}`)
      }

      return successCount
    } catch (error) {
      console.error("[Network] Sync failed:", error)
      toast.error("Error al sincronizar cambios")
      return 0
    } finally {
      syncInProgressRef.current = false
      setIsSyncing(false)
    }
  }, [])

  // ========================================================================
  // BACKGROUND SYNC
  // ========================================================================

  /**
   * Trigger background sync for offline actions via Service Worker
   */
  const triggerBackgroundSync = useCallback(() => {
    if (!registration) {
      console.log("[PWA] No registration available for background sync")
      return
    }

    if (!("sync" in registration)) {
      console.log("[PWA] Background Sync API not supported")
      return
    }

    registration.sync
      .register("sync-offline-actions")
      .then(() => {
        console.log("[PWA] Background sync registered successfully")
      })
      .catch((err) => {
        console.error("[PWA] Background sync registration failed:", err)
      })
  }, [registration])

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Handle online event
   */
  const handleOnline = useCallback(async () => {
    console.log("[PWA] Back online!")
    const wasOfflineBefore = !isOnline
    setIsOnline(true)

    if (wasOfflineBefore) {
      setWasOffline(true)

      // Sync pending mutations from IndexedDB (our Dexie store)
      await syncPendingMutations()

      // Also trigger service worker background sync (for sw-db.ts queue)
      triggerBackgroundSync()

      // Reset wasOffline after 3 seconds
      setTimeout(() => {
        setWasOffline(false)
      }, 3000)
    }
  }, [isOnline, triggerBackgroundSync, syncPendingMutations])

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    console.log("[PWA] Gone offline!")
    setIsOnline(false)
  }, [])

  // ========================================================================
  // LIFECYCLE
  // ========================================================================

  // Setup online/offline listeners
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    isOnline,
    wasOffline,
    isSyncing,
    triggerBackgroundSync,
    syncPendingMutations,
  }
}
