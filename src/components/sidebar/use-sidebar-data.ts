/**
 * Custom hook for sidebar data management
 * Handles user data, navigation items, and company info
 */

import { useMemo } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUserRole } from "@/hooks/useUserRole"
import type { CompanyBranding } from "@/types/branding"
import { BASE_NAV_ITEMS, ADMIN_NAV_ITEMS, FALLBACK_USER } from "./navigation-config"
import { getInitials, getAvatarUrl } from "./sidebar-utils"

interface UseSidebarDataProps {
  companyBranding?: CompanyBranding | null
}

export function useSidebarData({ companyBranding }: UseSidebarDataProps) {
  const { user, loading } = useCurrentUser()
  const { isSuperAdmin, isCompanyAdmin } = useUserRole()

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
    if (!user) return FALLBACK_USER

    return {
      name: user.name,
      email: user.email,
      avatar: getAvatarUrl(user.image, user.name),
      initials: getInitials(user.name),
    }
  }, [user])

  // Navigation items
  const navItems = useMemo(() => BASE_NAV_ITEMS, [])

  // Admin items (for super admin and company admin)
  const adminItems = useMemo(() => {
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
  }, [isSuperAdmin, isCompanyAdmin])

  // Company info for TeamSwitcher
  const companyInfo = useMemo(() => ({
    name: companyBranding?.name || user?.company?.name || "Mantenix",
    logo: companyBranding?.logo || "/images/mantenix-logo-black.svg",
    hasCustomBranding: !!(companyBranding?.logo),
    plan: "Enterprise", // Can be made dynamic based on company tier
  }), [companyBranding, user])

  return {
    currentUser,
    navItems,
    adminItems,
    companyInfo,
    isSuperAdmin,
    isCompanyAdmin,
    loading,
  }
}

