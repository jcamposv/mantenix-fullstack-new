/**
 * Approval Evaluation Service
 * Workflow evaluation logic for work order approvals
 */

import { Prisma } from "@prisma/client"
import { AuthorityLimitRepository } from "../repositories/authority-limit.repository"
import { ApprovalRuleRepository } from "../repositories/approval-rule.repository"
import { WorkOrderApprovalRepository } from "../repositories/work-order-approval.repository"
import type {
  ApprovalRequirement,
  ApprovalChain
} from "@/types/work-order-approval.types"
import type {
  WorkOrderPriority,
  WorkOrderType,
  ComponentCriticality
} from "@/types/approval-rule.types"

export class ApprovalEvaluationService {
  /**
   * Evaluate if approval is required for a work order
   */
  static async evaluateApprovalRequirement(
    companyId: string,
    cost: number,
    priority?: WorkOrderPriority,
    type?: WorkOrderType,
    assetCriticality?: ComponentCriticality,
    creatorRoleKey?: string
  ): Promise<ApprovalRequirement> {
    let authorityLimit = null

    if (creatorRoleKey) {
      authorityLimit = await AuthorityLimitRepository.findFirst({
        roleKey: creatorRoleKey,
        companyId,
        isActive: true
      })
    }

    if (!authorityLimit) {
      return { required: false, levels: 0 }
    }

    if (cost <= authorityLimit.maxDirectAuthorization) {
      return { required: false, levels: 0 }
    }

    const matchingRules = await ApprovalRuleRepository.getMatchingRules(
      companyId,
      cost,
      priority || undefined,
      type || undefined,
      assetCriticality || undefined
    )

    if (matchingRules.length === 0) {
      return {
        required: true,
        levels: 1,
        reason: "Costo excede autorización directa sin regla específica"
      }
    }

    const topRule = matchingRules[0]

    return {
      required: true,
      levels: topRule.approvalLevels,
      reason: `Aplica regla: ${topRule.name}`,
      matchedRule: topRule
    }
  }

  /**
   * Create approval chain for work order
   */
  static async createApprovalChain(
    workOrderId: string,
    levels: number
  ): Promise<void> {
    const approvals: Prisma.WorkOrderApprovalCreateInput[] = []

    for (let level = 1; level <= levels; level++) {
      approvals.push({
        workOrder: { connect: { id: workOrderId } },
        level,
        status: "PENDING"
      })
    }

    for (const approval of approvals) {
      await WorkOrderApprovalRepository.create(approval)
    }
  }

  /**
   * Get approval chain for work order
   */
  static async getApprovalChain(workOrderId: string): Promise<ApprovalChain> {
    const approvals = await WorkOrderApprovalRepository.getByWorkOrder(workOrderId)

    const maxLevel = approvals.reduce((max, a) => Math.max(max, a.level), 0)
    const currentPending = approvals.find(a => a.status === "PENDING")
    const currentLevel = currentPending?.level || maxLevel + 1

    const allApproved = approvals.every(a => a.status === "APPROVED")
    const anyRejected = approvals.some(a => a.status === "REJECTED")

    return {
      workOrderId,
      approvals,
      currentLevel,
      maxLevel,
      isComplete: allApproved || anyRejected,
      canProceed: allApproved
    }
  }

  /**
   * Check if work order can proceed
   */
  static async canProceedWithWorkOrder(workOrderId: string): Promise<boolean> {
    const approvals = await WorkOrderApprovalRepository.getByWorkOrder(workOrderId)

    if (approvals.length === 0) return true

    return approvals.every(a => a.status === "APPROVED")
  }
}
