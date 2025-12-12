/**
 * useIndustrialMetrics Hook
 *
 * Fetches industrial maintenance KPIs:
 * - MTBF, MTTR, OEE, Availability
 * - Asset reliability metrics
 *
 * Under 100 lines
 */

'use client'

import useSWR from 'swr'

interface IndustrialMetrics {
  overall: {
    avgMtbf: number
    avgMttr: number
    avgAvailability: number
    avgOee: number
    totalDowntime: number
  }
}

const fetcher = async (url: string): Promise<IndustrialMetrics> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Error al cargar métricas industriales')
  }

  return response.json()
}

export function useIndustrialMetrics(periodPreset: string = 'last_30_days') {
  const url = `/api/analytics/assets?period=${periodPreset}`

  return useSWR(url, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })
}
