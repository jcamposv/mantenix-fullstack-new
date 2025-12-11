/**
 * CAP Action Types
 * Types for Corrective and Preventive Actions
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"
import type { WorkOrderPriority } from "./approval-rule.types"

export type ActionType = "CORRECTIVE" | "PREVENTIVE"

export type CAPStatus = "PENDING" | "IN_PROGRESS" | "IMPLEMENTED" | "VERIFIED" | "CLOSED"

export interface CAPAction {
  id: string
  rcaId: string
  actionType: ActionType
  description: string
  assignedTo: string
  priority: WorkOrderPriority
  status: CAPStatus
  dueDate: string | null
  completedAt: string | null
  verifiedAt: string | null
  verifiedBy: string | null
  effectiveness: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CAPActionWithRelations extends CAPAction {
  rca?: {
    id: string
    failureMode: string
    rootCause: string | null
    workOrder?: {
      id: string
      code: string
      title: string
    }
  }
  assigned?: {
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
}

export interface CreateCAPActionData {
  rcaId: string
  actionType: ActionType
  description: string
  assignedTo: string
  priority: WorkOrderPriority
  dueDate?: Date
  notes?: string
}

export interface UpdateCAPActionData {
  actionType?: ActionType
  description?: string
  assignedTo?: string
  priority?: WorkOrderPriority
  status?: CAPStatus
  dueDate?: Date | null
  completedAt?: Date | null
  verifiedAt?: Date | null
  verifiedBy?: string | null
  effectiveness?: number | null
  notes?: string | null
}

export interface CompleteCAPActionData {
  notes?: string
}

export interface VerifyCAPActionData {
  effectiveness: number
  notes?: string
}

export interface CAPActionFilters {
  search?: string
  rcaId?: string
  actionType?: ActionType
  status?: CAPStatus
  assignedTo?: string
  priority?: WorkOrderPriority
  dueDateFrom?: Date
  dueDateTo?: Date
  createdAtFrom?: Date
  createdAtTo?: Date
}

export type PaginatedCAPActionsResponse = PaginatedResponse<CAPActionWithRelations>

// Statistics
export interface CAPAEffectiveness {
  totalActions: number
  completed: number
  verified: number
  avgEffectiveness: number
  byType: {
    corrective: { total: number; avgEffectiveness: number }
    preventive: { total: number; avgEffectiveness: number }
  }
}
