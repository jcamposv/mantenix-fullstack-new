import type { Site } from "@prisma/client"
import type { PaginatedResponse } from "@/types/common.types"

export interface SiteWithRelations extends Site {
  clientCompany?: {
    id: string
    name: string
    tenantCompany: {
      id: string
      name: string
      subdomain: string
    }
  } | null
  createdByUser?: {
    id: string
    name: string
    email: string
  } | null
  siteUsers?: {
    id: string
    name: string
    email: string
    role: string
  }[]
  _count?: {
    siteUsers: number
    userInvitations: number
  }
}

export interface CreateSiteData {
  name: string
  address?: string
  phone?: string
  email?: string
  contactName?: string
  latitude?: number
  longitude?: number
  timezone?: string
  notes?: string
  clientCompanyId: string
}

export interface UpdateSiteData {
  name?: string
  address?: string
  phone?: string
  email?: string
  contactName?: string
  latitude?: number
  longitude?: number
  timezone?: string
  notes?: string
}

export interface SiteFilters {
  clientCompanyId?: string
  tenantCompanyId?: string
  search?: string
  isActive?: boolean
}

export type PaginatedSitesResponse = PaginatedResponse<SiteWithRelations>