"use client"

/**
 * PWA Provider Component
 *
 * Orchestrates PWA functionality by composing specialized hooks
 * - Service Worker registration and updates
 * - Network status monitoring
 * - Offline indicator UI
 *
 * Only active in production and for /mobile routes
 */

import { usePathname } from "next/navigation"
import { useServiceWorker } from "@/hooks/use-service-worker"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { OfflineIndicator } from "./offline-indicator"

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const pathname = usePathname()

  // Register and manage service worker
  const { registration, error } = useServiceWorker(pathname)

  // Monitor network status
  const { isOnline } = useNetworkStatus(registration)

  // Log registration errors
  if (error) {
    console.error("[PWA] Provider error:", error)
  }

  // Show offline indicator only on mobile routes
  const showOfflineIndicator = !isOnline && pathname?.startsWith("/mobile")

  return (
    <>
      {children}
      <OfflineIndicator isVisible={showOfflineIndicator} />
    </>
  )
}
