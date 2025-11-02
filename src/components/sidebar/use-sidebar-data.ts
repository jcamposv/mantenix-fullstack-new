/**
 * Custom hook for sidebar data management
 * Handles user data, navigation items, and company info
 */

import { useMemo } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUserRole } from "@/hooks/useUserRole"
import type { CompanyBranding } from "@/types/branding"
import type { ServerUser, UserPermissions, CompanyFeature } from "./sidebar-types"
import { BASE_NAV_ITEMS, CLIENT_NAV_ITEMS, ADMIN_NAV_ITEMS, FALLBACK_USER, getFeatureNavItems } from "./navigation-config"
import { getInitials, getAvatarUrl } from "./sidebar-utils"

interface UseSidebarDataProps {
  companyBranding?: CompanyBranding | null
  serverUser?: ServerUser | null
  userPermissions?: UserPermissions
  companyFeatures?: CompanyFeature[] | null
}

export function useSidebarData({ companyBranding, serverUser, userPermissions, companyFeatures }: UseSidebarDataProps) {
  const { user, loading } = useCurrentUser()
  const { isSuperAdmin: clientIsSuperAdmin, isCompanyAdmin: clientIsCompanyAdmin } = useUserRole()

  // Use server-side data when available, fallback to client-side
  const isSuperAdmin = userPermissions?.isSuperAdmin ?? clientIsSuperAdmin
  const isCompanyAdmin = userPermissions?.isCompanyAdmin ?? clientIsCompanyAdmin
  const effectiveUser = serverUser ?? user
  const effectiveLoading = serverUser ? false : loading

  // Convert company features array to boolean flags
  const hasAttendance = companyFeatures?.some(f => f.module === 'HR_ATTENDANCE' && f.isEnabled) ?? false
  const hasVacations = companyFeatures?.some(f => f.module === 'HR_VACATIONS' && f.isEnabled) ?? false
  const hasPermissions = companyFeatures?.some(f => f.module === 'HR_PERMISSIONS' && f.isEnabled) ?? false

  // Debug logs
  if (process.env.NODE_ENV === 'development') {
    console.log('Sidebar Data:', {
      isSuperAdmin,
      isCompanyAdmin,
      userRole: user?.role,
      hasUser: !!user,
    })
  }

  // Current user with avatar and initials
  const currentUser = useMemo(() => {
    if (!effectiveUser) return FALLBACK_USER

    return {
      name: effectiveUser.name,
      email: effectiveUser.email,
      avatar: getAvatarUrl(effectiveUser.image ?? null, effectiveUser.name),
      initials: getInitials(effectiveUser.name),
    }
  }, [effectiveUser])

  // Check if user is external client
  const isExternalUser = useMemo(() => {
    const role = effectiveUser?.role
    return role === "CLIENTE_ADMIN_GENERAL" ||
           role === "CLIENTE_ADMIN_SEDE" ||
           role === "CLIENTE_OPERARIO"
  }, [effectiveUser?.role])

  // Generate feature navigation items based on enabled features
  const featureNavItems = useMemo(() => {
    // Don't show feature items for external users
    if (isExternalUser) return []

    console.log("[useSidebarData] Feature flags:", { hasAttendance, hasVacations, hasPermissions })

    const items = getFeatureNavItems({
      hasAttendance,
      hasVacations,
      hasPermissions
    })

    console.log("[useSidebarData] Generated feature nav items:", items)

    return items
  }, [isExternalUser, hasAttendance, hasVacations, hasPermissions])

  // Navigation items - use CLIENT_NAV_ITEMS for external users
  const navItems = useMemo(() => {
    const baseItems = isExternalUser ? CLIENT_NAV_ITEMS : BASE_NAV_ITEMS
    // Merge base items with feature items
    return [...baseItems, ...featureNavItems]
  }, [isExternalUser, featureNavItems])

  // Admin items (for super admin and company admin only, not for external users)
  const adminItems = useMemo(() => {
    if (isExternalUser) return []

    if (isSuperAdmin) {
      // Super admins can see items marked as SUPER_ADMIN or BOTH
      return ADMIN_NAV_ITEMS.filter(item =>
        item.role === "SUPER_ADMIN" || item.role === "BOTH"
      )
    } else if (isCompanyAdmin) {
      // Company admins can see items marked as ADMIN_EMPRESA or BOTH
      return ADMIN_NAV_ITEMS.filter(item =>
        item.role === "ADMIN_EMPRESA" || item.role === "BOTH"
      )
    }
    return []
  }, [isSuperAdmin, isCompanyAdmin, isExternalUser])

  // Company info for TeamSwitcher
  const companyInfo = useMemo(() => ({
    name: companyBranding?.name || effectiveUser?.company?.name || "Mantenix",
    logo: companyBranding?.logo || "/images/mantenix-logo-black.svg",
    hasCustomBranding: !!(companyBranding?.logo),
    plan: "Enterprise", // Can be made dynamic based on company tier
  }), [companyBranding, effectiveUser])

  return {
    currentUser,
    navItems,
    adminItems,
    companyInfo,
    isSuperAdmin,
    isCompanyAdmin,
    isExternalUser,
    loading: effectiveLoading,
  }
}

