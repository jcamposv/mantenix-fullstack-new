/**
 * Custom hook for sidebar data management
 * Handles user data, navigation items, and company info
 */

import { useMemo } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUserRole } from "@/hooks/useUserRole"
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation"
import { parseCompanyFeatures } from "@/lib/features"
import type { CompanyBranding } from "@/types/branding"
import type { ServerUser, UserPermissions, CompanyFeature } from "./sidebar-types"
import { BASE_NAV_ITEMS, SUPER_ADMIN_NAV_ITEMS, CLIENT_NAV_ITEMS, ADMIN_NAV_ITEMS, FALLBACK_USER, getFeatureNavItems } from "./navigation-config"
import { getInitials, getAvatarUrl } from "./sidebar-utils"

interface UseSidebarDataProps {
  companyBranding?: CompanyBranding | null
  serverUser?: ServerUser | null
  userPermissions?: UserPermissions
  companyFeatures?: CompanyFeature[] | null
}

export function useSidebarData({ companyBranding, serverUser, userPermissions, companyFeatures }: UseSidebarDataProps) {
  const { user, loading } = useCurrentUser()
  const { isSuperAdmin: clientIsSuperAdmin, isGroupAdmin: clientIsGroupAdmin, isCompanyAdmin: clientIsCompanyAdmin } = useUserRole()

  // Use server-side data when available, fallback to client-side
  const isSuperAdmin = userPermissions?.isSuperAdmin ?? clientIsSuperAdmin
  const isGroupAdmin = userPermissions?.isGroupAdmin ?? clientIsGroupAdmin
  const isCompanyAdmin = userPermissions?.isCompanyAdmin ?? clientIsCompanyAdmin
  const effectiveUser = serverUser ?? user
  const effectiveLoading = serverUser ? false : loading

  // Parse company features using centralized helper
  const featureFlags = parseCompanyFeatures(companyFeatures)
  const {
    hasAttendance,
    hasVacations,
    hasPermissions,
    hasExternalClientMgmt,
    hasInternalCorporateGroup
  } = featureFlags

  // Debug logs
  if (process.env.NODE_ENV === 'development') {
    console.log('Sidebar Data:', {
      isSuperAdmin,
      isGroupAdmin,
      isCompanyAdmin,
      userRole: effectiveUser?.role,
      hasUser: !!effectiveUser,
      serverUser: !!serverUser,
      userPermissions,
      hasExternalClientMgmt,
      hasInternalCorporateGroup,
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

    const items = getFeatureNavItems({
      hasAttendance,
      hasVacations,
      hasPermissions,
      hasExternalClientMgmt,
      hasInternalCorporateGroup
    })

    return items
  }, [isExternalUser, hasAttendance, hasVacations, hasPermissions, hasExternalClientMgmt, hasInternalCorporateGroup])

  // Navigation items - different items based on user role
  const navItems = useMemo(() => {
    let baseItems: typeof BASE_NAV_ITEMS | typeof SUPER_ADMIN_NAV_ITEMS | typeof CLIENT_NAV_ITEMS = BASE_NAV_ITEMS

    // SUPER_ADMIN gets minimal nav items (no operational features)
    if (isSuperAdmin) {
      baseItems = SUPER_ADMIN_NAV_ITEMS
    }
    // External clients get their own nav items
    else if (isExternalUser) {
      baseItems = CLIENT_NAV_ITEMS
    }

    // Merge base items with feature items (features not shown for SUPER_ADMIN)
    return [...baseItems, ...(isSuperAdmin ? [] : featureNavItems)]
  }, [isSuperAdmin, isExternalUser, featureNavItems])

  // Admin items (for super admin, group admin and company admin only, not for external users)
  const adminItems = useMemo(() => {
    if (isExternalUser) return []

    let items: typeof ADMIN_NAV_ITEMS = []

    if (isSuperAdmin) {
      // Super admins can see items marked as SUPER_ADMIN
      items = ADMIN_NAV_ITEMS.filter(item =>
        item.role === "SUPER_ADMIN"
      )
    } else if (isGroupAdmin) {
      // Group admins can see the SAME items as company admins (they're a superior role)
      // They see items for the company of the subdomain they're currently on
      items = ADMIN_NAV_ITEMS.filter(item => {
        if (item.role !== "ADMIN_EMPRESA") return false

        // Filter items that require specific features
        if ('requiresFeature' in item) {
          if (item.requiresFeature === "EXTERNAL_CLIENT_MANAGEMENT") {
            return hasExternalClientMgmt
          }
          // Add more feature checks here as needed
          return false
        }

        return true
      })
    } else if (isCompanyAdmin) {
      // Company admins can see items marked as ADMIN_EMPRESA
      items = ADMIN_NAV_ITEMS.filter(item => {
        if (item.role !== "ADMIN_EMPRESA") return false

        // Filter items that require specific features
        if ('requiresFeature' in item) {
          if (item.requiresFeature === "EXTERNAL_CLIENT_MANAGEMENT") {
            return hasExternalClientMgmt
          }
          // Add more feature checks here as needed
          return false
        }

        return true
      })
    }

    // Debug admin items
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin Items:', {
        isSuperAdmin,
        isGroupAdmin,
        isCompanyAdmin,
        isExternalUser,
        hasExternalClientMgmt,
        itemsCount: items.length,
        items: items.map(i => ({ name: i.name, role: i.role }))
      })
    }

    return items
  }, [isSuperAdmin, isGroupAdmin, isCompanyAdmin, isExternalUser, hasExternalClientMgmt])

  // Company info for TeamSwitcher
  const companyInfo = useMemo(() => ({
    name: companyBranding?.name || effectiveUser?.company?.name || "Mantenix",
    logo: companyBranding?.logo || "/images/mantenix-logo-black.svg",
    hasCustomBranding: !!(companyBranding?.logo),
    plan: "Enterprise", // Can be made dynamic based on company tier
  }), [companyBranding, effectiveUser])

  // Apply permission-based filtering to navigation items
  const filteredNavItems = useFilteredNavigation(navItems)
  const filteredAdminItems = useFilteredNavigation(adminItems)

  return {
    currentUser,
    navItems: filteredNavItems,
    adminItems: filteredAdminItems,
    companyInfo,
    isSuperAdmin,
    isGroupAdmin,
    isCompanyAdmin,
    isExternalUser,
    loading: effectiveLoading,
  }
}

