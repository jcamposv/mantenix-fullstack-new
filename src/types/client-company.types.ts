import type { ClientCompany } from "@prisma/client"
import type { PaginatedResponse } from "@/types/common.types"

export interface ClientCompanyWithRelations extends ClientCompany {
  tenantCompany?: {
    id: string
    name: string
    subdomain: string
  } | null
  createdByUser?: {
    id: string
    name: string
    email: string
  } | null
  sites?: {
    id: string
    name: string
    address: string
  }[]
  externalUsers?: {
    id: string
    name: string
    email: string
  }[]
  _count?: {
    sites: number
    externalUsers: number
  }
}

export interface CreateClientCompanyData {
  name: string
  companyId: string
  address: string
  phone: string
  email: string
  contactName: string
  tenantCompanyId: string
  logo?: string
  latitude?: number
  longitude?: number
  notes?: string
}

export interface UpdateClientCompanyData {
  name?: string
  companyId?: string
  address?: string
  phone?: string
  email?: string
  contactName?: string
  logo?: string
  latitude?: number
  longitude?: number
  notes?: string
}

export interface ClientCompanyFilters {
  tenantCompanyId?: string
  search?: string
  isActive?: boolean
}

export type PaginatedClientCompaniesResponse = PaginatedResponse<ClientCompanyWithRelations>