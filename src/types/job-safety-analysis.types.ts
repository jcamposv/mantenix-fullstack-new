/**
 * Job Safety Analysis Types
 * Types for JSA (OSHA compliance)
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"

export type JSAStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"

export interface JSAStep {
  step: number
  description: string
  hazards: string[]
  controls: string[]
}

export interface JobSafetyAnalysis {
  id: string
  workOrderId: string
  preparedBy: string
  reviewedBy: string | null
  approvedBy: string | null
  status: JSAStatus
  jobSteps: JSAStep[]
  hazardsPerStep: Record<string, string[]>
  controlsPerStep: Record<string, string[]>
  preparedAt: string | null
  reviewedAt: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface JobSafetyAnalysisWithRelations extends JobSafetyAnalysis {
  workOrder?: {
    id: string
    code: string
    title: string
    status: string
  }
  preparer?: {
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
  approver?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
}

export interface CreateJobSafetyAnalysisData {
  workOrderId: string
  jobSteps: JSAStep[]
  hazardsPerStep: Record<string, string[]>
  controlsPerStep: Record<string, string[]>
}

export interface UpdateJobSafetyAnalysisData {
  status?: JSAStatus
  jobSteps?: JSAStep[]
  hazardsPerStep?: Record<string, string[]>
  controlsPerStep?: Record<string, string[]>
  reviewedBy?: string
  reviewedAt?: Date
  approvedBy?: string
  approvedAt?: Date
  preparedAt?: Date
}

export interface ReviewJSAData {
  approved: boolean
  comments?: string
}

export interface ApproveJSAData {
  comments?: string
}

export interface RejectJSAData {
  comments: string
}

export interface JobSafetyAnalysisFilters {
  workOrderId?: string
  status?: JSAStatus
  preparedBy?: string
  reviewedBy?: string
  approvedBy?: string
  createdAtFrom?: Date
  createdAtTo?: Date
}

export type PaginatedJobSafetyAnalysesResponse = PaginatedResponse<JobSafetyAnalysisWithRelations>
