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
    clearNotifications
  } = useNotifications({
    enabled: true
  })

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      isConnected={isConnected}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClear={clearNotifications}
    />
  )
}
