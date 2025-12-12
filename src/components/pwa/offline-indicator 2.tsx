"use client"

import { WifiOff, Clock } from "lucide-react"
import { useOfflineQueue } from "@/hooks/use-offline-queue"

interface OfflineIndicatorProps {
  isVisible: boolean
}

/**
 * Offline Indicator Component
 *
 * Displays a banner when the app is offline
 * Shows pending actions count from the offline queue
 * Only shown on mobile routes
 *
 * Following Next.js Expert standards:
 * - Client component with proper type safety
 * - Uses custom hook for business logic
 * - Clean, focused UI component
 */
export function OfflineIndicator({ isVisible }: OfflineIndicatorProps) {
  const { pendingCount } = useOfflineQueue()

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium z-50 shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-5 h-5 animate-pulse" />
        <span>Sin conexión - Trabajando offline</span>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-amber-600 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">{pendingCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}
