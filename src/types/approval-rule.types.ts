/**
 * Approval Rule Types
 * Types for configurable approval trigger rules
 */

import type { PaginatedResponse } from "./common.types"

export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type WorkOrderType = "PREVENTIVE" | "CORRECTIVE" | "PREDICTIVE" | "INSPECTION" | "MODIFICATION"
export type ComponentCriticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface ApprovalRule {
  id: string
  companyId: string
  name: string
  description: string | null
  minCost: number | null
  maxCost: number | null
  priority: WorkOrderPriority | null
  type: WorkOrderType | null
  assetCriticality: ComponentCriticality | null
  approvalLevels: number
  requiresQA: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApprovalRuleWithRelations extends ApprovalRule {
  requiresQA: boolean // Explicitly include to ensure type inference
  company?: {
    id: string
    name: string
    subdomain: string
  }
}

export interface CreateApprovalRuleData {
  name: string
  description?: string
  minCost?: number
  maxCost?: number
  priority?: WorkOrderPriority
  type?: WorkOrderType
  assetCriticality?: ComponentCriticality
  approvalLevels: number
  requiresQA?: boolean
  isActive?: boolean
}

export interface UpdateApprovalRuleData {
  name?: string
  description?: string
  minCost?: number | null
  maxCost?: number | null
  priority?: WorkOrderPriority | null
  type?: WorkOrderType | null
  assetCriticality?: ComponentCriticality | null
  approvalLevels?: number
  requiresQA?: boolean
  isActive?: boolean
}

export interface ApprovalRuleFilters {
  search?: string
  priority?: WorkOrderPriority
  type?: WorkOrderType
  isActive?: boolean
  minCostFrom?: number
  minCostTo?: number
}

export type PaginatedApprovalRulesResponse = PaginatedResponse<ApprovalRuleWithRelations>
