import type { CompanyFeature, FeatureModule, Company, User } from "@prisma/client"

// ============================================================================
// COMPANY FEATURE TYPES
// ============================================================================

export interface CompanyFeatureWithRelations extends CompanyFeature {
  company: Pick<Company, "id" | "name">
  enabledByUser?: Pick<User, "id" | "name"> | null
}

export interface CreateFeatureData {
  companyId: string
  module: FeatureModule
  isEnabled?: boolean
  enabledBy?: string
}

export interface UpdateFeatureData {
  isEnabled?: boolean
  disabledBy?: string
  disabledAt?: Date
}

export interface FeatureToggleData {
  companyId: string
  module: FeatureModule
  isEnabled: boolean
  changedBy: string
}

export interface CompanyFeaturesMap {
  [key: string]: boolean // module name -> isEnabled
}

export interface FeatureFilters {
  companyId?: string
  module?: FeatureModule
  isEnabled?: boolean
}

export interface PaginatedFeaturesResponse {
  features: CompanyFeatureWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}
