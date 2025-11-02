"use client"

import { useState, useEffect } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { FeatureModule } from "@prisma/client"

interface CompanyFeature {
  id: string
  module: FeatureModule
  isEnabled: boolean
}

export const useCompanyFeatures = () => {
  const { user } = useCurrentUser()
  const [features, setFeatures] = useState<CompanyFeature[]>([])
  const [loading, setLoading] = useState(true)

  // Get companyId from either user.profile.companyId or user.company.id
  const companyId = user?.profile?.companyId || user?.company?.id

  console.log("[useCompanyFeatures] Hook render - user:", user, "companyId:", companyId)

  useEffect(() => {
    console.log("[useCompanyFeatures] useEffect triggered - user:", user, "companyId:", companyId)

    const fetchFeatures = async () => {
      if (!companyId) {
        console.log("[useCompanyFeatures] No companyId found for user:", user)
        setLoading(false)
        return
      }

      console.log("[useCompanyFeatures] Fetching features for companyId:", companyId)

      try {
        const response = await fetch(`/api/admin/features/${companyId}`)

        console.log("[useCompanyFeatures] Response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[useCompanyFeatures] Features received:", data)
          setFeatures(data)
        } else {
          console.error("[useCompanyFeatures] Response not ok:", response.status)
        }
      } catch (error) {
        console.error("[useCompanyFeatures] Error fetching company features:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [companyId, user])

  const isFeatureEnabled = (module: FeatureModule): boolean => {
    const feature = features.find((f) => f.module === module)
    return feature?.isEnabled ?? false
  }

  return {
    features,
    loading,
    isFeatureEnabled,
    hasAttendance: isFeatureEnabled("HR_ATTENDANCE"),
    hasVacations: isFeatureEnabled("HR_VACATIONS"),
    hasPermissions: isFeatureEnabled("HR_PERMISSIONS"),
    hasAI: isFeatureEnabled("AI_ASSISTANT"),
    hasAnalytics: isFeatureEnabled("ADVANCED_ANALYTICS")
  }
}
