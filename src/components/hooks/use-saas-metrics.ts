import { useEffect, useState } from "react"
import type { SaaSMetrics } from "@/schemas/super-admin"

interface UseSaaSMetricsResult {
  metrics: SaaSMetrics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSaaSMetrics(): UseSaaSMetricsResult {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/super-admin/metrics')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar métricas')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  }
}
