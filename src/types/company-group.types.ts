import type { CompanyGroup } from "@prisma/client"

/**
 * CompanyGroup with basic relations
 */
export interface CompanyGroupWithRelations extends CompanyGroup {
  companies?: {
    id: string
    name: string
    subdomain: string
    logo: string | null
  }[]
  _count?: {
    companies: number
    users: number
  }
}

/**
 * CompanyGroup with full details
 */
export interface CompanyGroupWithDetails extends CompanyGroup {
  companies: {
    id: string
    name: string
    subdomain: string
    logo: string | null
    tier: string
    isActive: boolean
    createdAt: string
  }[]
  users?: {
    id: string
    name: string
    email: string
    role: string
  }[]
  _count: {
    companies: number
    users: number
  }
}

/**
 * Basic company group info
 */
export interface CompanyGroupBasicInfo {
  id: string
  name: string
  description: string | null
  shareInventory: boolean
  autoApproveTransfers: boolean
  isActive: boolean
}

/**
 * Create company group data
 */
export interface CreateCompanyGroupData {
  name: string
  description?: string
  logo?: string
  shareInventory?: boolean
  autoApproveTransfers?: boolean
  companyIds?: string[] // Companies to add to the group
}

/**
 * Update company group data
 */
export interface UpdateCompanyGroupData {
  name?: string
  description?: string
  logo?: string
  shareInventory?: boolean
  autoApproveTransfers?: boolean
  isActive?: boolean
  companyIds?: string[]
}

/**
 * Company group filters
 */
export interface CompanyGroupFilters {
  search?: string
  shareInventory?: boolean
  isActive?: boolean
}

/**
 * Paginated company groups response
 */
export interface PaginatedCompanyGroupsResponse {
  companyGroups: CompanyGroupWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Add companies to group data
 */
export interface AddCompaniesToGroupData {
  companyIds: string[]
}

/**
 * Remove companies from group data
 */
export interface RemoveCompaniesFromGroupData {
  companyIds: string[]
}

/**
 * Company group statistics
 */
export interface CompanyGroupStats {
  totalGroups: number
  totalCompanies: number
  averageCompaniesPerGroup: number
  groupsWithSharedInventory: number
}
