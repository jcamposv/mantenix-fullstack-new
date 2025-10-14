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

export interface AppSidebarProps {
  companyBranding?: CompanyBranding | null
  availableCompanies?: AvailableCompany[] | null
}

