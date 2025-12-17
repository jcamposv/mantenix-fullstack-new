"use client"

/**
 * Offline Status Banner Component
 *
 * Displays connection and data freshness status for mobile pages.
 * Shows different states:
 * - Offline mode (yellow)
 * - Stale data warning (blue)
 * - Syncing indicator (green pulse)
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Accessible with proper ARIA labels
 * - Consistent with shadcn/ui design system
 */

import { useCallback, useState, useEffect } from "react"
import { WifiOff, RefreshCw, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPendingMutationsCount } from "@/lib/offline-db"

// ============================================================================
// TYPES
// ============================================================================

interface OfflineStatusBannerProps {
  /** Whether the device is currently offline */
  isOffline: boolean
  /** Whether the cached data is stale */
  isStale: boolean
  /** Callback to refresh data */
  onRefresh?: () => Promise<void>
  /** Timestamp of last successful sync */
  lastSyncAt?: number | null
  /** Whether data is currently being refreshed */
  isRefreshing?: boolean
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format relative time for last sync
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "hace un momento"
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * OfflineStatusBanner - Shows connection and sync status
 *
 * @example
 * ```tsx
 * <OfflineStatusBanner
 *   isOffline={isOffline}
 *   isStale={isStale}
 *   onRefresh={refresh}
 *   lastSyncAt={lastSyncAt}
 * />
 * ```
 */
export function OfflineStatusBanner({
  isOffline,
  isStale,
  onRefresh,
  lastSyncAt,
  isRefreshing = false,
  className,
}: OfflineStatusBannerProps) {
  const [pendingCount, setPendingCount] = useState(0)
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false)

  // Check pending mutations count
  useEffect(() => {
    async function checkPending() {
      const count = await getPendingMutationsCount()
      setPendingCount(count)
    }
    checkPending()

    // Poll for updates every 5 seconds
    const interval = setInterval(checkPending, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshingLocal) return
    setIsRefreshingLocal(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshingLocal(false)
    }
  }, [onRefresh, isRefreshingLocal])

  const refreshing = isRefreshing || isRefreshingLocal

  // Don't show anything if online and data is fresh
  if (!isOffline && !isStale && pendingCount === 0) {
    return null
  }

  // ========================================================================
  // OFFLINE BANNER
  // ========================================================================
  if (isOffline) {
    return (
      <div
        className={cn(
          "bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Modo offline
              </span>
              {lastSyncAt && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-2">
                  Ultima sincronizacion: {formatRelativeTime(lastSyncAt)}
                </span>
              )}
            </div>
          </div>

          {/* Pending mutations badge */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3 text-yellow-700 dark:text-yellow-300" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ========================================================================
  // PENDING SYNC BANNER (Online but has pending mutations)
  // ========================================================================
  if (pendingCount > 0) {
    return (
      <div
        className={cn(
          "bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <RefreshCw className="h-4 w-4 text-green-600 dark:text-green-400 animate-spin" />
            </div>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Sincronizando {pendingCount} cambio{pendingCount !== 1 ? "s" : ""}...
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ========================================================================
  // STALE DATA BANNER
  // ========================================================================
  if (isStale) {
    return (
      <div
        className={cn(
          "bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Datos desactualizados
              </span>
              {lastSyncAt && (
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                  {formatRelativeTime(lastSyncAt)}
                </span>
              )}
            </div>
          </div>

          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 px-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
              <span className="ml-1.5 text-xs">Actualizar</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return null
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface OfflineStatusBadgeProps {
  isOffline: boolean
  isStale: boolean
  className?: string
}

/**
 * Compact badge version for inline use
 */
export function OfflineStatusBadge({
  isOffline,
  isStale,
  className,
}: OfflineStatusBadgeProps) {
  if (!isOffline && !isStale) {
    return null
  }

  if (isOffline) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
          "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
          className
        )}
      >
        <WifiOff className="h-3 w-3" />
        <span className="text-xs font-medium">Offline</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
        className
      )}
    >
      <Clock className="h-3 w-3" />
      <span className="text-xs font-medium">Desactualizado</span>
    </div>
  )
}

// ============================================================================
// SYNC SUCCESS TOAST CONTENT
// ============================================================================

interface SyncSuccessProps {
  count: number
}

/**
 * Content for sync success toast
 */
export function SyncSuccessContent({ count }: SyncSuccessProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <span>
        {count} cambio{count !== 1 ? "s" : ""} sincronizado
        {count !== 1 ? "s" : ""}
      </span>
    </div>
  )
}
