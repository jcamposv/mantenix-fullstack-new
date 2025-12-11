/**
 * Root Cause Analysis Types
 * Types for RCA methodologies (5-Why, Fishbone)
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"

export type RCAType = "FIVE_WHY" | "FISHBONE" | "FAULT_TREE" | "PARETO"

export type RCAStatus =
  | "DRAFT"
  | "IN_ANALYSIS"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "IMPLEMENTING"
  | "IMPLEMENTED"
  | "VERIFIED"

export interface FishboneData {
  categories: {
    man?: string[]
    machine?: string[]
    material?: string[]
    method?: string[]
    environment?: string[]
    management?: string[]
  }
}

export interface CorrectiveAction {
  id: string
  description: string
  assignedTo?: string
  dueDate?: string
  status?: string
}

export interface PreventiveAction {
  id: string
  description: string
  assignedTo?: string
  dueDate?: string
  status?: string
}

export interface RootCauseAnalysis {
  id: string
  workOrderId: string
  assetId: string | null
  analysisType: RCAType
  failureMode: string
  immediateSymptom: string
  why1: string | null
  why2: string | null
  why3: string | null
  why4: string | null
  why5: string | null
  rootCause: string | null
  fishboneData: FishboneData | null
  correctiveActions: CorrectiveAction[] | null
  preventiveActions: PreventiveAction[] | null
  analyzedBy: string
  reviewedBy: string | null
  status: RCAStatus
  analyzedAt: string | null
  reviewedAt: string | null
  implementedAt: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RootCauseAnalysisWithRelations extends RootCauseAnalysis {
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
  } | null
  analyzer?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  }
  reviewer?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
  capActions?: Array<{
    id: string
    actionType: string
    description: string
    status: string
  }>
}

export interface CreateRootCauseAnalysisData {
  workOrderId: string
  assetId?: string
  analysisType: RCAType
  failureMode: string
  immediateSymptom: string
  why1?: string
  why2?: string
  why3?: string
  why4?: string
  why5?: string
  rootCause?: string
  fishboneData?: FishboneData
  correctiveActions?: CorrectiveAction[]
  preventiveActions?: PreventiveAction[]
}

export interface UpdateRootCauseAnalysisData {
  analysisType?: RCAType
  failureMode?: string
  immediateSymptom?: string
  why1?: string | null
  why2?: string | null
  why3?: string | null
  why4?: string | null
  why5?: string | null
  rootCause?: string | null
  fishboneData?: FishboneData | null
  correctiveActions?: CorrectiveAction[] | null
  preventiveActions?: PreventiveAction[] | null
  status?: RCAStatus
  reviewedBy?: string
  reviewedAt?: Date
  implementedAt?: Date
  verifiedAt?: Date
}

export interface ReviewRCAData {
  approved: boolean
  comments?: string
}

export interface ApproveRCAData {
  comments?: string
}

export interface RootCauseAnalysisFilters {
  search?: string
  workOrderId?: string
  assetId?: string
  analysisType?: RCAType
  status?: RCAStatus
  analyzedBy?: string
  createdAtFrom?: Date
  createdAtTo?: Date
}

export type PaginatedRootCauseAnalysesResponse = PaginatedResponse<RootCauseAnalysisWithRelations>

// Statistics
export interface RCAStats {
  total: number
  byType: Record<RCAType, number>
  byStatus: Record<RCAStatus, number>
  avgTimeToComplete: number
  topFailureModes: Array<{
    mode: string
    count: number
  }>
}
