"use client"

import { useEffect, useState, useCallback } from "react"

/**
 * Service Worker Hook
 *
 * Handles service worker registration, updates, and lifecycle management
 * Only registers for /mobile routes in production
 *
 * @param pathname - Current route pathname
 * @returns registration object and helper functions
 */
export function useServiceWorker(pathname: string | null) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Check if service worker should be registered
  const shouldRegister = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production" &&
      pathname?.startsWith("/mobile")
    )
  }, [pathname])

  // Register service worker
  useEffect(() => {
    if (!shouldRegister()) {
      return
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/mobile",
        })

        console.log("[PWA] Service Worker registered successfully:", reg.scope)
        setRegistration(reg)
        setIsRegistered(true)

        // Setup update polling - check every hour
        const updateInterval = setInterval(() => {
          reg.update()
        }, 60 * 60 * 1000)

        // Setup update listener
        reg.addEventListener("updatefound", () => {
          handleUpdateFound(reg)
        })

        // Cleanup interval on unmount
        return () => {
          clearInterval(updateInterval)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Service Worker registration failed")
        console.error("[PWA] Service Worker registration failed:", error)
        setError(error)
        setIsRegistered(false)
      }
    }

    registerSW()
  }, [pathname, shouldRegister])

  // Handle service worker updates
  const handleUpdateFound = useCallback((reg: ServiceWorkerRegistration) => {
    const newWorker = reg.installing

    if (!newWorker) return

    newWorker.addEventListener("statechange", () => {
      if (
        newWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        // New version available
        console.log("[PWA] New version available!")

        // Notify user about update
        const shouldUpdate = confirm(
          "Nueva versión disponible. ¿Actualizar ahora?"
        )

        if (shouldUpdate) {
          newWorker.postMessage({ type: "SKIP_WAITING" })
          window.location.reload()
        }
      }
    })
  }, [])

  // Manual update check
  const checkForUpdates = useCallback(async () => {
    if (!registration) {
      console.warn("[PWA] No registration available for update check")
      return
    }

    try {
      await registration.update()
      console.log("[PWA] Update check completed")
    } catch (err) {
      console.error("[PWA] Update check failed:", err)
    }
  }, [registration])

  // Clear all caches
  const clearCaches = useCallback(async () => {
    if (!registration) {
      console.warn("[PWA] No registration available for cache clearing")
      return
    }

    registration.active?.postMessage({ type: "CLEAR_CACHE" })
    console.log("[PWA] Cache clear request sent")
  }, [registration])

  return {
    registration,
    isRegistered,
    error,
    checkForUpdates,
    clearCaches,
  }
}
