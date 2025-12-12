"use client"

import { useEffect, useState, useCallback } from "react"

/**
 * Offline Queue Hook
 *
 * Monitors the offline action queue status in IndexedDB
 * Shows pending actions count to the user
 *
 * Following Next.js Expert standards:
 * - Client component only (uses browser APIs)
 * - Type-safe with no `any`
 * - Clean, focused responsibility
 */

interface OfflineQueueStatus {
  pendingCount: number
  isLoading: boolean
  error: string | null
}

const DB_NAME = "mantenix-offline-db"
const STORE_NAME = "offline-actions"

/**
 * Get count of pending offline actions
 */
async function getPendingCount(): Promise<number> {
  // Check if IndexedDB is available
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return 0
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME)

    request.onerror = () => {
      console.error("[Offline Queue] Failed to open DB")
      resolve(0)
    }

    request.onsuccess = () => {
      const db = request.result

      // Check if store exists
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close()
        resolve(0)
        return
      }

      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const countRequest = store.count()

      countRequest.onsuccess = () => {
        resolve(countRequest.result)
      }

      countRequest.onerror = () => {
        console.error("[Offline Queue] Failed to count")
        resolve(0)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    }
  })
}

/**
 * Hook to monitor offline queue status
 *
 * @param refreshInterval - How often to check the queue (ms), default 5000
 * @returns Queue status with pending count
 */
export function useOfflineQueue(
  refreshInterval: number = 5000
): OfflineQueueStatus {
  const [status, setStatus] = useState<OfflineQueueStatus>({
    pendingCount: 0,
    isLoading: true,
    error: null,
  })

  const checkQueue = useCallback(async () => {
    try {
      const count = await getPendingCount()
      setStatus({
        pendingCount: count,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error("[Offline Queue] Error checking queue:", error)
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to check offline queue",
      }))
    }
  }, [])

  // Initial check
  useEffect(() => {
    checkQueue()
  }, [checkQueue])

  // Set up polling
  useEffect(() => {
    const interval = setInterval(() => {
      checkQueue()
    }, refreshInterval)

    return () => {
      clearInterval(interval)
    }
  }, [checkQueue, refreshInterval])

  // Listen for storage events (when queue is updated)
  useEffect(() => {
    const handleStorageChange = () => {
      checkQueue()
    }

    // Listen for custom event from service worker
    window.addEventListener("offline-queue-updated", handleStorageChange)

    return () => {
      window.removeEventListener("offline-queue-updated", handleStorageChange)
    }
  }, [checkQueue])

  return status
}
