"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { NotificationBell } from "@/components/notifications/notification-bell"

/**
 * Notification Bell Wrapper Component
 *
 * Client component that wraps the NotificationBell with the useNotifications hook
 * Can be embedded in Server Components
 */
export function NotificationBellWrapper() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    mtbfAlertsCount
  } = useNotifications({
    enabled: true,
    includeMTBFAlerts: true, // Enable MTBF alerts polling
    mtbfRefreshInterval: 60000 // Poll every minute
  })

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      isConnected={isConnected}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClear={clearNotifications}
      mtbfAlertsCount={mtbfAlertsCount}
    />
  )
}
