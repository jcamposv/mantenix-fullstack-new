/**
 * Work Order Approval Types
 * Types for multi-level approval tracking
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"
import type { ApprovalRule } from "./approval-rule.types"

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface WorkOrderApproval {
  id: string
  workOrderId: string
  level: number
  approverId: string | null
  approvedBy: string | null
  status: ApprovalStatus
  comments: string | null
  requiredCost: number | null
  approvedAt: string | null
  rejectedAt: string | null
  createdAt: string
}

export interface WorkOrderApprovalWithRelations extends WorkOrderApproval {
  workOrder?: {
    id: string
    code: string
    title: string
    status: string
  }
  approver?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
  approvedByUser?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
}

export interface CreateWorkOrderApprovalData {
  workOrderId: string
  level: number
  approverId?: string
  requiredCost?: number
}

export interface UpdateWorkOrderApprovalData {
  status?: ApprovalStatus
  comments?: string
  approvedBy?: string
  approvedAt?: Date
  rejectedAt?: Date
}

export interface ApproveWorkOrderData {
  comments?: string
}

export interface RejectWorkOrderData {
  comments: string
}

export interface WorkOrderApprovalFilters {
  workOrderId?: string
  approverId?: string
  status?: ApprovalStatus
  level?: number
  createdAtFrom?: Date
  createdAtTo?: Date
}

export type PaginatedWorkOrderApprovalsResponse = PaginatedResponse<WorkOrderApprovalWithRelations>

// Helper types
export interface ApprovalRequirement {
  required: boolean
  levels: number
  reason?: string
  matchedRule?: ApprovalRule
}

export interface ApprovalChain {
  workOrderId: string
  approvals: WorkOrderApprovalWithRelations[]
  currentLevel: number
  maxLevel: number
  isComplete: boolean
  canProceed: boolean
}
