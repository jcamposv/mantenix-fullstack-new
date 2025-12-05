"use client"

import { useEffect, useState, useCallback } from "react"

/**
 * Network Status Hook
 *
 * Monitors online/offline connection status
 * Triggers background sync when connection is restored
 *
 * @param registration - Service Worker registration for background sync
 * @returns online status and helper functions
 */
export function useNetworkStatus(
  registration: ServiceWorkerRegistration | null
) {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  // Trigger background sync for offline actions
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

  // Handle online event
  const handleOnline = useCallback(() => {
    console.log("[PWA] Back online!")
    setIsOnline(true)

    // Track that we were offline to show reconnection message if needed
    if (!isOnline) {
      setWasOffline(true)

      // Trigger background sync if available
      triggerBackgroundSync()

      // Reset wasOffline after 3 seconds
      setTimeout(() => {
        setWasOffline(false)
      }, 3000)
    }
  }, [isOnline, triggerBackgroundSync])

  // Handle offline event
  const handleOffline = useCallback(() => {
    console.log("[PWA] Gone offline!")
    setIsOnline(false)
  }, [])

  

  // Handle online event
  const handleOnlineWithSync = useCallback(() => {
    handleOnline()
  }, [handleOnline])

  // Setup online/offline listeners
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineWithSync)
    window.addEventListener("offline", handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnlineWithSync)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnlineWithSync, handleOffline])

  return {
    isOnline,
    wasOffline,
    triggerBackgroundSync,
  }
}
