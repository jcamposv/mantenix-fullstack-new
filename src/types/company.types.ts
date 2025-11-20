import type { Company, Tier } from "@prisma/client"
import type { PaginatedResponse } from "@/types/common.types"

export interface CompanyWithRelations extends Company {
  _count?: {
    users: number
    clientCompanies: number
  }
  subscription?: {
    id: string
    planId: string
    plan: {
      id: string
      name: string
      tier: string
    }
  } | null
}

export interface CompanyBranding {
  name: string
  logo: string | null
  logoSmall: string | null
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  customFont: string | null
}

export interface CompanyBasicInfo {
  id: string
  name: string
  subdomain: string
  logo: string | null
  isActive: boolean
}

export interface CreateCompanyData {
  name: string
  subdomain: string
  tier?: Tier
  planId?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  logo?: string | null
  mfaEnforced?: boolean
  ipWhitelist?: string[]
}

export interface UpdateCompanyData {
  name?: string
  subdomain?: string
  tier?: Tier
  planId?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  logo?: string | null
  logoSmall?: string | null
  customFont?: string | null
  mfaEnforced?: boolean
  ipWhitelist?: string[]
  isActive?: boolean
}

export interface CompanyFilters {
  tier?: Tier
  isActive?: boolean
  search?: string
}

export type PaginatedCompaniesResponse = PaginatedResponse<CompanyWithRelations>