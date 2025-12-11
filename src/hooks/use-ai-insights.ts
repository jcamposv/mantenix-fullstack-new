"use client"

import useSWR from "swr"
import { useState, useCallback, useEffect } from "react"
import type { DateRange } from "react-day-picker"

// ============================================================================
// TYPES
// ============================================================================

export interface AIInsight {
  type: 'trend' | 'alert' | 'recommendation' | 'prediction'
  title: string
  description: string
  severity?: 'info' | 'warning' | 'critical'
  impact?: 'low' | 'medium' | 'high'
  actionable?: boolean
}

export interface AIInsightsResponse {
  summary: string
  insights: AIInsight[]
}

interface UseAIInsightsOptions {
  dateRange?: DateRange
  enabled?: boolean // Allow disabling the hook (e.g., feature not enabled)
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COOLDOWN_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds
const COOLDOWN_KEY = 'ai-insights-last-generated'

// ============================================================================
// FETCHER
// ============================================================================

const fetcher = async (url: string): Promise<AIInsightsResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()

    // Check if feature is disabled
    const isFeatureDisabled =
      error.error?.includes("not enabled") ||
      error.error?.includes("Unauthorized")

    if (isFeatureDisabled) {
      throw new Error("FEATURE_DISABLED")
    }

    throw new Error(error.error || "Error al generar insights")
  }

  return response.json().then(res => res.data)
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch AI insights with cooldown management
 *
 * @param options - Options including dateRange and enabled flag
 * @returns SWR response with AI insights data + cooldown utilities
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   error,
 *   isLoading,
 *   generate,
 *   canGenerate,
 *   cooldownRemaining,
 *   isFeatureEnabled
 * } = useAIInsights({ dateRange })
 * ```
 */
export function useAIInsights(options?: UseAIInsightsOptions) {
  const { dateRange, enabled = true } = options || {}

  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  // Build URL with date range params
  const buildUrl = useCallback((): string | null => {
    if (!enabled || isFeatureEnabled === false) return null

    const params = new URLSearchParams()
    if (dateRange?.from) {
      params.set('dateFrom', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      params.set('dateTo', dateRange.to.toISOString())
    }

    return `/api/client/ai-insights${params.toString() ? `?${params.toString()}` : ''}`
  }, [dateRange, enabled, isFeatureEnabled])

  // Check cooldown status
  const checkCooldown = useCallback((): number => {
    const lastGenerated = localStorage.getItem(COOLDOWN_KEY)
    if (!lastGenerated) return 0

    const timeSinceLastGeneration = Date.now() - parseInt(lastGenerated)
    const remaining = COOLDOWN_DURATION - timeSinceLastGeneration

    return remaining > 0 ? remaining : 0
  }, [])

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      const remaining = checkCooldown()
      setCooldownRemaining(remaining)

      if (remaining > 0) {
        setHasGenerated(true)
      }
    }

    updateCooldown()
    const interval = setInterval(updateCooldown, 1000)

    return () => clearInterval(interval)
  }, [checkCooldown])

  // Check feature availability on mount
  useEffect(() => {
    const checkFeature = async () => {
      try {
        const response = await fetch('/api/client/ai-insights')
        const data = await response.json()

        if (!response.ok) {
          const isDisabled =
            data.error?.includes("not enabled") ||
            data.error?.includes("Unauthorized")
          setIsFeatureEnabled(!isDisabled)
        } else {
          setIsFeatureEnabled(true)
        }
      } catch {
        setIsFeatureEnabled(null)
      }
    }

    checkFeature()
  }, [])

  // Reset state when date range changes
  useEffect(() => {
    setHasGenerated(false)
  }, [dateRange?.from, dateRange?.to])

  // Use SWR with conditional fetching (only when manually triggered)
  const { data, error, isLoading, mutate } = useSWR<AIInsightsResponse, Error>(
    // Don't auto-fetch - only fetch when mutate() is called manually
    hasGenerated ? buildUrl() : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: COOLDOWN_DURATION,
      onSuccess: () => {
        // Set cooldown timestamp on successful generation
        localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
        setCooldownRemaining(COOLDOWN_DURATION)
        setHasGenerated(true)
      },
      onError: (err) => {
        // Check if feature was disabled
        if (err.message === "FEATURE_DISABLED") {
          setIsFeatureEnabled(false)
        }
      }
    }
  )

  // Manual generate function
  const generate = useCallback(async () => {
    // Check cooldown
    const remaining = checkCooldown()
    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60000)
      throw new Error(`Por favor espera ${minutes} minuto${minutes > 1 ? 's' : ''} antes de generar nuevos insights`)
    }

    setHasGenerated(true)

    // Trigger SWR fetch
    await mutate()
  }, [checkCooldown, mutate])

  const canGenerate = cooldownRemaining === 0 && isFeatureEnabled === true
  const isOnCooldown = cooldownRemaining > 0

  return {
    data,
    error: error?.message === "FEATURE_DISABLED" ? null : error,
    isLoading,
    generate,
    mutate,
    canGenerate,
    isOnCooldown,
    cooldownRemaining,
    isFeatureEnabled,
    hasGenerated,
  }
}
