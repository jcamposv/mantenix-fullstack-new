"use client"

import { useEffect, useCallback } from "react"

interface AlertData {
  id: string
  title: string
  priority: string
  siteId: string
  [key: string]: any
}

interface UseAlertUpdatesProps {
  onNewAlert?: (alert: AlertData) => void
  onAlertUpdated?: (alert: AlertData) => void
  onRefreshNeeded?: () => void
}

export function useAlertUpdates({ 
  onNewAlert, 
  onAlertUpdated, 
  onRefreshNeeded 
}: UseAlertUpdatesProps) {
  
  const handleNewAlert = useCallback((event: CustomEvent) => {
    console.log('New alert event received:', event.detail)
    
    if (onNewAlert) {
      onNewAlert(event.detail.alert)
    }
    
    if (onRefreshNeeded) {
      onRefreshNeeded()
    }
  }, [onNewAlert, onRefreshNeeded])

  const handleAlertUpdated = useCallback((event: CustomEvent) => {
    console.log('Alert updated event received:', event.detail)
    
    if (onAlertUpdated) {
      onAlertUpdated(event.detail.alert)
    }
    
    if (onRefreshNeeded) {
      onRefreshNeeded()
    }
  }, [onAlertUpdated, onRefreshNeeded])

  useEffect(() => {
    // Listen for custom events dispatched by the useAlerts hook
    window.addEventListener('newAlert', handleNewAlert as EventListener)
    window.addEventListener('alertUpdated', handleAlertUpdated as EventListener)

    return () => {
      window.removeEventListener('newAlert', handleNewAlert as EventListener)
      window.removeEventListener('alertUpdated', handleAlertUpdated as EventListener)
    }
  }, [handleNewAlert, handleAlertUpdated])
}