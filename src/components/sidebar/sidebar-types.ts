/**
 * Shared types for sidebar components
 */

import type { CompanyBranding } from "@/types/branding"

export interface AvailableCompany {
  id: string
  name: string
  subdomain: string
  logo?: string | null
  isActive: boolean
}

export interface ServerUser {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
  company?: {
    id: string
    name: string
    subdomain: string
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    logo: string | null
    tier: string
  } | null
}

export interface UserPermissions {
  isSuperAdmin: boolean
  isCompanyAdmin: boolean
}

export interface AppSidebarProps {
  companyBranding?: CompanyBranding | null
  availableCompanies?: AvailableCompany[] | null
  serverUser?: ServerUser | null
  userPermissions?: UserPermissions
}

