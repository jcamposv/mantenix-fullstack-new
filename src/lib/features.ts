/**
 * Company Feature Flags Utilities
 */

import { FeatureModule } from "@prisma/client"

export interface CompanyFeature {
  module: FeatureModule
  isEnabled: boolean
}

export interface FeatureFlags {
  hasAttendance: boolean
  hasVacations: boolean
  hasPermissions: boolean
  hasAI: boolean
  hasAnalytics: boolean
  hasExternalClientMgmt: boolean
  hasInternalCorporateGroup: boolean
}

export function parseCompanyFeatures(features: CompanyFeature[] | null | undefined): FeatureFlags {
  if (!features || features.length === 0) {
    return {
      hasAttendance: false,
      hasVacations: false,
      hasPermissions: false,
      hasAI: false,
      hasAnalytics: false,
      hasExternalClientMgmt: false,
      hasInternalCorporateGroup: false,
    }
  }

  return {
    hasAttendance: features.some(f => f.module === 'HR_ATTENDANCE' && f.isEnabled),
    hasVacations: features.some(f => f.module === 'HR_VACATIONS' && f.isEnabled),
    hasPermissions: features.some(f => f.module === 'HR_PERMISSIONS' && f.isEnabled),
    hasAI: features.some(f => f.module === 'AI_ASSISTANT' && f.isEnabled),
    hasAnalytics: features.some(f => f.module === 'ADVANCED_ANALYTICS' && f.isEnabled),
    hasExternalClientMgmt: features.some(f => f.module === 'EXTERNAL_CLIENT_MANAGEMENT' && f.isEnabled),
    hasInternalCorporateGroup: features.some(f => f.module === 'INTERNAL_CORPORATE_GROUP' && f.isEnabled),
  }
}

export function isFeatureEnabled(
  features: CompanyFeature[] | null | undefined,
  module: FeatureModule
): boolean {
  if (!features || features.length === 0) return false
  return features.some(f => f.module === module && f.isEnabled)
}

export function getEnabledFeatures(features: CompanyFeature[] | null | undefined): FeatureModule[] {
  if (!features || features.length === 0) return []
  return features.filter(f => f.isEnabled).map(f => f.module)
}
