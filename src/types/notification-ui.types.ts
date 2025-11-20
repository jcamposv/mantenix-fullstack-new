import type { AlertPriority, AlertStatus } from "@prisma/client"

/**
 * UI Types for real-time notifications
 */

export interface AlertNotificationData {
  type: "new_alert" | "alert_updated" | "comment_added"
  alert: {
    id: string
    title: string
    description: string
    priority: AlertPriority
    status: AlertStatus
    reportedBy: {
      id: string
      name: string
    }
    site: {
      name: string
    }
    reportedAt: Date | string
  }
}

export interface SSEMessage {
  type: "connected" | "heartbeat" | "new_alert" | "alert_updated" | "comment_added"
  message?: string
  timestamp: string
  alert?: AlertNotificationData["alert"]
}

export interface NotificationItem {
  id: string
  type: "new_alert" | "alert_updated" | "comment_added"
  title: string
  description: string
  priority: AlertPriority
  timestamp: Date
  read: boolean
  alertId: string
}
