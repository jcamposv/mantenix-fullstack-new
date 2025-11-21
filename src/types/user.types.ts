import type { User } from "@prisma/client"
import type { SystemRoleKey } from "@/types/auth.types"
import type { PaginatedResponse } from "@/types/common.types"

export interface UserWithRelations extends User {
  role: {
    id: string
    key: string | null
    name: string
    color: string
  }
  company?: {
    id: string
    name: string
  } | null
  clientCompany?: {
    id: string
    name: string
  } | null
  site?: {
    id: string
    name: string
    address: string | null
  } | null
  _count?: {
    alertsReported: number
    alertsAssigned: number
  }
}

export interface CreateUserData {
  name: string
  email: string
  role: SystemRoleKey
  companyId?: string
  clientCompanyId?: string
  siteId?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: SystemRoleKey
  companyId?: string
  clientCompanyId?: string
  siteId?: string
}

export interface UserFilters {
  role?: SystemRoleKey
  companyId?: string
  clientCompanyId?: string
  siteId?: string
  search?: string
}

export type PaginatedUsersResponse = PaginatedResponse<UserWithRelations>