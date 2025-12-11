/**
 * Authority Limit Types
 * Types for role-based authorization limits
 */

import type { PaginatedResponse } from "./common.types"

export interface AuthorityLimit {
  id: string
  companyId: string
  roleKey: string
  maxDirectAuthorization: number
  canCreateWorkOrders: boolean
  canAssignDirectly: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthorityLimitWithRelations extends AuthorityLimit {
  company?: {
    id: string
    name: string
    subdomain: string
  }
}

export interface CreateAuthorityLimitData {
  roleKey: string
  maxDirectAuthorization: number
  canCreateWorkOrders?: boolean
  canAssignDirectly?: boolean
  isActive?: boolean
}

export interface UpdateAuthorityLimitData {
  roleKey?: string
  maxDirectAuthorization?: number
  canCreateWorkOrders?: boolean
  canAssignDirectly?: boolean
  isActive?: boolean
}

export interface AuthorityLimitFilters {
  search?: string
  roleKey?: string
  isActive?: boolean
}

export type PaginatedAuthorityLimitsResponse = PaginatedResponse<AuthorityLimitWithRelations>
