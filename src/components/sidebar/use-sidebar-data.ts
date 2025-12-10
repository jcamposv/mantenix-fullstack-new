/**
 * Custom hook for sidebar data management
 * Handles user data, navigation items, and company info
 */

import { useMemo } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation"
import { parseCompanyFeatures } from "@/lib/features"
import type { CompanyBranding } from "@/types/branding"
import type { ServerUser, UserPermissions, CompanyFeature } from "./sidebar-types"
import {
  MAIN_NAV_ITEMS,
  SUPER_ADMIN_NAV_ITEMS,
  CLIENT_NAV_ITEMS,
  buildAdminNavigation,
  getMainFeatureNavItems,
  mergeNavigationItems,
} from "@/lib/navigation"
import { getInitials, getAvatarUrl } from "./sidebar-utils"

const FALLBACK_USER = {
  name: "Usuario",
  email: "user@example.com",
  avatar: "/avatars/default.jpg",
  initials: "U",
}

interface UseSidebarDataProps {
  companyBranding?: CompanyBranding | null
  serverUser?: ServerUser | null
  userPermissions?: UserPermissions
  companyFeatures?: CompanyFeature[] | null
  serverUserPermissions?: string[] | null
}

export function useSidebarData({ companyBranding, serverUser, userPermissions, companyFeatures, serverUserPermissions }: UseSidebarDataProps) {
  const { user, loading } = useCurrentUser()

  // Use server-side data when available, fallback to client-side (from useCurrentUser)
  const isSuperAdmin = userPermissions?.isSuperAdmin ?? user?.isSuperAdmin ?? false
  const isGroupAdmin = userPermissions?.isGroupAdmin ?? user?.isGroupAdmin ?? false
  const isCompanyAdmin = userPermissions?.isCompanyAdmin ?? user?.isCompanyAdmin ?? false
  const effectiveUser = serverUser ?? user
  const effectiveLoading = serverUser ? false : loading

  // Parse company features using centralized helper
  const featureFlags = parseCompanyFeatures(companyFeatures)
  const {
    hasAttendance,
    hasTimeOff,
    hasExternalClientMgmt,
    hasInternalCorporateGroup,
    hasPredictiveMaintenance
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
    // Don't show feature items for external users or super admins
    if (isExternalUser || isSuperAdmin) return []

    const items = getMainFeatureNavItems({
      hasAttendance,
      hasTimeOff,
      hasPredictiveMaintenance,
    })

    return items
  }, [isExternalUser, isSuperAdmin, hasAttendance, hasTimeOff, hasPredictiveMaintenance])

  // Navigation items - different items based on user role
  const navItems = useMemo(() => {
    // SUPER_ADMIN gets minimal nav items (no operational features)
    if (isSuperAdmin) {
      return SUPER_ADMIN_NAV_ITEMS
    }

    // External clients get their own nav items
    if (isExternalUser) {
      return CLIENT_NAV_ITEMS
    }

    // Regular users: merge main nav with feature items
    return mergeNavigationItems(MAIN_NAV_ITEMS, featureNavItems)
  }, [isSuperAdmin, isExternalUser, featureNavItems])

  // Admin items (for super admin, group admin and company admin only, not for external users)
  const adminItems = useMemo(() => {
    if (isExternalUser) return []

    // For regular company/group admins: use new navigation system
    if (!isSuperAdmin) {
      const groups = buildAdminNavigation({
        hasExternalClientMgmt,
        hasAttendance,
        hasTimeOff,
      })

      // Flatten groups and map to NavProjects expected format
      return groups.flatMap(group =>
        group.items.map(item => ({
          name: item.title,
          url: item.url,
          icon: item.icon,
          items: item.items,
        }))
      )
    }

    // For super admins: use SUPER_ADMIN_PANEL_GROUPS
    // Import this from the new navigation system if needed
    // For now, return empty as super admin has their own dashboard
    return []
  }, [isSuperAdmin, isExternalUser, hasExternalClientMgmt, hasAttendance, hasTimeOff])

  // Company info for TeamSwitcher
  const companyInfo = useMemo(() => ({
    name: companyBranding?.name || effectiveUser?.company?.name || "Mantenix",
    logo: companyBranding?.logo || "/images/mantenix-logo-black.svg",
    hasCustomBranding: !!(companyBranding?.logo),
    plan: "Enterprise", // Can be made dynamic based on company tier
  }), [companyBranding, effectiveUser])

  // Apply permission-based and feature-based filtering to navigation items
  // Pass server permissions to avoid client-side fetch delay
  // Pass feature flags to filter items with requiresFeature
  const filteredNavItems = useFilteredNavigation(navItems, serverUserPermissions, featureFlags)
  const filteredAdminItems = useFilteredNavigation(adminItems, serverUserPermissions, featureFlags)

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

