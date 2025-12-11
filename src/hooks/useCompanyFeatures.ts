"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { parseCompanyFeatures, isFeatureEnabled as checkFeatureEnabled, type CompanyFeature } from "@/lib/features"
import type { FeatureModule } from "@prisma/client"

const fetcher = async (url: string): Promise<CompanyFeature[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch company features')
  return response.json()
}

export const useCompanyFeatures = (serverFeatures?: CompanyFeature[]) => {
  const { user } = useCurrentUser()
  const companyId = user?.profile?.companyId || user?.company?.id

  // Use SWR only if serverFeatures not provided
  const { data: fetchedFeatures, isLoading } = useSWR<CompanyFeature[]>(
    // Only fetch if we don't have serverFeatures and we have a companyId
    !serverFeatures && companyId ? `/api/admin/features/${companyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 60 seconds (features don't change often)
      // Features rarely change, so we can cache for longer
      focusThrottleInterval: 300000, // 5 minutes
      onError: (error) => {
        console.error("Error fetching company features:", error)
      }
    }
  )

  // Use serverFeatures if provided, otherwise use SWR data
  // Memoize to prevent creating new array reference on every render
  const features = useMemo(
    () => serverFeatures || fetchedFeatures || [],
    [serverFeatures, fetchedFeatures]
  )

  // Loading is false if we have serverFeatures, otherwise use SWR loading state
  const loading = serverFeatures ? false : isLoading

  const featureFlags = useMemo(() => parseCompanyFeatures(features), [features])

  const isFeatureEnabled = (module: FeatureModule): boolean => {
    return checkFeatureEnabled(features, module)
  }

  return {
    features,
    loading,
    isFeatureEnabled,
    ...featureFlags
  }
}
