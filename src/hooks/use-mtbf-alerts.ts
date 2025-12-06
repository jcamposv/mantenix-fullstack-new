/**
 * useMTBFAlerts Hook
 *
 * Custom hook for fetching and managing MTBF-based maintenance alerts.
 * Follows Next.js Expert standards for custom hooks.
 */

import { useEffect, useState } from 'react'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'

interface UseMTBFAlertsOptions {
  limit?: number
  criticalOnly?: boolean
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseMTBFAlertsResult {
  alerts: MaintenanceAlert[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage MTBF alerts
 */
export function useMTBFAlerts(
  options: UseMTBFAlertsOptions = {}
): UseMTBFAlertsResult {
  const {
    limit = 10,
    criticalOnly = false,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
  } = options

  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(criticalOnly && { critical_only: 'true' }),
      })

      const response = await fetch(`/api/maintenance/alerts?${params}`)
      if (!response.ok) {
        throw new Error('Error al cargar alertas')
      }

      const data = await response.json()
      setAlerts(data.items || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [criticalOnly, limit])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAlerts, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
  }
}
