import type { Company, CompanyTier } from "@prisma/client"

export interface CompanyWithRelations extends Company {
  _count?: {
    users: number
    clientCompanies: number
  }
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
  tier?: CompanyTier
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
  tier?: CompanyTier
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
  tier?: CompanyTier
  isActive?: boolean
  search?: string
}

export interface PaginatedCompaniesResponse {
  companies: CompanyWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}