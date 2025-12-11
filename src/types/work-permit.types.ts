/**
 * Work Permit Types
 * Types for work permits (OSHA compliance)
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"

export type PermitType =
  | "HOT_WORK"
  | "CONFINED_SPACE"
  | "ELECTRICAL"
  | "HEIGHT_WORK"
  | "EXCAVATION"
  | "CHEMICAL"
  | "RADIATION"
  | "GENERAL"

export type PermitStatus =
  | "DRAFT"
  | "PENDING_AUTHORIZATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "CLOSED"
  | "EXPIRED"

export interface WorkPermit {
  id: string
  workOrderId: string
  permitType: PermitType
  issuedBy: string
  authorizedBy: string | null
  status: PermitStatus
  validFrom: string
  validUntil: string
  location: string
  hazards: string[]
  precautions: string[]
  ppe: string[]
  emergencyContact: string | null
  issuedAt: string | null
  authorizedAt: string | null
  closedAt: string | null
  createdAt: string
}

export interface WorkPermitWithRelations extends WorkPermit {
  workOrder?: {
    id: string
    number: string
    title: string
    status: string
  }
  issuer?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  }
  authorizer?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
}

export interface CreateWorkPermitData {
  workOrderId: string
  permitType: PermitType
  validFrom: Date
  validUntil: Date
  location: string
  hazards: string[]
  precautions: string[]
  ppe: string[]
  emergencyContact?: string
}

export interface UpdateWorkPermitData {
  permitType?: PermitType
  status?: PermitStatus
  validFrom?: Date
  validUntil?: Date
  location?: string
  hazards?: string[]
  precautions?: string[]
  ppe?: string[]
  emergencyContact?: string | null
  authorizedBy?: string
  authorizedAt?: Date
  closedAt?: Date
}

export interface AuthorizePermitData {
  comments?: string
}

export interface ClosePermitData {
  comments?: string
}

export interface WorkPermitFilters {
  workOrderId?: string
  permitType?: PermitType
  status?: PermitStatus
  issuedBy?: string
  location?: string
  validFromStart?: Date
  validFromEnd?: Date
}

export type PaginatedWorkPermitsResponse = PaginatedResponse<WorkPermitWithRelations>
