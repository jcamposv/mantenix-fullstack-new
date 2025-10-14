import type { User, Role } from "@prisma/client"

export interface UserWithRelations extends User {
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
    address: string
  } | null
  _count?: {
    alertsReported: number
    alertsAssigned: number
  }
}

export interface CreateUserData {
  name: string
  email: string
  role: Role
  companyId?: string
  clientCompanyId?: string
  siteId?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: Role
  companyId?: string
  clientCompanyId?: string
  siteId?: string
}

export interface UserFilters {
  role?: Role
  companyId?: string
  clientCompanyId?: string
  siteId?: string
  search?: string
}

export interface PaginatedUsersResponse {
  users: UserWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}