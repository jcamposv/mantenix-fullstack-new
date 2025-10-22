"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useCurrentUser } from "./useCurrentUser"
import { toast } from "sonner"

interface AlertNotification {
  id: string
  title: string
  priority: string
  siteId: string
  siteName: string
  createdAt: string
  read: boolean
}

interface UseAlertsReturn {
  alerts: AlertNotification[]
  unreadCount: number
  loading: boolean
  markAsRead: (alertId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<AlertNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useCurrentUser()
  const eventSourceRef = useRef<EventSource | null>(null)

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/alerts-notifications/alerts')
      
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.notifications)
        setUnreadCount(data.unreadCount)
      } else {
        console.error('Error fetching alerts:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Server-Sent Events connection for real-time updates
  useEffect(() => {
    if (!user) return

    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        // Close existing connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        // Create new SSE connection
        eventSourceRef.current = new EventSource('/api/alerts-notifications/stream')
        
        eventSourceRef.current.onopen = () => {
          console.log('SSE connected for alerts')
        }

        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'connected' || data.type === 'heartbeat') {
              return // Ignore connection and heartbeat messages
            }
            
            if (data.type === 'new_alert') {
              console.log('New alert received:', data.alert)
              
              // Add new alert notification
              const newAlert: AlertNotification = {
                id: data.alert.id,
                title: data.alert.title,
                priority: data.alert.priority,
                siteId: data.alert.siteId,
                siteName: data.alert.site?.name || 'Sede desconocida',
                createdAt: data.alert.reportedAt,
                read: false
              }
              
              setAlerts(prev => [newAlert, ...prev])
              setUnreadCount(prev => prev + 1)
              
              // Show toast notification based on priority
              const toastType = data.alert.priority === 'CRITICAL' ? 'error' : 
                               data.alert.priority === 'HIGH' ? 'warning' : 'info'
              
              toast[toastType](`Nueva alerta: ${data.alert.title}`, {
                description: `Prioridad: ${data.alert.priority} - ${newAlert.siteName}`,
                action: {
                  label: "Ver",
                  onClick: () => window.open(`/alerts/${data.alert.id}`, '_blank')
                }
              })

              // Trigger custom event for other components to listen
              window.dispatchEvent(new CustomEvent('newAlert', { 
                detail: { alert: data.alert } 
              }))
            }
            
            if (data.type === 'alert_updated') {
              console.log('Alert updated:', data.alert)
              // Refetch alerts to get updated data
              fetchAlerts()
              
              // Trigger custom event for list updates
              window.dispatchEvent(new CustomEvent('alertUpdated', { 
                detail: { alert: data.alert } 
              }))
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error)
          }
        }

        eventSourceRef.current.onerror = (error) => {
          console.error('SSE error:', error)
          eventSourceRef.current?.close()
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000)
        }
      } catch (error) {
        console.error('Error creating SSE connection:', error)
        reconnectTimeout = setTimeout(connect, 5000)
      }
    }

    // Initial connection
    connect()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Initial fetch
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Mark alert as read
  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts-notifications/alerts/${alertId}/read`, {
        method: 'POST'
      })

      if (response.ok) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, read: true }
              : alert
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  // Mark all alerts as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/alerts-notifications/alerts/read-all', {
        method: 'POST'
      })

      if (response.ok) {
        setAlerts(prev => 
          prev.map(alert => ({ ...alert, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
    }
  }

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchAlerts
  }
}