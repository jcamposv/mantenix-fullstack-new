"use client"

import { useState, useEffect, useMemo } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { parseCompanyFeatures, isFeatureEnabled as checkFeatureEnabled, type CompanyFeature } from "@/lib/features"
import type { FeatureModule } from "@prisma/client"

export const useCompanyFeatures = (serverFeatures?: CompanyFeature[]) => {
  const { user } = useCurrentUser()
  const [features, setFeatures] = useState<CompanyFeature[]>(serverFeatures || [])
  const [loading, setLoading] = useState(!serverFeatures)

  const companyId = user?.profile?.companyId || user?.company?.id

  useEffect(() => {
    if (serverFeatures) {
      setFeatures(serverFeatures)
      setLoading(false)
      return
    }

    const fetchFeatures = async () => {
      if (!companyId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/admin/features/${companyId}`)
        if (response.ok) {
          const data = await response.json()
          setFeatures(data)
        }
      } catch (error) {
        console.error("Error fetching company features:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [companyId, user, serverFeatures])

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
