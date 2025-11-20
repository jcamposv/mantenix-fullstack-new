"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { SSEMessage, NotificationItem } from "@/types/notification-ui.types"

interface UseNotificationsOptions {
  enabled?: boolean
  onNewAlert?: (alert: NotificationItem) => void
}

interface UseNotificationsReturn {
  notifications: NotificationItem[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const STORAGE_KEY = "mantenix_notifications"
const MAX_STORED_NOTIFICATIONS = 50

/**
 * Custom hook for real-time notifications via Server-Sent Events (SSE)
 *
 * @param options - Configuration options
 * @returns Notifications state and control functions
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { enabled = true, onNewAlert } = options

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as NotificationItem[]
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(withDates)
      } catch (error) {
        console.error("Failed to parse stored notifications:", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      // Keep only the most recent MAX_STORED_NOTIFICATIONS
      const toStore = notifications
        .slice(0, MAX_STORED_NOTIFICATIONS)
        .map(n => ({
          ...n,
          timestamp: n.timestamp.toISOString()
        }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    }
  }, [notifications])

  const addNotification = useCallback((item: NotificationItem) => {
    setNotifications(prev => [item, ...prev].slice(0, MAX_STORED_NOTIFICATIONS))
    onNewAlert?.(item)
  }, [onNewAlert])

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as SSEMessage

      if (data.type === "connected") {
        setIsConnected(true)
        console.log("SSE connected:", data.message)
      } else if (data.type === "heartbeat") {
        // Keep connection alive
      } else if (data.type === "new_alert" && data.alert) {
        const alert = data.alert
        const notification: NotificationItem = {
          id: alert.id,
          type: "new_alert",
          title: alert.title,
          description: `Nueva alerta ${alert.priority} en ${alert.site.name}`,
          priority: alert.priority,
          timestamp: new Date(alert.reportedAt),
          read: false,
          alertId: alert.id
        }

        addNotification(notification)

        // Show toast based on priority
        const priorityEmoji = {
          CRITICAL: "🔴",
          HIGH: "🟠",
          MEDIUM: "🟡",
          LOW: "🟢"
        }

        toast.info(`${priorityEmoji[alert.priority]} ${alert.title}`, {
          description: `Reportado por ${alert.reportedBy.name}`,
          action: {
            label: "Ver",
            onClick: () => {
              window.location.href = `/alerts/${alert.id}`
            }
          }
        })
      } else if (data.type === "alert_updated" && data.alert) {
        const alert = data.alert
        const notification: NotificationItem = {
          id: `${alert.id}-updated-${Date.now()}`,
          type: "alert_updated",
          title: alert.title,
          description: `Alerta actualizada: ${alert.status}`,
          priority: alert.priority,
          timestamp: new Date(),
          read: false,
          alertId: alert.id
        }

        addNotification(notification)

        toast.info("Alerta actualizada", {
          description: alert.title
        })
      }
    } catch (error) {
      console.error("Failed to parse SSE message:", error)
    }
  }, [addNotification])

  const connectToSSE = useCallback(() => {
    if (!enabled) return

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log("Connecting to SSE...")

    const eventSource = new EventSource("/api/alerts-notifications/stream")

    eventSource.onmessage = handleSSEMessage

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      setIsConnected(false)
      eventSource.close()

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect...")
        connectToSSE()
      }, 5000)
    }

    eventSourceRef.current = eventSource
  }, [enabled, handleSSEMessage])

  // Connect to SSE on mount
  useEffect(() => {
    if (enabled) {
      connectToSSE()
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [enabled, connectToSSE])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}
