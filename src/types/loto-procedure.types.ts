/**
 * LOTO Procedure Types
 * Types for Lock-Out/Tag-Out procedures (OSHA 1910.147)
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"

export type LOTOStatus = "PENDING" | "APPLIED" | "VERIFIED" | "REMOVED"

export interface LOTOProcedure {
  id: string
  workOrderId: string
  assetId: string
  authorizedBy: string
  status: LOTOStatus
  isolationPoints: string[]
  energySources: string[]
  lockSerialNumbers: string[]
  tagNumbers: string[]
  verifiedBy: string | null
  appliedAt: string | null
  verifiedAt: string | null
  removedAt: string | null
  removalAuthorizedBy: string | null
  createdAt: string
}

export interface LOTOProcedureWithRelations extends LOTOProcedure {
  workOrder?: {
    id: string
    code: string
    title: string
    status: string
  }
  asset?: {
    id: string
    name: string
    assetTag: string
  }
  authorized?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  }
  verifier?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
  removalAuthorizer?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
}

export interface CreateLOTOProcedureData {
  workOrderId: string
  assetId: string
  isolationPoints: string[]
  energySources: string[]
  lockSerialNumbers?: string[]
  tagNumbers?: string[]
}

export interface UpdateLOTOProcedureData {
  status?: LOTOStatus
  isolationPoints?: string[]
  energySources?: string[]
  lockSerialNumbers?: string[]
  tagNumbers?: string[]
  verifiedBy?: string
  verifiedAt?: Date
  removedAt?: Date
  removalAuthorizedBy?: string
  appliedAt?: Date
}

export interface ApplyLOTOData {
  lockSerialNumbers: string[]
  tagNumbers: string[]
  comments?: string
}

export interface VerifyLOTOData {
  comments?: string
}

export interface RemoveLOTOData {
  comments?: string
}

export interface LOTOProcedureFilters {
  workOrderId?: string
  assetId?: string
  status?: LOTOStatus
  authorizedBy?: string
  createdAtFrom?: Date
  createdAtTo?: Date
}

export type PaginatedLOTOProceduresResponse = PaginatedResponse<LOTOProcedureWithRelations>
